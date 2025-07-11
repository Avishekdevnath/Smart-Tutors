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
    // Auto-generate next sequential code
    const lastTuition = await mongoose.model('Tuition').findOne().sort({ createdAt: -1 });
    let nextNumber = 150; // Default starting number
    
    if (lastTuition) {
      // Extract number from existing code (handle both ST123 and 123 formats)
      const existingCode = lastTuition.code;
      const numberMatch = existingCode.match(/(\d+)$/);
      if (numberMatch) {
        nextNumber = parseInt(numberMatch[1]) + 1;
      }
    }
    
    this.code = `ST${nextNumber}`;
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