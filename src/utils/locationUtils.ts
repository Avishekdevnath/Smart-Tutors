import Location from '@/models/Location';

export interface LocationOption {
  value: string;
  label: string;
  division: string;
  district: string;
  area: string;
  formatted: string;
}

/**
 * Get all unique divisions
 */
export async function getDivisions(): Promise<string[]> {
  try {
    const divisions = await Location.distinct('division');
    return divisions.sort();
  } catch (error) {
    console.error('Error fetching divisions:', error);
    return [];
  }
}

/**
 * Get districts by division
 */
export async function getDistrictsByDivision(division: string): Promise<string[]> {
  try {
    const districts = await Location.distinct('district', { division });
    return districts.sort();
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}

/**
 * Get areas by district
 */
export async function getAreasByDistrict(district: string): Promise<string[]> {
  try {
    const areas = await Location.distinct('area', { district });
    return areas.sort();
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
}

/**
 * Get areas by division
 */
export async function getAreasByDivision(division: string): Promise<string[]> {
  try {
    const areas = await Location.distinct('area', { division });
    return areas.sort();
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
}

/**
 * Search locations with autocomplete
 */
export async function searchLocations(query: string, limit: number = 10): Promise<LocationOption[]> {
  try {
    const locations = await Location.find({
      $or: [
        { area: { $regex: query, $options: 'i' } },
        { district: { $regex: query, $options: 'i' } },
        { division: { $regex: query, $options: 'i' } },
        { formatted: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ division: 1, district: 1, area: 1 })
    .limit(limit);

    return locations.map(loc => ({
      value: loc._id.toString(),
      label: loc.formatted,
      division: loc.division,
      district: loc.district,
      area: loc.area,
      formatted: loc.formatted
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

/**
 * Get location by ID
 */
export async function getLocationById(id: string): Promise<LocationOption | null> {
  try {
    const location = await Location.findById(id);
    if (!location) return null;

    return {
      value: location._id.toString(),
      label: location.formatted,
      division: location.division,
      district: location.district,
      area: location.area,
      formatted: location.formatted
    };
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    return null;
  }
}

/**
 * Format location string
 */
export function formatLocationString(division: string, district: string, area: string): string {
  return `${area}, ${district}, ${division} Division`;
}

/**
 * Parse location string back to components
 */
export function parseLocationString(locationString: string): {
  area: string;
  district: string;
  division: string;
} | null {
  try {
    // Expected format: "Area, District, Division Division"
    const parts = locationString.split(', ');
    if (parts.length >= 3) {
      return {
        area: parts[0],
        district: parts[1],
        division: parts[2].replace(' Division', '')
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing location string:', error);
    return null;
  }
}

/**
 * Get location options for dropdowns
 */
export async function getLocationOptions(
  division?: string,
  district?: string,
  limit: number = 50
): Promise<LocationOption[]> {
  try {
    let query: any = {};
    
    if (division) {
      query.division = division;
    }
    
    if (district) {
      query.district = district;
    }
    
    const locations = await Location.find(query)
      .sort({ division: 1, district: 1, area: 1 })
      .limit(limit);

    return locations.map(loc => ({
      value: loc._id.toString(),
      label: loc.formatted,
      division: loc.division,
      district: loc.district,
      area: loc.area,
      formatted: loc.formatted
    }));
  } catch (error) {
    console.error('Error fetching location options:', error);
    return [];
  }
} 