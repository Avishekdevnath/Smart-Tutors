import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { verifyAdminToken } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newEmail } = await request.json();

    // Validate input
    if (!currentPassword || !newEmail) {
      return NextResponse.json(
        { error: 'Current password and new email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get admin with password
    const adminUser = await Admin.findById(admin.id).select('+password');
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new email is already in use by another admin
    const existingAdmin = await Admin.findOne({ 
      email: newEmail.toLowerCase(),
      _id: { $ne: admin.id }
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Email address is already in use' },
        { status: 400 }
      );
    }

    // Check if the new email is the same as current email
    if (adminUser.email.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    // Update email
    await Admin.findByIdAndUpdate(admin.id, {
      email: newEmail.toLowerCase(),
      updatedAt: new Date()
    });

    return NextResponse.json(
      { 
        message: 'Email changed successfully',
        newEmail: newEmail.toLowerCase()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 