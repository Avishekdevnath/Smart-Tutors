import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';
import User from '@/models/User';
import Tuition from '@/models/Tuition';
import bcrypt from 'bcryptjs';
import { uploadImage } from '@/lib/cloudinary';
import { sendWelcomeEmail } from '@/lib/email';
import Location from '@/models/Location';
import { openaiFormatLocation } from '@/utils/location';

// Generate unique tutor ID
const generateTutorId = async () => {
  const lastTutor = await Tutor.findOne().sort({ tutorId: -1 }).limit(1);
  if (!lastTutor) {
    return "T101";
  }
  const lastIdNumber = parseInt(lastTutor.tutorId.replace("T", ""), 10);
  return `T${lastIdNumber + 1}`;
};

// GET /api/tutors - Get all tutors with optional search and filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm');
    const group = searchParams.get('group');
    const version = searchParams.get('version');

    let filter: any = {};

    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } },
        { universityShortForm: { $regex: searchTerm, $options: "i" } },
        { preferredLocation: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (group) {
      filter.group = group;
    }

    if (version) {
      filter.version = version;
    }

    const tutors = await Tutor.find(filter).populate('location');

    return NextResponse.json(tutors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tutors - Add a new tutor
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse form data using Next.js built-in FormData
    const formData = await request.formData();

    // Extract form fields
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const fatherName = formData.get('fatherName') as string;
    const fatherNumber = formData.get('fatherNumber') as string;
    const version = formData.get('version') as string;
    const group = formData.get('group') as string;
    const schoolName = formData.get('schoolName') as string;
    const collegeName = formData.get('collegeName') as string;
    const university = formData.get('university') as string;
    const universityShortForm = formData.get('universityShortForm') as string;
    const department = formData.get('department') as string;
    const yearAndSemester = formData.get('yearAndSemester') as string;
    const experience = formData.get('experience') as string;
    const gender = formData.get('gender') as string;
    const password = (formData.get('password') as string) || '654321';
    const applyingForTuition = formData.get('applyingForTuition') as string;

    // Parse JSON fields
    const academicQualifications = formData.get('academicQualifications') 
      ? JSON.parse(formData.get('academicQualifications') as string) 
      : {};
    
    // Parse location info from form
    const rawLocation = formData.get('location') ? JSON.parse(formData.get('location') as string) : {};
    // Use AI to format location
    const formattedLocation = await openaiFormatLocation(rawLocation);
    // Find or create Location document
    let locationDoc = await Location.findOne({
      division: formattedLocation.division,
      district: formattedLocation.district,
      area: formattedLocation.area,
    });
    if (!locationDoc) {
      locationDoc = new Location(formattedLocation);
      await locationDoc.save();
    }

    // Parse array fields
    const preferredSubjects = formData.get('preferredSubjects') 
      ? (formData.get('preferredSubjects') as string).split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    const preferredLocation = formData.get('preferredLocation') 
      ? (formData.get('preferredLocation') as string).split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Get file uploads
    const nidPhoto = formData.get('nidPhoto') as File | null;
    const studentIdPhoto = formData.get('studentIdPhoto') as File | null;

    // Handle additional documents
    const additionalDocumentsCount = parseInt(formData.get('additionalDocumentsCount') as string) || 0;
    const additionalDocuments = [];

    for (let i = 0; i < additionalDocumentsCount; i++) {
      const file = formData.get(`additionalDocument_${i}`) as File | null;
      const label = formData.get(`additionalDocumentLabel_${i}`) as string;
      
      if (file && label && file.size > 0) {
        try {
          const uploadRes = await uploadImage(file, { folder: 'smart-tutors/additional-documents' });
          additionalDocuments.push({
            label,
            url: uploadRes.secure_url,
            uploadedAt: new Date()
          });
        } catch (error) {
          console.error(`Additional document ${i} upload failed:`, error);
        }
      }
    }

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const tutorId = await generateTutorId();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle file uploads to Cloudinary
    let nidPhotoUrl = '';
    let studentIdPhotoUrl = '';
    
    if (nidPhoto && nidPhoto.size > 0) {
      try {
        const uploadRes = await uploadImage(nidPhoto, { folder: 'smart-tutors/nid' });
        nidPhotoUrl = uploadRes.secure_url;
      } catch (error) {
        console.error('NID photo upload failed:', error);
      }
    }
    
    if (studentIdPhoto && studentIdPhoto.size > 0) {
      try {
        const uploadRes = await uploadImage(studentIdPhoto, { folder: 'smart-tutors/student-id' });
        studentIdPhotoUrl = uploadRes.secure_url;
      } catch (error) {
        console.error('Student ID photo upload failed:', error);
      }
    }

    const tutor = new Tutor({
      tutorId,
      name,
      phone,
      email,
      address,
      profileStatus: 'active',
      mediaFeeHistory: [],
      password: hashedPassword,
      fatherName,
      fatherNumber,
      version,
      group,
      academicQualifications,
      schoolName,
      collegeName,
      university,
      universityShortForm,
      department,
      yearAndSemester,
      preferredSubjects,
      preferredLocation,
      experience,
      documents: {
        nidPhoto: nidPhotoUrl,
        studentIdPhoto: studentIdPhotoUrl,
        additionalDocuments
      },
      gender,
      location: locationDoc._id,
      isProfileComplete: true,
      totalApplications: 0,
      successfulTuitions: 0,
    });

    await tutor.save();

    // Create user account for the tutor
    const user = new User({
      username: phone,
      password: hashedPassword,
      userType: 'tutor',
      tutorId: tutor._id,
    });

    await user.save();

    // Handle tuition application if specified
    let tuitionApplication = null;
    if (applyingForTuition) {
      try {
        const tuition = await Tuition.findOne({ code: applyingForTuition });
        if (tuition) {
          // Add application to tuition
          tuition.applications.push({
            tutorId: tutor._id.toString(),
            appliedDate: new Date()
          });
          await tuition.save();
          
          // Update tutor's total applications
          tutor.totalApplications = 1;
          await tutor.save();
          
          tuitionApplication = {
            tuitionCode: tuition.code,
            tuitionId: tuition._id,
            appliedDate: new Date()
          };
        }
      } catch (error) {
        console.error('Error applying for tuition:', error);
        // Don't fail the registration if tuition application fails
      }
    }

    // Send welcome email if email is provided (non-blocking)
    let emailSent = false;
    if (email) {
      try {
        await sendWelcomeEmail(email, name, tutorId, phone);
        console.log(`Welcome email sent successfully to ${email}`);
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        console.log('Registration completed successfully despite email error');
        // Continue with successful registration
      }
    }

    return NextResponse.json({
      message: 'Tutor and User registered successfully',
      tutor: {
        _id: tutor._id,
        tutorId: tutor.tutorId,
        name: tutor.name,
        phone: tutor.phone,
        email: tutor.email,
        profileStatus: tutor.profileStatus,
      },
      user: {
        _id: user._id,
        username: user.username,
        userType: user.userType,
      },
      emailSent: emailSent,
      tuitionApplication: tuitionApplication,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in adding tutor:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 