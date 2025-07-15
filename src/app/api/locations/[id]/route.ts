import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const location = await Location.findById(params.id);
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ location });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { division, district, area, subarea, formatted } = body;
    
    if (!division || !district || !area) {
      return NextResponse.json(
        { error: 'Division, district, and area are required' },
        { status: 400 }
      );
    }
    
    // Check if location exists
    const existingLocation = await Location.findById(params.id);
    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Check if the new combination already exists (excluding current location)
    const duplicateLocation = await Location.findOne({
      _id: { $ne: params.id },
      division: division.trim(),
      district: district.trim(),
      area: area.trim(),
      ...(subarea && { subarea: subarea.trim() })
    });
    
    if (duplicateLocation) {
      return NextResponse.json(
        { error: 'Location already exists' },
        { status: 400 }
      );
    }
    
    // Update location
    const updatedLocation = await Location.findByIdAndUpdate(
      params.id,
      {
        division: division.trim(),
        district: district.trim(),
        area: area.trim(),
        ...(subarea && { subarea: subarea.trim() }),
        formatted: formatted || `${subarea ? subarea.trim() + ', ' : ''}${area.trim()}, ${district.trim()}, ${division.trim()} Division`
      },
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      location: updatedLocation
    });
    
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Check if location exists
    const existingLocation = await Location.findById(params.id);
    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    // Delete location
    await Location.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
} 