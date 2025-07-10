/**
 * Location utility functions for handling different location data formats
 * Supports both ObjectId references and string arrays
 */

export interface LocationData {
  _id?: string;
  name?: string;
  type?: string;
  [key: string]: any;
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