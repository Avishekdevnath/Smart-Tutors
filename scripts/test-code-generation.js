const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import the utility function (we'll simulate it here since it's TypeScript)
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
};

const TuitionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  guardianName: { type: String, required: true },
  guardianNumber: { type: String, required: true },
  class: { type: String, required: true },
  version: { type: String, default: 'English Medium' },
  subjects: [{ type: String }],
  weeklyDays: { type: String },
  dailyHours: { type: String },
  salary: { type: String },
  location: { type: String },
  startMonth: { type: String },
  tutorGender: { type: String, default: "Not specified" },
  specialRemarks: { type: String },
  urgent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['open', 'available', 'demo running', 'booked', 'booked by other'],
    default: 'open'
  }
}, { timestamps: true });

const Tuition = mongoose.model('Tuition', TuitionSchema);

async function generateUniqueTuitionCode() {
  await connectDB();
  
  try {
    // Get all existing codes in one query
    const existingTuitions = await Tuition.find({}, 'code').lean();
    const existingCodes = new Set(existingTuitions.map(t => t.code));
    
    console.log(`📊 Found ${existingTuitions.length} existing codes`);
    
    // First, try to fill gaps in the 100-149 range
    for (let i = 110; i <= 149; i++) {
      const candidateCode = `ST${i}`;
      if (!existingCodes.has(candidateCode)) {
        // Double-check with database
        const doubleCheck = await Tuition.findOne({ code: candidateCode }).lean();
        if (!doubleCheck) {
          console.log(`✅ Generated gap-filling code: ${candidateCode}`);
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
          console.log(`✅ Generated sequential code: ${candidateCode}`);
          return candidateCode;
        }
      }
    }
    
    // If no sequential code available, use timestamp-based
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const timestampCode = `ST${timestamp}_${random}`;
    
    console.log(`⚠️  Using timestamp-based code: ${timestampCode}`);
    return timestampCode;
    
  } catch (error) {
    console.error('❌ Error generating tuition code:', error);
    // Final fallback
    const finalCode = `ST${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    console.warn(`🚨 Using error fallback code: ${finalCode}`);
    return finalCode;
  }
}

async function testCodeGeneration() {
  try {
    console.log('🧪 Testing tuition code generation...\n');
    
    // Test multiple code generations
    const codes = [];
    for (let i = 0; i < 5; i++) {
      console.log(`\n--- Test ${i + 1} ---`);
      const code = await generateUniqueTuitionCode();
      codes.push(code);
      console.log(`Generated: ${code}`);
    }
    
    console.log('\n📋 Summary:');
    console.log('Generated codes:', codes);
    
    // Check for duplicates in generated codes
    const uniqueCodes = new Set(codes);
    if (uniqueCodes.size !== codes.length) {
      console.log('❌ DUPLICATE CODES GENERATED!');
    } else {
      console.log('✅ All generated codes are unique');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testCodeGeneration(); 