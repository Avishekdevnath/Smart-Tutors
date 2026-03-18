import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Tuition from '@/models/Tuition';
import { verifyAdminToken } from '@/lib/adminAuth';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Accept either the custom admin-token cookie OR a NextAuth admin session
async function requireAdmin(request: NextRequest) {
  const custom = await verifyAdminToken(request);
  if (custom) return custom;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (user?.isAdmin || user?.userType === 'admin') return user;
  return null;
}

// GET /api/conversations — list conversations (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const intent = searchParams.get('intent');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (intent && intent !== 'all') filter.intent = intent;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(filter),
    ]);

    // Counts by status (for stats bar)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, pendingDrafts, escalated, completedToday, allToday] = await Promise.all([
      Conversation.countDocuments({ createdAt: { $gte: today } }),
      Conversation.countDocuments({
        intent: 'post_tuition',
        status: { $in: ['active', 'escalated'] },
        confirmedByUser: true,
        tuitionId: { $exists: true },
      }),
      Conversation.countDocuments({ status: 'escalated', createdAt: { $gte: today } }),
      Conversation.countDocuments({ status: 'completed', createdAt: { $gte: today } }),
      Conversation.countDocuments({ createdAt: { $gte: today } }),
    ]);

    const successRate = allToday > 0 ? Math.round((completedToday / allToday) * 100) : 0;

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalToday,
        pendingDrafts,
        escalated,
        successRate,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/conversations]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/conversations — publish or reject a conversation (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { conversationId, action, edits, rejectReason } = body;

    if (!conversationId || !action) {
      return NextResponse.json({ error: 'conversationId and action are required' }, { status: 400 });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (action === 'publish') {
      if (!conversation.tuitionId) {
        return NextResponse.json({ error: 'No tuition linked to this conversation' }, { status: 400 });
      }

      const tuition = await Tuition.findById(conversation.tuitionId);
      if (!tuition) {
        return NextResponse.json({ error: 'Linked tuition not found' }, { status: 404 });
      }

      // Apply admin edits to tuition fields
      if (edits && typeof edits === 'object') {
        const allowedFields = [
          'guardianName', 'guardianNumber', 'guardianAddress',
          'class', 'version', 'subjects', 'weeklyDays', 'dailyHours',
          'salary', 'location', 'locationData', 'startMonth',
          'tutorGender', 'specialRemarks', 'urgent',
        ];
        for (const field of allowedFields) {
          if (edits[field] !== undefined) {
            (tuition as any)[field] = edits[field];
          }
        }
      }

      // Change status from 'draft' → 'open' (triggers pre-validate hook to generate code)
      tuition.status = 'open';
      await tuition.save();

      // Mark conversation as completed
      conversation.status = 'completed';
      await conversation.save();

      return NextResponse.json({
        success: true,
        tuition: {
          _id: tuition._id,
          code: tuition.code,
          status: tuition.status,
          guardianName: tuition.guardianName,
          class: tuition.class,
          subjects: tuition.subjects,
        },
      });
    }

    if (action === 'reject') {
      conversation.status = 'abandoned';
      if (rejectReason) {
        conversation.escalationReason = rejectReason;
      }
      await conversation.save();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action. Use publish or reject.' }, { status: 400 });
  } catch (error: any) {
    console.error('[PUT /api/conversations]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
