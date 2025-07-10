import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';
import Guardian from '@/models/Guardian';

// GET /api/tuitions/[id] - Get a specific tuition
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const tuition = await Tuition.findById(params.id)
      .populate({
        path: 'guardian',
        select: 'name number email address whatsappNumber optionalNumber socialMediaLink'
      });

    if (!tuition) {
      return NextResponse.json({ error: 'Tuition not found' }, { status: 404 });
    }

    return NextResponse.json(tuition);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tuitions/[id] - Update a tuition
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      guardianName,
      guardianNumber,
      guardianAddress,
      class: studentClass,
      version,
      subjects,
      weeklyDays,
      dailyHours,
      weeklyHours,
      salary,
      location,
      startMonth,
      tutorGender,
      specialRemarks,
      urgent,
      status,
      tutorRequirement,
      specificLocation,
      description
    } = body;

    // Find the existing tuition
    const existingTuition = await Tuition.findById(params.id);
    if (!existingTuition) {
      return NextResponse.json({ error: 'Tuition not found' }, { status: 404 });
    }

    // Handle Guardian Update
    if (guardianNumber && guardianNumber !== existingTuition.guardianNumber) {
      let existingGuardian = await Guardian.findOne({ number: guardianNumber });
      if (!existingGuardian) {
        existingGuardian = await Guardian.create({
          name: guardianName || existingTuition.guardianName,
          number: guardianNumber,
          address: guardianAddress || existingTuition.guardianAddress
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
    }

    // Prepare update data
    const updateData: any = {};
    
    if (guardianName !== undefined) updateData.guardianName = guardianName;
    if (guardianNumber !== undefined) updateData.guardianNumber = guardianNumber;
    if (guardianAddress !== undefined) updateData.guardianAddress = guardianAddress;
    if (studentClass !== undefined) updateData.class = studentClass;
    if (version !== undefined) updateData.version = version;
    if (subjects !== undefined) updateData.subjects = Array.isArray(subjects) ? subjects : subjects.split(',').map((s: string) => s.trim());
    if (weeklyDays !== undefined) updateData.weeklyDays = weeklyDays;
    if (dailyHours !== undefined) updateData.dailyHours = dailyHours;
    if (weeklyHours !== undefined) updateData.weeklyHours = weeklyHours;
    if (salary !== undefined) updateData.salary = salary;
    if (location !== undefined) updateData.location = location;
    if (startMonth !== undefined) updateData.startMonth = startMonth;
    if (tutorGender !== undefined) updateData.tutorGender = tutorGender;
    if (specialRemarks !== undefined) updateData.specialRemarks = specialRemarks;
    if (urgent !== undefined) updateData.urgent = urgent;
    if (status !== undefined) updateData.status = status;
    if (tutorRequirement !== undefined) updateData.tutorRequirement = tutorRequirement;
    if (specificLocation !== undefined) updateData.specificLocation = specificLocation;
    if (description !== undefined) updateData.description = description;

    // Update the tuition
    const updatedTuition = await Tuition.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'guardian',
      select: 'name number email address whatsappNumber optionalNumber socialMediaLink'
    });

    return NextResponse.json({
      success: true,
      message: 'Tuition updated successfully',
      tuition: updatedTuition
    });
  } catch (error: any) {
    console.error('Error updating tuition:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/tuitions/[id] - Delete a tuition
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const tuition = await Tuition.findByIdAndDelete(params.id);
    
    if (!tuition) {
      return NextResponse.json({ error: 'Tuition not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tuition deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting tuition:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 