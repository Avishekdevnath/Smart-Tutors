import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { verifyAdminToken } from '@/lib/adminAuth';
import { validateChangePasswordPayload } from '@/lib/adminAuthValidation';

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
    const validationResult = validateChangePasswordPayload(body);

    if ('error' in validationResult) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

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
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await Admin.findByIdAndUpdate(admin.id, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 