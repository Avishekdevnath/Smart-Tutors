import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { sign } from 'jsonwebtoken';
import { getAdminJwtSecret } from '@/lib/adminAuth';
import { validateAdminLoginPayload } from '@/lib/adminAuthValidation';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const validationResult = validateAdminLoginPayload(body);

    if ('error' in validationResult) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to too many failed attempts' },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Create JWT token
    const token = sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      getAdminJwtSecret(),
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 