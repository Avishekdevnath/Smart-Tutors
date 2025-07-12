import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const division = searchParams.get('division');
    const district = searchParams.get('district');
    const area = searchParams.get('area');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    let query: any = {};
    
    if (division) {
      query.division = { $regex: division, $options: 'i' };
    }
    
    if (district) {
      query.district = { $regex: district, $options: 'i' };
    }
    
    if (area) {
      query.area = { $regex: area, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { area: { $regex: search, $options: 'i' } },
        { subarea: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { division: { $regex: search, $options: 'i' } },
        { formatted: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const locations = await Location.find(query)
      .sort({ division: 1, district: 1, area: 1 })
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      locations,
      count: locations.length
    });
    
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { division, district, area, subarea, formatted } = body;
    
    if (!division || !district || !area) {
      return NextResponse.json(
        { error: 'Division, district, and area are required' },
        { status: 400 }
      );
    }
    
    // Check if location already exists
    const existingLocation = await Location.findOne({
      division: division.trim(),
      district: district.trim(),
      area: area.trim(),
      ...(subarea && { subarea: subarea.trim() })
    });
    
    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location already exists' },
        { status: 400 }
      );
    }
    
    // Create new location
    const location = new Location({
      division: division.trim(),
      district: district.trim(),
      area: area.trim(),
      ...(subarea && { subarea: subarea.trim() }),
      formatted: formatted || `${subarea ? subarea.trim() + ', ' : ''}${area.trim()}, ${district.trim()}, ${division.trim()} Division`
    });
    
    await location.save();
    
    return NextResponse.json({
      success: true,
      message: 'Location created successfully',
      location
    });
    
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

// Bulk add locations: POST /api/locations/bulk-add
export async function POST_bulk_add(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Input must be a JSON array' }, { status: 400 });
    }
    let added = 0;
    let skipped = 0;
    let addedLocations = [];
    for (const loc of body) {
      let { division, district, area, subarea, formatted } = loc;
      if (!division || !district || !area) {
        skipped++;
        continue;
      }
      // Normalize all fields: trim and lowercase for duplicate check
      division = (division || '').trim();
      district = (district || '').trim();
      area = (area || '').trim();
      subarea = (subarea || '').trim();
      // Always set subarea to '' if missing
      if (!subarea) subarea = '';
      // Duplicate check: case-insensitive
      const exists = await Location.findOne({
        division: { $regex: `^${division}$`, $options: 'i' },
        district: { $regex: `^${district}$`, $options: 'i' },
        area: { $regex: `^${area}$`, $options: 'i' },
        subarea: { $regex: `^${subarea}$`, $options: 'i' },
      });
      if (exists) {
        skipped++;
        continue;
      }
      const location = new Location({
        division: division.trim(),
        district: district.trim(),
        area: area.trim(),
        subarea: subarea,
        formatted: formatted || `${subarea ? subarea + ', ' : ''}${area.trim()}, ${district.trim()}, ${division.trim()} Division`
      });
      await location.save();
      added++;
      addedLocations.push(location);
    }
    return NextResponse.json({
      success: true,
      added,
      skipped,
      addedLocations
    });
  } catch (error) {
    console.error('Bulk add error:', error);
    return NextResponse.json({ error: 'Bulk add failed' }, { status: 500 });
  }
} 

// Remove duplicates: POST /api/locations/remove-duplicates
export async function POST_remove_duplicates(request: NextRequest) {
  try {
    await dbConnect();
    
    // Find all locations
    const allLocations = await Location.find({});
    console.log(`Found ${allLocations.length} total locations`); // Debug log
    
    if (allLocations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        removed: 0,
        remaining: 0,
        message: 'No locations found in database'
      });
    }
    
    // Group by unique combination
    const uniqueGroups = new Map();
    const duplicates = [];
    
    allLocations.forEach(loc => {
      const key = `${loc.division?.trim().toLowerCase() || ''}-${loc.district?.trim().toLowerCase() || ''}-${loc.area?.trim().toLowerCase() || ''}-${loc.subarea?.trim().toLowerCase() || ''}`;
      
      if (uniqueGroups.has(key)) {
        duplicates.push(loc._id);
      } else {
        uniqueGroups.set(key, loc._id);
      }
    });
    
    console.log(`Found ${duplicates.length} duplicates out of ${allLocations.length} total locations`); // Debug log
    
    // Remove duplicates
    if (duplicates.length > 0) {
      const deleteResult = await Location.deleteMany({ _id: { $in: duplicates } });
      console.log(`Deleted ${deleteResult.deletedCount} duplicate locations`); // Debug log
    }
    
    return NextResponse.json({ 
      success: true, 
      removed: duplicates.length,
      remaining: uniqueGroups.size,
      message: `Successfully removed ${duplicates.length} duplicate locations`
    });
    
  } catch (error) {
    console.error('Error removing duplicates:', error);
    return NextResponse.json({ 
      error: `Failed to remove duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
} 