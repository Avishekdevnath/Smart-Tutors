import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';
import SiteSettings from '@/models/SiteSettings';
import { searchTuitions, fallbackSearch } from '@/lib/ai-search';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { query, tutorId } = await request.json();

    if (!query?.trim()) {
      return Response.json({ error: 'Search query required' }, { status: 400 });
    }

    const tutor = await Tutor.findById(tutorId).lean();
    if (!tutor) {
      return Response.json({ error: 'Tutor not found' }, { status: 404 });
    }

    const settings = await SiteSettings.findOne();
    const weights = (settings as any)?.searchConfig?.weights || {
      location: 0.30,
      subject: 0.25,
      class: 0.20,
      salary: 0.15,
      medium: 0.05,
      gender: 0.05,
    };

    const tutorProfile = {
      preferredSubjects: (tutor as any).preferredSubjects || [],
      preferredLocation: (tutor as any).preferredLocation || [],
      version: (tutor as any).version || 'BM',
      gender: (tutor as any).gender || '',
    };

    try {
      const results = await searchTuitions(query, tutorProfile, weights);
      return Response.json({ results, parsedQuery: { raw: query } });
    } catch {
      const results = await fallbackSearch(query);
      return Response.json({ results, parsedQuery: { raw: query } });
    }
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
