import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ExtractedData {
  studentClass?: string;
  subjects?: string[];
  location?: {
    division?: string;
    district?: string;
    area?: string;
    subarea?: string;
  };
  medium?: string;
  tutorGender?: string;
  daysPerWeek?: number;
  salary?: { min?: number; max?: number };
  additionalNotes?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface TuitionQuestion {
  field: string;
  question: string;
  required: boolean;
  order: number;
  validationHint: string;
}

export interface KnowledgeArticle {
  topic: string;
  content: string;
}

export interface ChatPersona {
  name: string;
  greeting: string;
  personality: string;
}

export interface ChatConfig {
  persona: ChatPersona;
  tuitionQuestions: TuitionQuestion[];
  salaryGuidance?: boolean;
  confirmationMessage: string;
  successMessage: string;
  resumeMessage: string;
  escalationMessage: string;
  errorMessage: string;
  whatsappNumber: string;
  knowledgeArticles: KnowledgeArticle[];
  maxConversationsPerHour?: number;
}

export interface ChatResponse {
  reply: string;
  intent: 'post_tuition' | 'track_status' | 'faq' | 'support' | null;
  extractedData: ExtractedData;
  completeness: number;
  confirmedByUser: boolean;
  shouldEscalate: boolean;
  shouldCreateDraft: boolean;
}

// ─── System Prompt Builder ──────────────────────────────────────────────────

/**
 * Builds the system prompt that instructs Gemini how to behave as the AI persona.
 * The prompt encodes all persona config, question list, knowledge articles, and
 * structured JSON output requirements.
 */
export function buildSystemPrompt(
  config: ChatConfig,
  currentExtractedData: ExtractedData
): string {
  const { persona, tuitionQuestions, knowledgeArticles, confirmationMessage } = config;

  // Sort questions by order
  const sortedQuestions = [...tuitionQuestions].sort((a, b) => a.order - b.order);

  // Build question list string
  const questionList = sortedQuestions
    .map(
      (q, i) =>
        `  ${i + 1}. field="${q.field}" | required=${q.required} | hint="${q.validationHint}"\n     Question to ask: "${q.question}"`
    )
    .join('\n');

  // Build knowledge base string
  const knowledgeBase =
    knowledgeArticles.length > 0
      ? knowledgeArticles.map((k) => `  [${k.topic}]: ${k.content}`).join('\n')
      : '  (none)';

  // Summarise what is already collected so the AI never re-asks
  const alreadyCollected = Object.entries(currentExtractedData)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join('\n');

  return `
You are ${persona.name}, a smart AI assistant for Smart Tutors — a tuition media platform in Bangladesh.

${persona.personality}

## YOUR MISSION
Help guardians post tuition requests, answer FAQs, track tuition status, and escalate to a real person when needed.

## LANGUAGE HANDLING
- ALWAYS reply in proper Bengali (বাংলা) script. Never use Banglish (romanized Bengali like "ami valo achi").
- Even if the user writes in Banglish or English, your reply must be in Bengali script.
- Exception: Keep subject names and medium names in English (e.g., Math, Physics, English Medium).
- Handle broken words, typos, and misspellings gracefully — never correct the user rudely.
- Be warm, friendly — like a helpful elder brother (বড় ভাই).
- NEVER re-introduce yourself or say your name again after the first message. Just continue the conversation naturally.

## INTENT DETECTION
Classify every message into one of:
- "post_tuition"  — guardian wants to post a tuition (needs a tutor)
- "track_status"  — asking about an existing tuition (e.g., "ST-2345 ki obostha?")
- "faq"           — general question about the platform/service
- "support"       — wants to talk to a real person / admin
- null            — unclear, ask a clarifying question

## TUITION DATA COLLECTION (intent = "post_tuition")
Ask the following questions ONE AT A TIME, in order. Skip any field already provided.
Do NOT re-ask information the user already mentioned — even if given naturally mid-sentence.

Questions to collect (in this order):
${questionList}

RULES:
- Ask only ONE question per reply. Never bundle multiple questions.
- Be warm, conversational, and encouraging — like a helpful elder brother (বড় ভাই tone).
- Validate phone numbers: must match Bangladesh format 01XXXXXXXXX (11 digits, starts with 01).
  If invalid, politely ask again.
- For salary, accept natural input like "3000-4000", "৳3k", "three thousand" — extract numeric min/max.
- For location, extract division/district/area/subarea as best as possible from natural text.
- For medium, map user input to: "Bangla Medium", "English Medium", or "English Version".
- For tutorGender, map to: "male", "female", or "any".
- Once ALL required fields are collected, show a confirmation summary and ask if everything is correct.
  Confirmation message style: "${confirmationMessage}"

## ALREADY COLLECTED DATA (do NOT re-ask these)
${alreadyCollected || '  (nothing collected yet)'}

## COMPLETENESS SCORING
Count the required fields that are collected vs total required fields.
Required fields: ${sortedQuestions.filter((q) => q.required).map((q) => q.field).join(', ')}.
completeness = (collected required fields / total required fields) * 100, rounded to nearest integer.

## CONFIRMATION & DRAFT CREATION
- When the user confirms the summary (says "হ্যাঁ", "yes", "thik ase", "ok", "confirm", "সব ঠিক", etc.),
  set confirmedByUser=true and shouldCreateDraft=true.
- If the user wants to edit a field after seeing the summary, update that field and show the summary again.

## ESCALATION
If the user says they want a real person, mentions "admin", "manager", "human", "কারো সাথে কথা",
"real person", "মানুষ", "স্যার", "call", "phone", "ফোন", or similar — set shouldEscalate=true immediately.
When escalating, your reply should be brief: just say you are connecting them and they will receive contact info shortly. Do NOT say "অপেক্ষা করুন" or "waiting" — the system will provide the contact details automatically.

## KNOWLEDGE BASE (use naturally in conversation when relevant)
${knowledgeBase}

## CRITICAL OUTPUT FORMAT
You MUST respond with a SINGLE valid JSON object and NOTHING else — no markdown, no code fences, no extra text.

{
  "reply": "<your conversational reply to the user>",
  "intent": "<post_tuition | track_status | faq | support | null>",
  "extractedData": {
    "studentClass": "<string or null>",
    "subjects": ["<subject>"],
    "location": {
      "division": "<string or null>",
      "district": "<string or null>",
      "area": "<string or null>",
      "subarea": "<string or null>"
    },
    "medium": "<Bangla Medium | English Medium | English Version | null>",
    "tutorGender": "<male | female | any | null>",
    "daysPerWeek": <number or null>,
    "salary": { "min": <number or null>, "max": <number or null> },
    "additionalNotes": "<string or null>",
    "guardianName": "<string or null>",
    "guardianPhone": "<string or null>"
  },
  "completeness": <0-100>,
  "confirmedByUser": <true | false>,
  "shouldEscalate": <true | false>,
  "shouldCreateDraft": <true | false>
}

Always include ALL keys in extractedData, even if null.
Always merge new data with previously extracted data — never drop a field you already know.
`.trim();
}

// ─── Conversation History Builder ───────────────────────────────────────────

/**
 * Converts stored chat messages into Gemini's expected content parts format.
 * Keeps last 20 messages to stay within context window limits.
 */
function buildConversationHistory(
  messages: ChatMessage[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.slice(-20).map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
}

// ─── JSON Response Parser ────────────────────────────────────────────────────

/**
 * Parses Gemini's text response into a structured ChatResponse.
 * Falls back gracefully if JSON is malformed.
 */
function parseGeminiResponse(
  text: string,
  currentExtractedData: ExtractedData
): ChatResponse {
  // Extract the JSON object — find first { to last } to handle any preamble/postamble Gemini adds
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  const cleaned = jsonStart !== -1 && jsonEnd !== -1
    ? text.slice(jsonStart, jsonEnd + 1)
    : text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Merge extractedData — new values override, but keep existing values for nulls
    const mergedData: ExtractedData = { ...currentExtractedData };
    if (parsed.extractedData) {
      const ed = parsed.extractedData;
      if (ed.studentClass != null) mergedData.studentClass = ed.studentClass;
      if (ed.subjects && ed.subjects.length > 0) mergedData.subjects = ed.subjects;
      if (ed.location) {
        mergedData.location = {
          ...mergedData.location,
          ...(ed.location.division != null && { division: ed.location.division }),
          ...(ed.location.district != null && { district: ed.location.district }),
          ...(ed.location.area != null && { area: ed.location.area }),
          ...(ed.location.subarea != null && { subarea: ed.location.subarea }),
        };
      }
      if (ed.medium != null) mergedData.medium = ed.medium;
      if (ed.tutorGender != null) mergedData.tutorGender = ed.tutorGender;
      if (ed.daysPerWeek != null) mergedData.daysPerWeek = ed.daysPerWeek;
      if (ed.salary) {
        mergedData.salary = {
          ...mergedData.salary,
          ...(ed.salary.min != null && { min: ed.salary.min }),
          ...(ed.salary.max != null && { max: ed.salary.max }),
        };
      }
      if (ed.additionalNotes != null) mergedData.additionalNotes = ed.additionalNotes;
      if (ed.guardianName != null) mergedData.guardianName = ed.guardianName;
      if (ed.guardianPhone != null) mergedData.guardianPhone = ed.guardianPhone;
    }

    return {
      reply: typeof parsed.reply === 'string' ? parsed.reply : text,
      intent: parsed.intent ?? null,
      extractedData: mergedData,
      completeness: typeof parsed.completeness === 'number' ? parsed.completeness : 0,
      confirmedByUser: parsed.confirmedByUser === true,
      shouldEscalate: parsed.shouldEscalate === true,
      shouldCreateDraft: parsed.shouldCreateDraft === true,
    };
  } catch {
    // JSON parse failed — return raw text as reply with unchanged extracted data
    return {
      reply: text,
      intent: null,
      extractedData: currentExtractedData,
      completeness: 0,
      confirmedByUser: false,
      shouldEscalate: false,
      shouldCreateDraft: false,
    };
  }
}

// ─── processMessage ──────────────────────────────────────────────────────────

export async function processMessage(
  userMessage: string,
  config: ChatConfig,
  conversationHistory: ChatMessage[],
  currentExtractedData: ExtractedData = {}
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(config, currentExtractedData);
  const history = buildConversationHistory(conversationHistory);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ],
  });

  const text = completion.choices[0]?.message?.content || '';
  return parseGeminiResponse(text, currentExtractedData);
}

