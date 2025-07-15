import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await dbConnect();
    const { name } = await params;
    
    // Decode the name parameter
    const decodedName = decodeURIComponent(name);
    
    // Find tutor by name (case-insensitive)
    const tutor = await Tutor.findOne({
      name: { $regex: new RegExp(`^${decodedName}$`, 'i') },
      profileStatus: 'active' // Only show active tutors
    }).select('-password -mediaFeeHistory'); // Exclude sensitive data but keep documents

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: 'Tutor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tutor: tutor
    });

  } catch (error) {
    console.error('Error fetching public tutor profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 