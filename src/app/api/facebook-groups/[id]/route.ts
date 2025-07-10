import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { FacebookGroupCollection } from '@/models/FacebookGroup';

// GET - Fetch a specific Facebook group collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const collection = await FacebookGroupCollection.findById(id).lean();
    
    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Facebook group collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching Facebook group collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Facebook group collection' },
      { status: 500 }
    );
  }
}

// PUT - Update a Facebook group collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const body = await request.json();
    const { collectionName, groups } = body;
    
    const updateData: any = {};
    if (collectionName !== undefined) updateData.collectionName = collectionName;
    if (groups !== undefined) updateData.groups = groups;
    
    // Check if collection with same name already exists (excluding current collection)
    if (collectionName) {
      const existingCollection = await FacebookGroupCollection.findOne({
        collectionName: { $regex: new RegExp(`^${collectionName}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCollection) {
        return NextResponse.json(
          { success: false, error: 'A collection with this name already exists' },
          { status: 400 }
        );
      }
    }
    
    const updatedCollection = await FacebookGroupCollection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedCollection) {
      return NextResponse.json(
        { success: false, error: 'Facebook group collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedCollection });
  } catch (error) {
    console.error('Error updating Facebook group collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update Facebook group collection' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Facebook group collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const deletedCollection = await FacebookGroupCollection.findByIdAndDelete(id);
    
    if (!deletedCollection) {
      return NextResponse.json(
        { success: false, error: 'Facebook group collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Facebook group collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting Facebook group collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete Facebook group collection' },
      { status: 500 }
    );
  }
} 