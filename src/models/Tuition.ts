import mongoose, { Schema, models, model } from 'mongoose';

const TuitionSchema = new Schema({
  code: { type: String, required: true, unique: true },
  
  // Guardian Information
  guardianName: { type: String, required: true },
  guardianNumber: { type: String, required: true },
  guardianAddress: { type: String },
  
  // Student Information
  class: { type: String, required: true },
  version: {
    type: String,
    enum: ['Bangla Medium', 'English Medium', 'English Version', 'Others'],
    default: 'English Medium'
  },
  subjects: [{ type: String }],
  weeklyDays: { type: String },
  dailyHours: { type: String }, // Changed from weeklyHours
  salary: { type: String },
  location: { type: String },
  startMonth: { type: String },
  
  // Special Requirements
  tutorGender: { type: String, default: "Not specified" },
  specialRemarks: { type: String },
  urgent: { type: Boolean, default: false },
  
  // Legacy fields for backward compatibility
  weeklyHours: { type: String }, // Keep for backward compatibility
  tutorRequirement: { type: String, default: "" },
  specificLocation: { type: String },
  description: { type: String },
  confirmedSalary: { type: Number, default: 0 },
  salaryConfirmed: { type: Boolean, default: false },
  
  // References
  guardian: { type: Schema.Types.ObjectId, ref: 'Guardian' },
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

// Auto-generating Tuition Code (only if no code provided)
TuitionSchema.pre('validate', async function (next) {
  if (!this.code) {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        // Find all existing codes to avoid conflicts
        const existingTuitions = await mongoose.model('Tuition').find({}, 'code').lean();
        const existingCodes = new Set(existingTuitions.map(t => t.code));
        
        // Find the first available code starting from ST150
        let codeFound = false;
        for (let i = 150; i <= 2000; i++) { // Extended range
          const candidateCode = `ST${i}`;
          if (!existingCodes.has(candidateCode)) {
            // Double-check this code doesn't exist (race condition protection)
            const existingCheck = await mongoose.model('Tuition').findOne({ code: candidateCode });
            if (!existingCheck) {
              this.code = candidateCode;
              codeFound = true;
              break;
            }
          }
        }
        
        // If no code found in range, use timestamp-based approach
        if (!codeFound) {
          const timestamp = Date.now();
          this.code = `ST${timestamp}`;
        }
        
        break; // Exit the retry loop
        
      } catch (error) {
        attempts++;
        console.error(`Error generating tuition code (attempt ${attempts}):`, error);
        
        if (attempts >= maxAttempts) {
          // Final fallback - use timestamp with random suffix
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000);
          this.code = `ST${timestamp}_${random}`;
        } else {
          // Wait a bit before retrying (helps with race conditions)
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  } else {
    // Ensure manual code has ST prefix
    if (!this.code.startsWith('ST')) {
      // If just a number is provided, add ST prefix
      if (/^\d+$/.test(this.code)) {
        this.code = `ST${this.code}`;
      } else {
        // If some other format, add ST prefix
        this.code = `ST${this.code}`;
      }
    }
  }
  next();
});

const Tuition = models.Tuition || model('Tuition', TuitionSchema);
export default Tuition; 