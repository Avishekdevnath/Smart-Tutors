import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { verifyAdminToken } from '@/lib/adminAuth';
import { validateChangeEmailPayload } from '@/lib/adminAuthValidation';

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

    const body = await request.json();
    const validationResult = validateChangeEmailPayload(body);

    if ('error' in validationResult) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { currentPassword, newEmail } = validationResult.data;

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