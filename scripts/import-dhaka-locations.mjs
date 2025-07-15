import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define Location schema
const LocationSchema = new mongoose.Schema({
  division: { type: String, required: true },
  district: { type: String, required: true },
  area: { type: String, required: true },
  subarea: { type: String }, // NEW: optional subarea field
  formatted: { type: String }, // For AI-formatted string, optional
  extra: { type: mongoose.Schema.Types.Mixed }, // For any additional AI-extracted info
}, { timestamps: true });

const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema);

async function importDhakaLocations() {
  try {
    console.log('🔄 Connecting to database...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable in .env.local');
    }
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    console.log('📂 Reading Dhaka locations data...');
    const dataPath = path.join(__dirname, '../data_sample/dhaka-locations.json');
    const locationsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`📊 Found ${locationsData.length} locations to import`);
    
    // Clear existing locations (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing locations...');
    await Location.deleteMany({});
    
    // Insert new locations
    console.log('📝 Inserting Dhaka locations...');
    const result = await Location.insertMany(locationsData);
    
    console.log('✅ Successfully imported Dhaka locations!');
    console.log(`📈 Total locations imported: ${result.length}`);
    
    // Show some statistics
    const divisions = [...new Set(result.map(loc => loc.division))];
    const districts = [...new Set(result.map(loc => loc.district))];
    
    console.log('\n📊 Statistics:');
    console.log(`🏛️  Divisions: ${divisions.length} (${divisions.join(', ')})`);
    console.log(`🏘️  Districts: ${districts.length}`);
    console.log(`📍 Total Areas: ${result.length}`);
    
    console.log('\n🏛️  Districts in Dhaka Division:');
    districts.forEach(district => {
      const count = result.filter(loc => loc.district === district).length;
      console.log(`   • ${district}: ${count} areas`);
    });
    
    console.log('\n🎉 Dhaka location collection setup complete!');
    
  } catch (error) {
    console.error('❌ Error importing Dhaka locations:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the import
importDhakaLocations(); 