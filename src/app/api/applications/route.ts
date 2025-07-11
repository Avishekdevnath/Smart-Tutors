import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import TutorTuition from '@/models/TutorTuition';
import Tutor from '@/models/Tutor';
import Tuition from '@/models/Tuition';

// GET /api/applications - Get applications with optional filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutor');
    const tuitionId = searchParams.get('tuition');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    let filter: any = {};
    
    if (tutorId) filter.tutor = tutorId;
    if (tuitionId) filter.tuition = tuitionId;
    if (status) filter.status = status;

    const applications = await TutorTuition.find(filter)
      .populate('tutor', 'tutorId name phone email universityShortForm version group')
      .populate('tuition', 'tuitionId studentClass subject location salary status')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await TutorTuition.countDocuments(filter);

    return NextResponse.json({
      applications,
      total,
      hasMore: skip + limit < total
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/applications - Create new application (tutor applies to tuition)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { tutorId, tuitionId, message } = body;

    if (!tutorId || !tuitionId) {
      return NextResponse.json({ error: 'Tutor ID and Tuition ID are required' }, { status: 400 });
    }

    // Verify tutor and tuition exist
    const tutor = await Tutor.findById(tutorId);
    const tuition = await Tuition.findById(tuitionId);

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    if (!tuition) {
      return NextResponse.json({ error: 'Tuition not found' }, { status: 404 });
    }

    // Check if application already exists
    const existingApplication = await TutorTuition.findOne({ tutor: tutorId, tuition: tuitionId });
    if (existingApplication) {
      return NextResponse.json({ error: 'Application already exists for this tuition' }, { status: 409 });
    }

    // Create new application
    const application = new TutorTuition({
      tutor: tutorId,
      tuition: tuitionId,
      status: 'pending',
      feedback: message || '',
      appliedAt: new Date()
    });

    await application.save();

    // Populate the created application for response
    const populatedApplication = await TutorTuition.findById(application._id)
      .populate('tutor', 'tutorId name phone email universityShortForm version group')
      .populate('tuition', 'tuitionId studentClass subject location salary status');

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: populatedApplication
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating application:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Application already exists for this tuition' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 