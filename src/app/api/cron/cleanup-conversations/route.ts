import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Conversation.updateMany(
      { status: 'active', updatedAt: { $lt: cutoff } },
      { $set: { status: 'abandoned' } }
    );
    return Response.json({ success: true, abandoned: result.modifiedCount });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