// ─── streamMessage ───────────────────────────────────────────────────────────

/**
 * Streaming version of processMessage using Gemini's streamGenerateContent.
 *
 * Yields token strings as they arrive, then yields a final ChatResponse object.
 * Designed to be consumed by the SSE API route:
 *
 *   for await (const chunk of streamMessage(...)) {
 *     if (typeof chunk === 'string') {
 *       // send SSE event: token
 *     } else {
 *       // send SSE event: done (final state)
 *     }
 *   }
 */
export async function* streamMessage(
  userMessage: string,
  config: ChatConfig,
  conversationHistory: ChatMessage[],
  currentExtractedData: ExtractedData = {}
): AsyncGenerator<string | ChatResponse> {
  const systemPrompt = buildSystemPrompt(config, currentExtractedData);
  const history = buildConversationHistory(conversationHistory);

  // Get full response first (JSON must be complete before parsing)
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ],
  });

  const fullText = completion.choices[0]?.message?.content || '';
  const finalResponse = parseGeminiResponse(fullText, currentExtractedData);

  // Stream reply in small chunks — split on whitespace boundaries only,
  // keeping the delimiter attached so Bengali combining marks never get separated.
  const chunks = finalResponse.reply.split(/(\s+)/);
  for (const chunk of chunks) {
    if (chunk) yield chunk;
  }

  yield finalResponse;
}
