import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import TutorRequest from '@/models/TutorRequest';
import { verifyAdminToken } from '@/lib/adminAuth';

// POST — public: create a tutor request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { tutorId, tutorName, guardianName, guardianPhone, guardianAddress, studentClass, subjects, message } = body;

    if (!tutorId || !guardianName || !guardianPhone || !studentClass) {
      return NextResponse.json({ success: false, error: 'Missing required fields: tutorId, guardianName, guardianPhone, studentClass' }, { status: 400 });
    }

    const tutorRequest = await TutorRequest.create({
      tutorId,
      tutorName: tutorName || '',
      guardianName,
      guardianPhone,
      guardianAddress: guardianAddress || '',
      studentClass,
      subjects: Array.isArray(subjects) ? subjects : (subjects ? [subjects] : []),
      message: message || '',
    });

    return NextResponse.json({ success: true, tutorRequest }, { status: 201 });
  } catch (error: any) {
    console.error('TutorRequest POST error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

// GET — admin only: list tutor requests
export async function GET(request: NextRequest) {
  try {
    // Admin auth: try verifyAdminToken first, then NextAuth
    let isAdmin = false;
    const adminUser = await verifyAdminToken(request);
    if (adminUser) {
      isAdmin = true;
    } else {
      // Fallback to NextAuth
      try {
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
        const session = await getServerSession(authOptions as any);
        if (session?.user) isAdmin = true;
      } catch {
        // NextAuth not configured or session invalid
      }
    }

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (statusFilter && ['pending', 'processing', 'converted', 'rejected'].includes(statusFilter)) {
      filter.status = statusFilter;
    }

    const [requests, total] = await Promise.all([
      TutorRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      TutorRequest.countDocuments(filter),
    ]);

    // Stats always across all requests
    const [statsTotal, statsPending, statsProcessing, statsConverted] = await Promise.all([
      TutorRequest.countDocuments({}),
      TutorRequest.countDocuments({ status: 'pending' }),
      TutorRequest.countDocuments({ status: 'processing' }),
      TutorRequest.countDocuments({ status: 'converted' }),
    ]);

    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: statsTotal,
        pending: statsPending,
        processing: statsProcessing,
        converted: statsConverted,
      },
    });
  } catch (error: any) {
    console.error('TutorRequest GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
