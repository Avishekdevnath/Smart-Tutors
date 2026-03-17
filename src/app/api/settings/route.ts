import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { verifyAdminToken } from '@/lib/adminAuth';

// GET /api/settings — public read (used by frontend components)
export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

// PUT /api/settings — admin only
export async function PUT(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Strip system fields the client shouldn't overwrite
    delete body._id;
    delete body.__v;
    delete body.createdAt;

    body.updatedBy = adminData.username || adminData.name || 'admin';

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
