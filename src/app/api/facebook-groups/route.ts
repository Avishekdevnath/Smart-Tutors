import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { FacebookGroupCollection } from '@/models/FacebookGroup';

// GET - Fetch all Facebook group collections
export async function GET() {
  try {
    await dbConnect();
    
    const collections = await FacebookGroupCollection.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error('Error fetching Facebook group collections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Facebook group collections' },
      { status: 500 }
    );
  }
}

// POST - Create a new Facebook group collection
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { collectionName, groups = [] } = body;
    
    if (!collectionName) {
      return NextResponse.json(
        { success: false, error: 'Collection name is required' },
        { status: 400 }
      );
    }
    
    // Check if collection with same name already exists
    const existingCollection = await FacebookGroupCollection.findOne({
      collectionName: { $regex: new RegExp(`^${collectionName}$`, 'i') }
    });
    
    if (existingCollection) {
      return NextResponse.json(
        { success: false, error: 'A collection with this name already exists' },
        { status: 400 }
      );
    }
    
    const newCollection = new FacebookGroupCollection({
      collectionName,
      groups
    });
    
    await newCollection.save();
    
    return NextResponse.json(
      { success: true, data: newCollection },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating Facebook group collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Facebook group collection' },
      { status: 500 }
    );
  }
} 