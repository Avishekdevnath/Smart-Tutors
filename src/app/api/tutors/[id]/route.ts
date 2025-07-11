import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';
import User from '@/models/User';

// GET /api/tutors/[id] - Get a specific tutor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tutor });
  } catch (error: any) {
    console.error('Error fetching tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tutors/[id] - Update a tutor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Find the existing tutor
    const existingTutor = await Tutor.findById(id);
    if (!existingTutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Update the tutor
    const updatedTutor = await Tutor.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Tutor updated successfully',
      tutor: updatedTutor 
    });
  } catch (error: any) {
    console.error('Error updating tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/tutors/[id] - Delete a tutor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Find the tutor first
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Delete associated user account
    await User.findOneAndDelete({ tutorId: id });

    // Delete the tutor
    await Tutor.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Tutor and associated user account deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 