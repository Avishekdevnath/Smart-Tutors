import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    // Only admins can access this endpoint
    if (!session?.user || (session.user as any).userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all existing codes
    const existingTuitions = await Tuition.find({}, 'code').sort({ code: 1 });
    const usedCodes = new Set(existingTuitions.map(t => t.code));

    // Find unused codes
    const unusedCodes = [];
    for (let i = 150; i <= 1000; i++) {
      const candidateCode = `ST${i}`;
      if (!usedCodes.has(candidateCode)) {
        unusedCodes.push(candidateCode);
      }
    }

    // Get some statistics
    const totalUsed = usedCodes.size;
    const totalUnused = unusedCodes.length;
    const nextAvailable = unusedCodes[0] || 'ST1001';

    return NextResponse.json({
      success: true,
      data: {
        totalUsed,
        totalUnused,
        nextAvailable,
        unusedCodes: unusedCodes.slice(0, 50), // Return first 50 unused codes
        usedCodes: Array.from(usedCodes).sort()
      }
    });

  } catch (error) {
    console.error('Error fetching unused codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 