import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    let conversation = await Conversation.findOne({ sessionId: id });
    if (!conversation) {
      conversation = await Conversation.findOne({
        browserSessionId: id,
        status: 'active',
      }).sort({ updatedAt: -1 });
    }

    if (!conversation) {
      return Response.json({ conversation: null });
    }

    return Response.json({ conversation });
  } catch (error) {
    console.error('Chat resume error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
