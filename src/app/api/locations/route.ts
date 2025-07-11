import { NextRequest, NextResponse } from 'next/server';
import Location from '@/models/Location';
import { dbConnect } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const filter: any = {};
  if (search) {
    filter.$or = [
      { division: { $regex: search, $options: 'i' } },
      { district: { $regex: search, $options: 'i' } },
      { area: { $regex: search, $options: 'i' } },
    ];
  }
  const locations = await Location.find(filter).sort({ division: 1, district: 1, area: 1 });
  return NextResponse.json({ locations });
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const { division, district, area } = body;
  if (!division || !district || !area) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  // Prevent duplicates
  const exists = await Location.findOne({ division, district, area });
  if (exists) {
    return NextResponse.json({ error: 'Location already exists' }, { status: 409 });
  }
  const location = new Location({ division, district, area, formatted: `${area}, ${district}, ${division}` });
  await location.save();
  return NextResponse.json({ location });
} 