import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { FacebookGroupCollection } from '@/models/FacebookGroup';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.link) {
      return NextResponse.json(
        { success: false, error: 'Group name and link are required' },
        { status: 400 }
      );
    }

    // Validate member count
    if (typeof body.memberCount !== 'number' || body.memberCount < 0) {
      return NextResponse.json(
        { success: false, error: 'Member count must be a positive number' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if collection exists
    const collection = await FacebookGroupCollection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Create new group object
    const newGroup = {
      name: body.name.trim(),
      link: body.link.trim(),
      memberCount: body.memberCount,
      locations: Array.isArray(body.locations) ? body.locations : []
    };

    // Add group to collection
    collection.groups.push(newGroup);
    await collection.save();

    return NextResponse.json({
      success: true,
      data: collection,
      message: 'Group added successfully'
    });

  } catch (error) {
    console.error('Error adding group to collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add group to collection' },
      { status: 500 }
    );
  }
} 