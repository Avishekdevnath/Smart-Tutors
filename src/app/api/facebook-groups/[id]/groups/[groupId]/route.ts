import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { FacebookGroupCollection } from '@/models/FacebookGroup';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;
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

    // Find collection and update the specific group
    const collection = await FacebookGroupCollection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Find the group in the collection
    const groupIndex = collection.groups.findIndex(group => group._id.toString() === groupId);
    if (groupIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Group not found in collection' },
        { status: 404 }
      );
    }

    // Update the group
    collection.groups[groupIndex] = {
      ...collection.groups[groupIndex],
      name: body.name.trim(),
      link: body.link.trim(),
      memberCount: body.memberCount,
      locations: Array.isArray(body.locations) ? body.locations : []
    };

    await collection.save();

    return NextResponse.json({
      success: true,
      data: collection,
      message: 'Group updated successfully'
    });

  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;

    await dbConnect();

    // Find collection and remove the specific group
    const collection = await FacebookGroupCollection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Remove the group from the collection
    collection.groups = collection.groups.filter(group => group._id.toString() !== groupId);
    await collection.save();

    return NextResponse.json({
      success: true,
      data: collection,
      message: 'Group deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete group' },
      { status: 500 }
    );
  }
} 