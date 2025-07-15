import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';
import TutorTuition from '@/models/TutorTuition';
import Tutor from '@/models/Tutor';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { tuitionId, name, phone, email, experience, message, agreedToTerms, confirmationText } = body;

    // For logged-in users, only tuitionId and terms agreement are required
    if (!tuitionId) {
      return NextResponse.json(
        { error: 'Tuition ID is required' },
        { status: 400 }
      );
    }

    // For non-logged-in users, validate required fields
    if (!session?.user && (!name || !phone)) {
      return NextResponse.json(
        { error: 'Name and phone are required for guest applications' },
        { status: 400 }
      );
    }

    // For logged-in users, validate terms agreement
    if (session?.user && !agreedToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      );
    }

    // Check if tuition exists and is available
    const tuition = await Tuition.findById(tuitionId);
    if (!tuition) {
      return NextResponse.json(
        { error: 'Tuition not found' },
        { status: 404 }
      );
    }

    if (!['open', 'available'].includes(tuition.status)) {
      return NextResponse.json(
        { error: 'This tuition is no longer available' },
        { status: 400 }
      );
    }

    let tutorId = null;
    let tutorName = name;
    let tutorPhone = phone;
    let tutorEmail = email;

    // If user is logged in, get their tutor profile
    if (session?.user) {
      const user = session.user as any;
      if (user.userType === 'tutor' && user.tutorId) {
        const tutor = await Tutor.findById(user.tutorId);
        if (tutor) {
          tutorId = tutor._id;
          tutorName = tutor.name;
          tutorPhone = tutor.phone;
          tutorEmail = tutor.email;
        }
      }
    }

    // Check if already applied (for registered tutors)
    if (tutorId) {
      const existingApplication = await TutorTuition.findOne({
        tutor: tutorId,
        tuition: tuitionId
      });

      if (existingApplication) {
        return NextResponse.json(
          { error: 'You have already applied for this tuition' },
          { status: 400 }
        );
      }
    }

    // Create application
    const applicationData = {
      tuition: tuitionId,
      status: 'pending',
      appliedAt: new Date(),
      agreedToTerms: session?.user ? agreedToTerms : false,
      confirmationText: session?.user ? confirmationText : undefined
    };

    // Add tutor-specific data for registered users
    if (tutorId) {
      applicationData.tutor = tutorId;
      applicationData.notes = `Application from registered tutor: ${tutorName} (${tutorPhone})${tutorEmail ? ` - Email: ${tutorEmail}` : ''} - Agreed to terms: ${confirmationText || 'Yes'}`;
    } else {
      // Add guest application data
      applicationData.guestName = tutorName;
      applicationData.guestPhone = tutorPhone;
      applicationData.guestEmail = tutorEmail;
      applicationData.guestExperience = experience;
      applicationData.guestMessage = message;
      applicationData.notes = `Guest application from ${tutorName} (${tutorPhone})${email ? ` - Email: ${email}` : ''}${experience ? ` - Experience: ${experience}` : ''}${message ? ` - Message: ${message}` : ''}`;
    }

    const application = await TutorTuition.create(applicationData);

    // Update tuition applications array
    await Tuition.findByIdAndUpdate(tuitionId, {
      $push: {
        applications: {
          tutorId: tutorId || `guest_${Date.now()}`,
          appliedDate: new Date()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const tuitionCode = searchParams.get('tuitionCode');
    
    // If tuitionCode is provided, allow public access to view applications for that tuition
    if (tuitionCode) {
      // Find the tuition by code
      const tuition = await Tuition.findOne({ code: tuitionCode });
      if (!tuition) {
        return NextResponse.json(
          { error: 'Tuition not found' },
          { status: 404 }
        );
      }

      // Get applications for this specific tuition
      const applications = await TutorTuition.find({ tuition: tuition._id })
        .populate({
          path: 'tutor',
          select: 'name phone email university department experience',
          required: false
        })
        .sort({ appliedAt: -1 });

      return NextResponse.json({
        success: true,
        applications
      });
    }

    // For dashboard access, require authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as any;
    let applications;

    if (user.userType === 'tutor' && user.tutorId) {
      // Get applications for logged-in tutor
      applications = await TutorTuition.find({ tutor: user.tutorId })
        .populate('tuition', 'code class version location salary status')
        .sort({ appliedAt: -1 });
    } else if (user.userType === 'admin') {
      // Get all applications for admin
      applications = await TutorTuition.find()
        .populate({
          path: 'tutor',
          select: 'name phone email',
          required: false // Allow null tutors for guest applications
        })
        .populate('tuition', 'code class version location salary status')
        .sort({ appliedAt: -1 });
    } else {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 