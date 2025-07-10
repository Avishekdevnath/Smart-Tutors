import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Guardian from '@/models/Guardian';
import Tuition from '@/models/Tuition';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const guardian = await Guardian.findById(id);
    if (!guardian) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }
    
    // Get tuitions posted by this guardian
    const tuitions = await Tuition.find({ guardianNumber: guardian.number });
    
    return NextResponse.json({
      ...guardian.toObject(),
      tuitions
    });
  } catch (error) {
    console.error('Error fetching guardian:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guardian' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.number || !body.address) {
      return NextResponse.json(
        { error: 'Name, phone number, and address are required' },
        { status: 400 }
      );
    }
    
    // Check if guardian exists
    const existingGuardian = await Guardian.findById(id);
    if (!existingGuardian) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }

    // Check if phone number is being changed and if it conflicts with another guardian
    if (body.number && body.number !== existingGuardian.number) {
      const phoneConflict = await Guardian.findOne({ 
        number: body.number, 
        _id: { $ne: id } 
      });
      if (phoneConflict) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    const updatedGuardian = await Guardian.findByIdAndUpdate(
      id,
      {
        name: body.name.trim(),
        number: body.number.trim(),
        address: body.address.trim()
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, guardian: updatedGuardian });
  } catch (error) {
    console.error('Error updating guardian:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors).map((e: any) => e.message).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update guardian' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const guardian = await Guardian.findById(id);
    if (!guardian) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }

    await Guardian.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guardian:', error);
    return NextResponse.json(
      { error: 'Failed to delete guardian' },
      { status: 500 }
    );
  }
} 