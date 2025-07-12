import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';

// GET /api/tuitions/public/[code] - Get a specific tuition by code for public access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    
    // Await params for Next.js 15 compatibility
    const { code } = await params;
    
    // Find tuition by code (case insensitive) - no guardian population
    const tuition = await Tuition.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') }
    });

    if (!tuition) {
      return NextResponse.json({ error: 'Tuition not found' }, { status: 404 });
    }

    // Return only the necessary fields for public view (no guardian info)
    const publicTuition = {
      _id: tuition._id,
      code: tuition.code,
      class: tuition.class,
      version: tuition.version,
      subjects: tuition.subjects,
      weeklyDays: tuition.weeklyDays,
      dailyHours: tuition.dailyHours,
      salary: tuition.salary,
      location: tuition.location,
      startMonth: tuition.startMonth,
      tutorGender: tuition.tutorGender,
      specialRemarks: tuition.specialRemarks,
      urgent: tuition.urgent,
      status: tuition.status,
      tutorRequirement: tuition.tutorRequirement,
      specificLocation: tuition.specificLocation,
      description: tuition.description,
      createdAt: tuition.createdAt
    };

    return NextResponse.json(publicTuition);
  } catch (error: any) {
    console.error('Error fetching public tuition:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 