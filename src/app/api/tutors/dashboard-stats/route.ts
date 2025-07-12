import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import TutorTuition from '@/models/TutorTuition';
import Tutor from '@/models/Tutor';
import Tuition from '@/models/Tuition';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get tutor ID from query params
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    
    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID is required' }, { status: 400 });
    }

    // Get tutor details
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Get all applications for this tutor
    const applications = await TutorTuition.find({ tutor: tutorId })
      .populate('tuition', 'code guardianName class subjects location salary status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate statistics
    const totalApplications = await TutorTuition.countDocuments({ tutor: tutorId });
    const pendingApplications = await TutorTuition.countDocuments({ 
      tutor: tutorId, 
      status: 'pending' 
    });
    const confirmedApplications = await TutorTuition.countDocuments({ 
      tutor: tutorId, 
      status: 'confirmed' 
    });
    const completedApplications = await TutorTuition.countDocuments({ 
      tutor: tutorId, 
      status: 'completed' 
    });

    // Get recent activities (last 5 applications)
    const recentActivities = applications.slice(0, 5).map(app => ({
      id: app._id,
      type: 'application',
      status: app.status,
      tuitionCode: app.tuition?.code,
      tuitionClass: app.tuition?.class,
      tuitionSubjects: app.tuition?.subjects,
      tuitionLocation: app.tuition?.location,
      appliedAt: app.appliedAt,
      message: `${app.status === 'pending' ? 'Applied for' : app.status === 'confirmed' ? 'Confirmed for' : 'Completed'} ${app.tuition?.class} tuition (${app.tuition?.code})`
    }));

    // Get active tuitions (confirmed applications)
    const activeTuitions = await TutorTuition.find({ 
      tutor: tutorId, 
      status: 'confirmed' 
    })
    .populate('tuition', 'code guardianName class subjects location salary')
    .sort({ confirmedAt: -1 })
    .limit(5);

    // Get profile completion status
    const profileCompletion = {
      basicInfo: !!(tutor.name && tutor.phone && tutor.email),
      academicInfo: !!(tutor.university && tutor.department),
      documents: !!(tutor.documents?.nidPhoto && tutor.documents?.studentIdPhoto),
      preferences: !!(tutor.preferredSubjects?.length > 0 && tutor.preferredLocation?.length > 0)
    };

    const completionPercentage = Object.values(profileCompletion).filter(Boolean).length * 25;

    return NextResponse.json({
      success: true,
      stats: {
        totalApplications,
        pendingApplications,
        confirmedApplications,
        completedApplications,
        activeTuitions: confirmedApplications,
        profileCompletion: completionPercentage
      },
      recentActivities,
      activeTuitions: activeTuitions.map(app => ({
        id: app._id,
        tuitionCode: app.tuition?.code,
        guardianName: app.tuition?.guardianName,
        class: app.tuition?.class,
        subjects: app.tuition?.subjects,
        location: app.tuition?.location,
        salary: app.tuition?.salary,
        confirmedAt: app.confirmedAt
      })),
      profileCompletion,
      tutor: {
        name: tutor.name,
        tutorId: tutor.tutorId,
        totalApplications: tutor.totalApplications || 0,
        successfulTuitions: tutor.successfulTuitions || 0
      }
    });

  } catch (error: any) {
    console.error('Error fetching tutor dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 