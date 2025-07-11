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

async function checkSpecificCode(codeToCheck = 'ST131') {
  try {
    console.log(`🔍 Checking for code: ${codeToCheck}\n`);

    // Find all tuitions with this code
    const duplicates = await Tuition.find({ code: codeToCheck });
    
    console.log(`📊 Found ${duplicates.length} tuition(s) with code ${codeToCheck}:`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found for this code!');
      
      // Check what codes are around this number
      const codeNumber = parseInt(codeToCheck.replace('ST', ''));
      const surroundingCodes = [];
      
      for (let i = codeNumber - 5; i <= codeNumber + 5; i++) {
        const checkCode = `ST${i}`;
        const exists = await Tuition.findOne({ code: checkCode });
        surroundingCodes.push({
          code: checkCode,
          exists: !!exists,
          id: exists?._id
        });
      }
      
      console.log('\n📋 Surrounding codes:');
      surroundingCodes.forEach(item => {
        const status = item.exists ? '❌ Used' : '✅ Available';
        console.log(`   ${item.code}: ${status}`);
      });
      
    } else {
      console.log('\n⚠️  DUPLICATES FOUND:');
      duplicates.forEach((dup, index) => {
        console.log(`   ${index + 1}. ID: ${dup._id}`);
        console.log(`      Guardian: ${dup.guardianName}`);
        console.log(`      Class: ${dup.class}`);
        console.log(`      Location: ${dup.location}`);
        console.log(`      Created: ${dup.createdAt}`);
        console.log('');
      });
      
      if (duplicates.length > 1) {
        console.log('🔄 Fixing duplicates by reassigning codes...\n');
        
        // Keep the first one, reassign others
        for (let i = 1; i < duplicates.length; i++) {
          const duplicate = duplicates[i];
          
          // Find next available code
          const allCodes = await Tuition.find({}, 'code').lean();
          const usedCodes = new Set(allCodes.map(t => t.code));
          
          let newCode = null;
          for (let j = 150; j <= 2000; j++) {
            const candidateCode = `ST${j}`;
            if (!usedCodes.has(candidateCode)) {
              newCode = candidateCode;
              break;
            }
          }
          
          if (newCode) {
            console.log(`   • Reassigning ${codeToCheck} → ${newCode} (ID: ${duplicate._id})`);
            await Tuition.findByIdAndUpdate(duplicate._id, { code: newCode });
          } else {
            // Use timestamp as fallback
            const timestampCode = `ST${Date.now()}_${i}`;
            console.log(`   • Reassigning ${codeToCheck} → ${timestampCode} (ID: ${duplicate._id})`);
            await Tuition.findByIdAndUpdate(duplicate._id, { code: timestampCode });
          }
        }
        
        console.log('\n✅ Duplicates fixed!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Get code from command line argument or default to ST131
const codeToCheck = process.argv[2] || 'ST131';
checkSpecificCode(codeToCheck); 