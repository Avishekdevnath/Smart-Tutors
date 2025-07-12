import mongoose, { Schema, models, model } from 'mongoose';

const TutorTuitionSchema = new Schema({
  tutor: { type: Schema.Types.ObjectId, ref: 'Tutor', required: false }, // Made optional for guest applications
  tuition: { type: Schema.Types.ObjectId, ref: 'Tuition', required: true },
  
  // Guest application fields (for non-registered users)
  guestName: { type: String },
  guestPhone: { type: String },
  guestEmail: { type: String },
  guestExperience: { type: String },
  guestMessage: { type: String },
  
  status: { 
    type: String, 
    enum: ['pending', 'selected-for-demo', 'confirmed-fee-pending', 'completed', 'rejected', 'withdrawn'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  completedAt: { type: Date },
  rejectedAt: { type: Date },
  feedback: { type: String },
  guardianFeedback: { type: String },
  demoDate: { type: Date },
  demoCompleted: { type: Boolean, default: false },
  demoFeedback: { type: String },
  demoInstructions: { type: String }, // Instructions sent to tutor for demo
  guardianContactSent: { type: Boolean, default: false }, // Track if guardian contact was sent
  guardianContactSentAt: { type: Date },
  mediaFee: {
    amount: { type: Number },
    dueDate: { type: Date },
    paidAt: { type: Date },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
  },
  notes: { type: String }, // Internal notes for admin
  agreedToTerms: { type: Boolean, default: false },
  confirmationText: { type: String },
}, { timestamps: true });

// Compound index to prevent duplicate applications (only for registered tutors)
TutorTuitionSchema.index({ tutor: 1, tuition: 1 }, { unique: true, sparse: true });

const TutorTuition = models.TutorTuition || model('TutorTuition', TutorTuitionSchema);
export default TutorTuition; 