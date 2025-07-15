import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongodb';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export async function verifyAdminToken(request: NextRequest): Promise<AdminUser | null> {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verify(token, JWT_SECRET) as any;
    
    // Verify admin still exists and is active
    await dbConnect();
    const admin = await Admin.findById(decoded.id).select('_id username email name role isActive');
    
    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | AdminUser> {
  const admin = await verifyAdminToken(request);
  
  if (!admin) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return admin;
}

export async function requireSuperAdmin(request: NextRequest): Promise<NextResponse | AdminUser> {
  const admin = await verifyAdminToken(request);
  
  if (!admin) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  if (admin.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
  }
  
  return admin;
} 