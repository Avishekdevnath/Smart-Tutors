const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri);

const TuitionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  guardianName: { type: String, required: true },
  guardianNumber: { type: String, required: true },
  class: { type: String, required: true },
}, { timestamps: true });

const Tuition = mongoose.model('Tuition', TuitionSchema);

async function listAllCodes() {
  try {
    console.log('📋 Listing all tuition codes...\n');

    // Get all tuitions with their codes
    const tuitions = await Tuition.find({}, 'code guardianName class createdAt').sort({ code: 1 });
    
    console.log(`📊 Total tuitions: ${tuitions.length}\n`);
    
    console.log('Codes in use:');
    tuitions.forEach((tuition, index) => {
      console.log(`${index + 1}. ${tuition.code} - ${tuition.guardianName} (${tuition.class})`);
    });
    
    // Extract just the codes
    const codes = tuitions.map(t => t.code);
    console.log('\n🔢 Raw codes:');
    console.log(codes);
    
    // Check what numbers are being used
    const numbers = codes.map(code => {
      const match = code.match(/ST(\d+)/);
      return match ? parseInt(match[1]) : null;
    }).filter(n => n !== null).sort((a, b) => a - b);
    
    console.log('\n🔢 Numbers in use:');
    console.log(numbers);
    
    // Find gaps
    console.log('\n🔍 Checking for available codes in range 150-200:');
    for (let i = 150; i <= 200; i++) {
      const code = `ST${i}`;
      const exists = codes.includes(code);
      const status = exists ? '❌ Used' : '✅ Available';
      console.log(`${code}: ${status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

listAllCodes(); 