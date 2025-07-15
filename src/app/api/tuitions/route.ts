import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';
import Guardian from '@/models/Guardian';
import { generateUniqueTuitionCode, formatTuitionCode, validateTuitionCode } from '@/utils/tuitionCodeGenerator';

// GET /api/tuitions - Get all tuitions with populated guardian data
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    // Parse query params
    const { searchParams } = new URL(request.url);
    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') === 'asc' ? 1 : -1;
    const status = searchParams.get('status');
    const version = searchParams.get('version');
    const tuitionClass = searchParams.get('class');

    // Build filter object
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (version && version !== 'all') filter.version = version;
    if (tuitionClass && tuitionClass !== 'all') filter.class = tuitionClass;

    const tuitions = await Tuition.find(filter)
      .populate({
        path: 'guardian',
        select: 'name number email address whatsappNumber optionalNumber socialMediaLink'
      })
      .sort({ [sortField]: sortOrder });

    return NextResponse.json(tuitions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tuitions - Add a new tuition
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      code, // Optional manual tuition code
      guardianName,
      guardianNumber,
      guardianAddress,
      studentClass,
      version, 
      subjects, 
      weeklyDays,
      weeklyHours,
      salary,
      location,
      startMonth,
      tutorGender, 
      specialRemarks,
      urgent,
      tutorRequirement, 
      specificLocation, 
      description 
    } = body;

    // Handle tuition code generation/validation
    let finalCode = '';
    
    if (code && code.trim()) {
      // Manual code provided
      finalCode = formatTuitionCode(code.trim());
      
      // Validate that this code is available
      const isAvailable = await validateTuitionCode(finalCode);
      if (!isAvailable) {
        return NextResponse.json({ 
          success: false,
          error: `Tuition code ${finalCode} already exists. Please choose a different code or leave it empty for auto-generation.`
        }, { status: 400 });
      }
    } else {
      // Auto-generate code
      finalCode = await generateUniqueTuitionCode();
    }

    // Handle Guardian Creation (if not exists)
    let existingGuardian = await Guardian.findOne({ number: guardianNumber });
    if (!existingGuardian) {
      existingGuardian = await Guardian.create({
        name: guardianName,
        number: guardianNumber,
        address: guardianAddress
      });
    } else {
      // Update existing guardian info if needed
      if (guardianName && existingGuardian.name !== guardianName) {
        existingGuardian.name = guardianName;
      }
      if (guardianAddress && existingGuardian.address !== guardianAddress) {
        existingGuardian.address = guardianAddress;
      }
      await existingGuardian.save();
    }

    // Create the Tuition Record with the safely generated/validated code
    const tuition = new Tuition({
      code: finalCode,
      guardianName,
      guardianNumber,
      guardianAddress,
      class: studentClass,
      version,
      subjects,
      weeklyDays,
      weeklyHours,
      salary,
      location,
      startMonth,
      tutorGender,
      specialRemarks,
      urgent,
      tutorRequirement,
      specificLocation,
      description,
      guardian: existingGuardian._id
    });

    await tuition.save();
    
    return NextResponse.json({ 
      success: true,
      message: 'Tuition added successfully', 
      tuition,
      generatedCode: finalCode
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tuition:', error);
    
    // Handle specific MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern?.code) {
      return NextResponse.json({ 
        success: false,
        error: `Tuition code already exists. This might be a race condition. Please try again or specify a different code.`
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
} 