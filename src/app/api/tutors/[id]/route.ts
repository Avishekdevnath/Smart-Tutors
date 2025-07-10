import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Tutor from '@/models/Tutor';

// GET /api/tutors/[id] - Get tutor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const tutor = await Tutor.findOne({ tutorId: id });
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }
    
    return NextResponse.json(tutor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tutors/[id] - Update tutor by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const body = await request.json();
    const tutor = await Tutor.findOneAndUpdate(
      { tutorId: id }, 
      body, 
      { new: true }
    );
    
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Tutor updated successfully', 
      tutor 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE /api/tutors/[id] - Delete tutor by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const deletedTutor = await Tutor.findOneAndDelete({ tutorId: id });
    if (!deletedTutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Tutor deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 