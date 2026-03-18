import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import TutorRequest from '@/models/TutorRequest';
import { verifyAdminToken } from '@/lib/adminAuth';

async function checkAdmin(request: NextRequest): Promise<boolean> {
  const adminUser = await verifyAdminToken(request);
  if (adminUser) return true;
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    const session = await getServerSession(authOptions as any);
    if (session?.user) return true;
  } catch {
    // ignore
  }
  return false;
}

// PUT — admin only: update a tutor request
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = params;
    const body = await request.json();
    const { action, adminNote, tuitionId } = body;

    const tutorRequest = await TutorRequest.findById(id);
    if (!tutorRequest) {
      return NextResponse.json({ success: false, error: 'Tutor request not found' }, { status: 404 });
    }

    if (action === 'processing') {
      tutorRequest.status = 'processing';
      if (adminNote !== undefined) tutorRequest.adminNote = adminNote;
    } else if (action === 'converted') {
      tutorRequest.status = 'converted';
      if (tuitionId) tutorRequest.tuitionId = tuitionId;
      if (adminNote !== undefined) tutorRequest.adminNote = adminNote;
    } else if (action === 'rejected') {
      tutorRequest.status = 'rejected';
      if (adminNote !== undefined) tutorRequest.adminNote = adminNote;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action. Use: processing, converted, rejected' }, { status: 400 });
    }

    await tutorRequest.save();

    return NextResponse.json({ success: true, tutorRequest });
  } catch (error: any) {
    console.error('TutorRequest PUT error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
