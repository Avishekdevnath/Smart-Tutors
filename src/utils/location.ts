/**
 * Location utility functions for handling different location data formats
 * Supports both ObjectId references and string arrays
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface LocationData {
  _id?: string;
  name?: string;
  type?: string;
  [key: string]: any;
}

export interface LocationOption {
  value: string;
  label: string;
  division: string;
  district: string;
  area: string;
  formatted: string;
}

/**
 * Safely formats location data regardless of format
 * @param location - Can be ObjectId string, LocationData object, string array, or any other format
 * @returns Formatted location string or fallback text
 */
export function formatLocation(location: any): string {
  if (!location) return 'Location not specified';
  
  // Handle string arrays (most common format)
  if (Array.isArray(location)) {
    if (location.length === 0) return 'Location not specified';
    return location.join(', ');
  }
  
  // Handle ObjectId strings
  if (typeof location === 'string') {
    // If it looks like an ObjectId, return a placeholder
    if (/^[0-9a-fA-F]{24}$/.test(location)) {
      return 'Location (ID)';
    }
    return location;
  }
  
  // Handle objects with name property
  if (typeof location === 'object' && location !== null) {
    if (location.name) return location.name;
    if (location._id) return 'Location (ID)';
    // Try to find any string property that might be a location name
    for (const key in location) {
      if (typeof location[key] === 'string' && location[key].length > 0) {
        return location[key];
      }
    }
  }
  
  return 'Location not specified';
}

/**
 * Formats address data safely
 * @param address - Can be string, object, or array
 * @returns Formatted address string
 */
export function formatAddress(address: any): string {
  if (!address) return 'Address not specified';
  
  // Handle string arrays
  if (Array.isArray(address)) {
    if (address.length === 0) return 'Address not specified';
    return address.join(', ');
  }
  
  // Handle strings
  if (typeof address === 'string') {
    return address;
  }
  
  // Handle objects
  if (typeof address === 'object' && address !== null) {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    
    if (parts.length > 0) return parts.join(', ');
    
    // Fallback: try to find any string property
    for (const key in address) {
      if (typeof address[key] === 'string' && address[key].length > 0) {
        return address[key];
      }
    }
  }
  
  return 'Address not specified';
}

/**
 * Extracts location names from various data formats
 * @param data - Object containing location fields
 * @param locationFields - Array of field names that might contain location data
 * @returns Object with formatted location strings
 */
export function extractLocationData(data: any, locationFields: string[] = ['location', 'address', 'city', 'area']): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const field of locationFields) {
    if (data[field] !== undefined) {
      result[field] = formatLocation(data[field]);
    }
  }
  
  return result;
}

/**
 * Checks if a value looks like an ObjectId
 * @param value - Value to check
 * @returns True if it looks like an ObjectId
 */
export function isObjectId(value: any): boolean {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Safely displays location information with fallbacks
 * @param location - Location data in any format
 * @param fallback - Fallback text if location cannot be determined
 * @returns Safe location display string
 */
export function safeLocationDisplay(location: any, fallback: string = 'Location not specified'): string {
  const formatted = formatLocation(location);
  return formatted === 'Location not specified' ? fallback : formatted;
} 

/**
 * Use Google AI to format and standardize location info.
 * @param rawLocation { division: string, district: string, area: string }
 * @returns { division: string, district: string, area: string, formatted: string, extra?: any }
 */
export async function openaiFormatLocation(rawLocation: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Given the following location information, return a JSON object with standardized fields: division, district, area.
      Format the location data according to Bangladesh geographical divisions.
      
      Input: ${JSON.stringify(rawLocation)}
      
      Return only a valid JSON object with these fields:
      {
        "division": "standardized division name",
        "district": "standardized district name", 
        "area": "standardized area name"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const json = JSON.parse(text);
      return {
        ...json,
        formatted: `${json.area}, ${json.district}, ${json.division}`,
      };
    } catch (parseError) {
      // fallback: return raw with basic formatting
      return {
        ...rawLocation,
        formatted: `${rawLocation.area || ''}, ${rawLocation.district || ''}, ${rawLocation.division || ''}`.replace(/^,\s*|,\s*$/g, ''),
      };
    }
  } catch (error) {
    console.error('Google AI location formatting error:', error);
    // fallback: return raw with basic formatting
    return {
      ...rawLocation,
      formatted: `${rawLocation.area || ''}, ${rawLocation.district || ''}, ${rawLocation.division || ''}`.replace(/^,\s*|,\s*$/g, ''),
    };
  }
} 

/**
 * Get all unique divisions
 */
export async function getDivisions(): Promise<string[]> {
  try {
    // Dynamic import to avoid client-side issues
    const { default: Location } = await import('@/models/Location');
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
    // Dynamic import to avoid client-side issues
    const { default: Location } = await import('@/models/Location');
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
    // Dynamic import to avoid client-side issues
    const { default: Location } = await import('@/models/Location');
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
    // Dynamic import to avoid client-side issues
    const { default: Location } = await import('@/models/Location');
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
    // Dynamic import to avoid client-side issues
    const { default: Location } = await import('@/models/Location');
    
    const locations = await Location.find({
      $or: [
        { division: { $regex: query, $options: 'i' } },
        { district: { $regex: query, $options: 'i' } },
        { area: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit).lean();

    return locations.map(loc => ({
      value: loc._id.toString(),
      label: loc.formatted || `${loc.area}, ${loc.district}, ${loc.division}`,
      division: loc.division,
      district: loc.district,
      area: loc.area,
      formatted: loc.formatted || `${loc.area}, ${loc.district}, ${loc.division}`
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
    // Dynamic import to avoid client-side issues
    const { default: Location } = await import('@/models/Location');
    
    const location = await Location.findById(id).lean();
    if (!location) return null;

    return {
      value: location._id.toString(),
      label: location.formatted || `${location.area}, ${location.district}, ${location.division}`,
      division: location.division,
      district: location.district,
      area: location.area,
      formatted: location.formatted || `${location.area}, ${location.district}, ${location.division}`
    };
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    return null;
  }
}

/**
 * Format location string from components
 */
export function formatLocationString(division: string, district: string, area: string): string {
  return `${area}, ${district}, ${division}`;
}

/**
 * Parse location string into components
 */
export function parseLocationString(locationString: string): {
  area: string;
  district: string;
  division: string;
} | null {
  if (!locationString) return null;
  
  const parts = locationString.split(',').map(part => part.trim());
  if (parts.length < 3) return null;
  
  return {
    area: parts[0],
    district: parts[1],
    division: parts[2]
  };
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
    // Dynamic import to avoid client-side issues
    const { default: Location } = await import('@/models/Location');
    
    let query: any = {};
    if (division) query.division = division;
    if (district) query.district = district;

    const locations = await Location.find(query).limit(limit).lean();

    return locations.map(loc => ({
      value: loc._id.toString(),
      label: loc.formatted || `${loc.area}, ${loc.district}, ${loc.division}`,
      division: loc.division,
      district: loc.district,
      area: loc.area,
      formatted: loc.formatted || `${loc.area}, ${loc.district}, ${loc.division}`
    }));
  } catch (error) {
    console.error('Error fetching location options:', error);
    return [];
  }
} 