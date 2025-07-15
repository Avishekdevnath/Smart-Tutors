import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import TutorTuition from '@/models/TutorTuition';
import { sendApplicationStatusUpdate } from '@/lib/email';

// GET /api/applications/[id] - Get specific application
  export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await dbConnect();
    
    const application = await TutorTuition.findById(params.id)
      .populate({
        path: 'tutor',
        select: 'tutorId name phone email universityShortForm version group gender address documents',
        required: false // Allow null tutors for guest applications
      })
      .populate('tuition', 'tuitionId studentClass subject location salary status guardianName guardianPhone');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/applications/[id] - Update application status and details
  export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await dbConnect();
    
    const body = await request.json();
    const { status, feedback, guardianFeedback, demoDate, demoCompleted, demoFeedback, mediaFee, notes } = body;

    // Get the current application to compare status
    const currentApplication = await TutorTuition.findById(params.id)
      .populate({
        path: 'tutor',
        select: 'name email',
        required: false
      })
      .populate('tuition', 'tuitionId studentClass subject location salary');

    if (!currentApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updateData: any = {};
    const oldStatus = currentApplication.status;
    
    if (status) {
      updateData.status = status;
      // Set timestamp based on status
      if (status === 'confirmed') updateData.confirmedAt = new Date();
      if (status === 'completed') updateData.completedAt = new Date();
      if (status === 'rejected') updateData.rejectedAt = new Date();
    }
    
    if (feedback !== undefined) updateData.feedback = feedback;
    if (guardianFeedback !== undefined) updateData.guardianFeedback = guardianFeedback;
    if (demoDate !== undefined) updateData.demoDate = demoDate;
    if (demoCompleted !== undefined) updateData.demoCompleted = demoCompleted;
    if (demoFeedback !== undefined) updateData.demoFeedback = demoFeedback;
    if (mediaFee !== undefined) updateData.mediaFee = mediaFee;
    if (notes !== undefined) updateData.notes = notes;

    const application = await TutorTuition.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'tutor',
      select: 'tutorId name phone email universityShortForm version group',
      required: false
    })
     .populate('tuition', 'tuitionId studentClass subject location salary status');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Send email notification if status changed and tutor has email
    if (status && status !== oldStatus && application.tutor?.email) {
      try {
        const tuitionDetails = {
          tuitionId: application.tuition.tuitionId,
          studentClass: application.tuition.studentClass,
          subject: application.tuition.subject,
          location: typeof application.tuition.location === 'object' 
            ? `${application.tuition.location.area || ''}, ${application.tuition.location.district || ''}`.trim().replace(/^,\s*/, '')
            : application.tuition.location || 'N/A',
          salary: application.tuition.salary
        };

        await sendApplicationStatusUpdate(
          application.tutor.email,
          application.tutor.name,
          tuitionDetails,
          oldStatus,
          status,
          guardianFeedback || feedback,
          demoDate
        );

        console.log(`Status update email sent to ${application.tutor.email} for application ${params.id}`);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application,
      emailSent: status && status !== oldStatus && application.tutor?.email ? true : false,
    });

  } catch (error: any) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/applications/[id] - Delete application (withdraw)
  export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await dbConnect();
    
    const application = await TutorTuition.findByIdAndDelete(params.id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Application deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'selected-for-demo', 'confirmed-fee-pending', 'completed', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    // Set appropriate timestamp based on status
    if (status === 'selected-for-demo') {
      updateData.confirmedAt = new Date();
    } else if (status === 'confirmed-fee-pending') {
      updateData.confirmedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    // Handle demo instructions and guardian contact
    if (body.demoInstructions) {
      updateData.demoInstructions = body.demoInstructions;
    }
    if (body.guardianContactSent !== undefined) {
      updateData.guardianContactSent = body.guardianContactSent;
      if (body.guardianContactSent) {
        updateData.guardianContactSentAt = new Date();
      }
    }
    if (body.confirmationText) {
      updateData.confirmationText = body.confirmationText;
    }

    const application = await TutorTuition.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'tutor',
      select: 'name phone email',
      required: false
    })
     .populate('tuition', 'code class version location salary status');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 