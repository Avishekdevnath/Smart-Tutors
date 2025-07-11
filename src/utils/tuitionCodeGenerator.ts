import { dbConnect } from '@/lib/mongodb';
import Tuition from '@/models/Tuition';

export async function generateUniqueTuitionCode(): Promise<string> {
  await dbConnect();
  
  try {
    // Get all existing codes in one query
    const existingTuitions = await Tuition.find({}, 'code').lean();
    const existingCodes = new Set(existingTuitions.map(t => t.code));
    
    console.log(`Found ${existingTuitions.length} existing tuitions`);
    
    // First, try to fill gaps in the 100-149 range
    for (let i = 110; i <= 149; i++) {
      const candidateCode = `ST${i}`;
      if (!existingCodes.has(candidateCode)) {
        // Double-check with database
        const doubleCheck = await Tuition.findOne({ code: candidateCode }).lean();
        if (!doubleCheck) {
          console.log(`Generated gap-filling code: ${candidateCode}`);
          return candidateCode;
        }
      }
    }
    
    // Then try the normal range starting from 150
    for (let i = 150; i <= 2000; i++) {
      const candidateCode = `ST${i}`;
      if (!existingCodes.has(candidateCode)) {
        // Double-check with database
        const doubleCheck = await Tuition.findOne({ code: candidateCode }).lean();
        if (!doubleCheck) {
          console.log(`Generated sequential code: ${candidateCode}`);
          return candidateCode;
        }
      }
    }
    
    // If no sequential code available, use timestamp-based
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const timestampCode = `ST${timestamp}_${random}`;
    
    console.log(`Generated timestamp code: ${timestampCode}`);
    return timestampCode;
    
  } catch (error) {
    console.error('Error generating tuition code:', error);
    // Final fallback
    const finalCode = `ST${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    console.warn(`Using error fallback code: ${finalCode}`);
    return finalCode;
  }
}

export async function validateTuitionCode(code: string): Promise<boolean> {
  await dbConnect();
  
  try {
    const existing = await Tuition.findOne({ code }).lean();
    return !existing; // Returns true if code is available
  } catch (error) {
    console.error('Error validating tuition code:', error);
    return false;
  }
}

export function formatTuitionCode(input: string): string {
  // Ensure code has ST prefix
  if (!input.startsWith('ST')) {
    // If just a number is provided, add ST prefix
    if (/^\d+$/.test(input)) {
      return `ST${input}`;
    } else {
      // If some other format, add ST prefix
      return `ST${input}`;
    }
  }
  return input;
} 