import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import formidable from 'formidable';
import { uploadImage } from '@/lib/cloudinary';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    const tutors = await Tutor.find(filter, {
      tutorId: 1,
      name: 1,
      phone: 1,
      version: 1,
      address: 1,
      universityShortForm: 1,
      group: 1,
      preferredLocation: 1,
    });

    return NextResponse.json(tutors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tutors - Add a new tutor
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse multipart form data
    const form = new formidable.IncomingForm();

    const bufferFromStream = async (stream: Readable): Promise<Buffer> => {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    };

    const data = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(request as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const fields = data.fields;
    const files = data.files;

    const name = fields.name;
    const phone = fields.phone;
    const email = fields.email;
    const status = fields.status;
    const mediaFeeHistory = fields.mediaFeeHistory;
    const password = fields.password || '654321';

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const tutorId = await generateTutorId();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle file uploads to Cloudinary
    let nidPhotoUrl = '';
    let studentIdPhotoUrl = '';
    if (files.nidPhoto) {
      const file = files.nidPhoto;
      const fileBuffer = await bufferFromStream(Readable.from(file._readStream));
      const uploadRes = await uploadImage({
        arrayBuffer: async () => fileBuffer,
        name: file.originalFilename,
        type: file.mimetype,
      } as unknown as File, { folder: 'smart-tutors/nid' });
      nidPhotoUrl = uploadRes.secure_url;
    }
    if (files.studentIdPhoto) {
      const file = files.studentIdPhoto;
      const fileBuffer = await bufferFromStream(Readable.from(file._readStream));
      const uploadRes = await uploadImage({
        arrayBuffer: async () => fileBuffer,
        name: file.originalFilename,
        type: file.mimetype,
      } as unknown as File, { folder: 'smart-tutors/student-id' });
      studentIdPhotoUrl = uploadRes.secure_url;
    }

    // Parse JSON fields if needed
    let academicQualifications = {};
    if (fields.academicQualifications) {
      academicQualifications = JSON.parse(fields.academicQualifications);
    }
    let location = {};
    if (fields.location) {
      location = JSON.parse(fields.location);
    }
    const preferredSubjects = fields.preferredSubjects ? fields.preferredSubjects.split(',').map((s: string) => s.trim()) : [];
    const preferredLocation = fields.preferredLocation ? fields.preferredLocation.split(',').map((s: string) => s.trim()) : [];

    const tutor = new Tutor({
      tutorId,
      name,
      phone,
      email,
      status: status || 'pending',
      mediaFeeHistory: mediaFeeHistory || [],
      password: hashedPassword,
      fatherName: fields.fatherName,
      fatherNumber: fields.fatherNumber,
      version: fields.version,
      group: fields.group,
      academicQualifications,
      schoolName: fields.schoolName,
      collegeName: fields.collegeName,
      university: fields.university,
      universityShortForm: fields.universityShortForm,
      department: fields.department,
      yearAndSemester: fields.yearAndSemester,
      preferredSubjects,
      preferredLocation,
      experience: fields.experience,
      documents: {
        nidPhoto: nidPhotoUrl,
        studentIdPhoto: studentIdPhotoUrl,
      },
      gender: fields.gender,
      location,
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

    return NextResponse.json({
      message: 'Tutor and User registered successfully',
      tutor,
      user,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in adding tutor:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 