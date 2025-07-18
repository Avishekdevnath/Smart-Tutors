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
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query with proper case-insensitive matching
    let query: any = {};
    
    if (division) {
      query.division = { $regex: `^${division.trim()}$`, $options: 'i' };
    }
    
    if (district) {
      query.district = { $regex: `^${district.trim()}$`, $options: 'i' };
    }
    
    if (area) {
      query.area = { $regex: `^${area.trim()}$`, $options: 'i' };
    }
    
    if (search) {
      const searchTerm = search.trim();
      query.$or = [
        { area: { $regex: searchTerm, $options: 'i' } },
        { subarea: { $regex: searchTerm, $options: 'i' } },
        { district: { $regex: searchTerm, $options: 'i' } },
        { division: { $regex: searchTerm, $options: 'i' } },
        { formatted: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Execute query with proper sorting and pagination
    const locations = await Location.find(query)
      .sort({ division: 1, district: 1, area: 1, subarea: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalCount = await Location.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      locations,
      count: locations.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount
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
    
    // Validate required fields
    if (!division?.trim() || !district?.trim() || !area?.trim()) {
      return NextResponse.json(
        { error: 'Division, district, and area are required' },
        { status: 400 }
      );
    }
    
    // Normalize input data
    const normalizedDivision = division.trim();
    const normalizedDistrict = district.trim();
    const normalizedArea = area.trim();
    const normalizedSubarea = subarea?.trim() || '';
    
    // Check if location already exists (case-insensitive)
    const existingLocation = await Location.findOne({
      division: { $regex: `^${normalizedDivision}$`, $options: 'i' },
      district: { $regex: `^${normalizedDistrict}$`, $options: 'i' },
      area: { $regex: `^${normalizedArea}$`, $options: 'i' },
      subarea: { $regex: `^${normalizedSubarea}$`, $options: 'i' }
    });
    
    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location already exists' },
        { status: 400 }
      );
    }
    
    // Create new location with normalized data
    const location = new Location({
      division: normalizedDivision,
      district: normalizedDistrict,
      area: normalizedArea,
      subarea: normalizedSubarea,
      formatted: formatted?.trim() || generateFormattedAddress(normalizedSubarea, normalizedArea, normalizedDistrict, normalizedDivision)
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

// Helper function to generate formatted address
function generateFormattedAddress(subarea: string, area: string, district: string, division: string): string {
  const parts = [];
  if (subarea) parts.push(subarea);
  parts.push(area, district, `${division} Division`);
  return parts.join(', ');
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
    let errors = [];
    let addedLocations = [];
    
    for (let i = 0; i < body.length; i++) {
      const loc = body[i];
      let { division, district, area, subarea, formatted } = loc;
      
      // Validate required fields
      if (!division?.trim() || !district?.trim() || !area?.trim()) {
        skipped++;
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }
      
      // Normalize all fields
      division = division.trim();
      district = district.trim();
      area = area.trim();
      subarea = subarea?.trim() || '';
      
      try {
        // Check for duplicates (case-insensitive)
        const exists = await Location.findOne({
          division: { $regex: `^${division}$`, $options: 'i' },
          district: { $regex: `^${district}$`, $options: 'i' },
          area: { $regex: `^${area}$`, $options: 'i' },
          subarea: { $regex: `^${subarea}$`, $options: 'i' }
        });
        
        if (exists) {
          skipped++;
          continue;
        }
        
        // Create new location
        const location = new Location({
          division,
          district,
          area,
          subarea,
          formatted: formatted?.trim() || generateFormattedAddress(subarea, area, district, division)
        });
        
        await location.save();
        added++;
        addedLocations.push(location);
        
      } catch (error) {
        skipped++;
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      added,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
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
    const allLocations = await Location.find({}).lean();
    console.log(`Found ${allLocations.length} total locations`);
    
    if (allLocations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        removed: 0,
        remaining: 0,
        message: 'No locations found in database'
      });
    }
    
    // Group by unique combination (case-insensitive)
    const uniqueGroups = new Map();
    const duplicates = [];
    
    allLocations.forEach(loc => {
      const key = `${(loc.division || '').toLowerCase()}-${(loc.district || '').toLowerCase()}-${(loc.area || '').toLowerCase()}-${(loc.subarea || '').toLowerCase()}`;
      
      if (uniqueGroups.has(key)) {
        duplicates.push(loc._id);
      } else {
        uniqueGroups.set(key, loc._id);
      }
    });
    
    // Remove duplicates
    if (duplicates.length > 0) {
      await Location.deleteMany({ _id: { $in: duplicates } });
    }
    
    const remaining = allLocations.length - duplicates.length;
    
    return NextResponse.json({
      success: true,
      removed: duplicates.length,
      remaining,
      message: `Removed ${duplicates.length} duplicate locations`
    });
    
  } catch (error) {
    console.error('Remove duplicates error:', error);
    return NextResponse.json({ error: 'Failed to remove duplicates' }, { status: 500 });
  }
} 