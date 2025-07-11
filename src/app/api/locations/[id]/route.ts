import { NextRequest, NextResponse } from 'next/server';
import Location from '@/models/Location';
import { dbConnect } from '@/lib/mongodb';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const location = await Location.findById(params.id);
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ location });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await request.json();
  const { division, district, area } = body;
  if (!division || !district || !area) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  const location = await Location.findByIdAndUpdate(
    params.id,
    { division, district, area, formatted: `${area}, ${district}, ${division}` },
    { new: true, runValidators: true }
  );
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ location });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const location = await Location.findByIdAndDelete(params.id);
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
} 