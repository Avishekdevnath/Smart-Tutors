import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Guardian from '@/models/Guardian';
import Tuition from '@/models/Tuition';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const search = searchParams.get('search');
    
    // Build query
    let query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sort] = sortOrder;
    
    const guardians = await Guardian.find(query).sort(sortObj);
    
    // Get tuition count for each guardian
    const guardiansWithTuitions = await Promise.all(
      guardians.map(async (guardian) => {
        const tuitionCount = await Tuition.countDocuments({
          guardianNumber: guardian.number
        });
        return {
          ...guardian.toObject(),
          tuitionCount
        };
      })
    );
    
    return NextResponse.json(guardiansWithTuitions);
  } catch (error) {
    console.error('Error fetching guardians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guardians' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.number || !body.address) {
      return NextResponse.json(
        { error: 'Name, phone number, and address are required' },
        { status: 400 }
      );
    }

    // Check if guardian with this phone number already exists
    const existingGuardian = await Guardian.findOne({ number: body.number });
    if (existingGuardian) {
      return NextResponse.json(
        { error: 'Guardian with this phone number already exists' },
        { status: 400 }
      );
    }

    const guardian = new Guardian({
      name: body.name.trim(),
      number: body.number.trim(),
      address: body.address.trim()
    });
    
    await guardian.save();
    
    return NextResponse.json(guardian, { status: 201 });
  } catch (error) {
    console.error('Error creating guardian:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors).map((e: any) => e.message).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create guardian' },
      { status: 500 }
    );
  }
} 