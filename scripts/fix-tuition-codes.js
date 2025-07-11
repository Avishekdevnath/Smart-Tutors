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
  guardianAddress: { type: String },
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
  weeklyHours: { type: String },
  tutorRequirement: { type: String, default: "" },
  specificLocation: { type: String },
  description: { type: String },
  confirmedSalary: { type: Number, default: 0 },
  salaryConfirmed: { type: Boolean, default: false },
  guardian: { type: mongoose.Schema.Types.ObjectId, ref: 'Guardian' },
  applications: [{
    tutorId: { type: String, ref: 'Tutor' },
    appliedDate: { type: Date, default: Date.now }
  }],
  selectedTutor: {
    tutorId: { type: String, ref: 'Tutor' },
    selectionDate: { type: Date }
  },
  status: {
    type: String,
    enum: ['open', 'available', 'demo running', 'booked', 'booked by other'],
    default: 'open'
  }
}, { timestamps: true });

const Tuition = mongoose.model('Tuition', TuitionSchema);

async function findAndFixDuplicateCodes() {
  try {
    console.log('🔍 Analyzing tuition codes...\n');

    // Get all tuitions
    const tuitions = await Tuition.find({}).sort({ code: 1 });
    console.log(`📊 Total tuitions found: ${tuitions.length}\n`);

    // Find duplicates
    const codeCounts = {};
    const duplicates = [];
    const usedCodes = new Set();

    tuitions.forEach(tuition => {
      const code = tuition.code;
      codeCounts[code] = (codeCounts[code] || 0) + 1;
      if (codeCounts[code] > 1) {
        duplicates.push(tuition);
      }
      usedCodes.add(code);
    });

    // Find unused codes
    const unusedCodes = [];
    for (let i = 150; i <= 1000; i++) {
      const candidateCode = `ST${i}`;
      if (!usedCodes.has(candidateCode)) {
        unusedCodes.push(candidateCode);
      }
    }

    console.log('📋 Analysis Results:');
    console.log(`   • Duplicate codes found: ${duplicates.length}`);
    console.log(`   • Unused codes available: ${unusedCodes.length}`);
    console.log(`   • First 10 unused codes: ${unusedCodes.slice(0, 10).join(', ')}`);
    console.log(`   • Last 10 unused codes: ${unusedCodes.slice(-10).join(', ')}\n`);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate codes found!');
      return;
    }

    console.log('🔄 Fixing duplicate codes...\n');

    // Fix duplicates
    let fixedCount = 0;
    for (const duplicate of duplicates) {
      if (unusedCodes.length > 0) {
        const newCode = unusedCodes.shift();
        const oldCode = duplicate.code;
        
        console.log(`   • Fixing ${oldCode} → ${newCode}`);
        
        // Update the tuition with new code
        await Tuition.findByIdAndUpdate(duplicate._id, { code: newCode });
        usedCodes.add(newCode);
        fixedCount++;
      } else {
        console.log(`   ⚠️  No more unused codes available for ${duplicate.code}`);
        break;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} duplicate codes`);
    console.log(`📊 Remaining unused codes: ${unusedCodes.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the script
findAndFixDuplicateCodes(); 