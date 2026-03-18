import { dbConnect } from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne();
    const chatConfig = (settings as any)?.chatConfig || {};
    const persona = chatConfig?.persona || {};

    return Response.json({
      persona: {
        name: persona.name || 'কামরুল',
        greeting:
          persona.greeting ||
          'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?',
      },
    });
  } catch {
    return Response.json({
      persona: { name: 'কামরুল', greeting: 'আসসালামু আলাইকুম!' },
    });
  }
}
