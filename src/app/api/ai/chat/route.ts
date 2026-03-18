import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import SiteSettings from '@/models/SiteSettings';
import Guardian from '@/models/Guardian';
import Tuition from '@/models/Tuition';
import { processMessage, ChatResponse } from '@/lib/ai-chat';

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxPerHour: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= maxPerHour) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // CSRF origin check
    const origin = request.headers.get('origin');
    const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'].filter(Boolean);
    if (origin && !allowedOrigins.includes(origin)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const body = await request.json();
    const { sessionId, browserSessionId, message } = body;

    if (!message?.trim()) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Get chat config from settings
    const settings = await SiteSettings.findOne();
    const chatConfig = (settings as any)?.chatConfig || {};
    const maxConversations = chatConfig.maxConversationsPerHour || 50;

    if (!checkRateLimit(ip, maxConversations)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Find or create conversation
    let conversation = sessionId ? await Conversation.findOne({ sessionId }) : null;

    if (!conversation) {
      conversation = new Conversation({
        sessionId: sessionId || crypto.randomUUID(),
        browserSessionId: browserSessionId || crypto.randomUUID(),
        status: 'active',
        messages: [],
        extractedData: {},
        completeness: 0,
        confirmedByUser: false,
      });
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Build config for AI
    const config = {
      persona: chatConfig.persona || { name: 'কামরুল', greeting: '', personality: '' },
      tuitionQuestions: chatConfig.tuitionQuestions || [],
      confirmationMessage: chatConfig.confirmationMessage || '',
      successMessage: chatConfig.successMessage || '',
      resumeMessage: chatConfig.resumeMessage || '',
      escalationMessage: chatConfig.escalationMessage || '',
      errorMessage: chatConfig.errorMessage || 'একটু সমস্যা হচ্ছে।',
      whatsappNumber: chatConfig.whatsappNumber || '',
      knowledgeArticles: chatConfig.knowledgeArticles || [],
    };

    // Capture conversation state for use inside the stream
    const conversationHistory = conversation.messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    const currentExtractedData = conversation.extractedData || {};

    // SSE streaming response using streamMessage generator
    const encoder = new TextEncoder();
    const conversationRef = conversation;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get full AI response first so we can apply overrides before streaming
          let aiResponse: ChatResponse = await processMessage(
            message, config, conversationHistory, currentExtractedData
          );

          // Handle escalation — override reply with contact info BEFORE streaming
          if (aiResponse.shouldEscalate) {
            const wpNum = config.whatsappNumber;
            const contactLines: string[] = [];
            if (wpNum) {
              contactLines.push(`📱 WhatsApp: https://wa.me/${wpNum}`);
              contactLines.push(`📞 কল করুন: ${wpNum}`);
            }
            aiResponse.reply = contactLines.length > 0
              ? `আমাদের টিমের সাথে সরাসরি যোগাযোগ করুন:\n\n${contactLines.join('\n')}`
              : 'আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।';
            conversationRef.status = 'escalated';
            conversationRef.escalationReason = 'User requested real person';
          }

          // Stream reply word-by-word
          const chunks = aiResponse.reply.split(/(\s+)/);
          for (const chunk of chunks) {
            if (chunk) {
              controller.enqueue(
                encoder.encode(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`)
              );
            }
          }

          // Add assistant reply to conversation
          conversationRef.messages.push({
            role: 'assistant',
            content: aiResponse.reply,
            timestamp: new Date(),
          });

          // Update conversation state
          conversationRef.intent = aiResponse.intent || conversationRef.intent;
          conversationRef.extractedData = aiResponse.extractedData;
          conversationRef.completeness = aiResponse.completeness;
          conversationRef.confirmedByUser = aiResponse.confirmedByUser;

          // Extract phone/name for quick access
          if (aiResponse.extractedData?.guardianPhone) {
            conversationRef.userPhone = aiResponse.extractedData.guardianPhone;
          }
          if (aiResponse.extractedData?.guardianName) {
            conversationRef.userName = aiResponse.extractedData.guardianName;
          }

          // Create draft tuition if confirmed
          if (aiResponse.shouldCreateDraft && aiResponse.confirmedByUser) {
            const data = aiResponse.extractedData;

            let guardian = conversationRef.userPhone
              ? await Guardian.findOne({ number: conversationRef.userPhone })
              : null;

            if (!guardian && conversationRef.userPhone) {
              guardian = await Guardian.create({
                name: conversationRef.userName || 'Unknown',
                number: conversationRef.userPhone,
                address: data?.location
                  ? `${data.location.area || ''}, ${data.location.district || ''}`
                  : '',
              });
            }

            if (guardian) conversationRef.guardianId = guardian._id;

            const tuition = await Tuition.create({
              guardianName: conversationRef.userName || guardian?.name || '',
              guardianNumber: conversationRef.userPhone || guardian?.number || '',
              guardian: guardian?._id,
              class: data?.studentClass || '',
              subjects: data?.subjects || [],
              version: data?.medium || 'Bangla Medium',
              location: data?.location
                ? `${data.location.area || ''}, ${data.location.district || ''}`
                : '',
              locationData: data?.location || {},
              salary: data?.salary || {},
              weeklyDays: data?.daysPerWeek ? String(data.daysPerWeek) : '',
              tutorGender: data?.tutorGender || 'any',
              status: 'draft',
              source: 'chat',
            });

            conversationRef.tuitionId = tuition._id;
            conversationRef.status = 'completed';
          }

          await conversationRef.save();

          // Send final done event
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({
                conversationId: conversationRef.sessionId,
                extractedData: conversationRef.extractedData,
                completeness: conversationRef.completeness,
                status: conversationRef.status,
                intent: conversationRef.intent,
              })}\n\n`
            )
          );
        } catch (err) {
          console.error('Chat stream error:', err);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: 'Stream error' })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
