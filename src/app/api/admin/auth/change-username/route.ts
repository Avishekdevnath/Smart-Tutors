import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { verifyAdminToken } from '@/lib/adminAuth';
import { validateChangeUsernamePayload } from '@/lib/adminAuthValidation';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();

    const validationResult = validateChangeUsernamePayload(body);
    if ('error' in validationResult) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { currentPassword, newUsername } = validationResult.data;

    // Get current admin
    const currentAdmin = await Admin.findById(admin.id);
    if (!currentAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await currentAdmin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new username is different from current
    if (currentAdmin.username.toLowerCase() === newUsername.toLowerCase()) {
      return NextResponse.json(
        { error: 'New username must be different from current username' },
        { status: 400 }
      );
    }

    // Check if username already exists (case-insensitive)
    const existingAdmin = await Admin.findOne({
      username: { $regex: new RegExp(`^${newUsername}$`, 'i') },
      _id: { $ne: currentAdmin._id }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Update username
    currentAdmin.username = newUsername.trim();
    await currentAdmin.save();

    return NextResponse.json({
      success: true,
      message: 'Username updated successfully',
      admin: {
        id: currentAdmin._id,
        username: currentAdmin.username,
        email: currentAdmin.email,
        name: currentAdmin.name,
        role: currentAdmin.role
      }
    });

  } catch (error) {
    console.error('Error changing username:', error);
    return NextResponse.json(
      { error: 'Failed to change username' },
      { status: 500 }
    );
  }
} 