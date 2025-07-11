import mongoose, { Schema, models, model } from 'mongoose';

const TutorTuitionSchema = new Schema({
  tutor: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },
  tuition: { type: Schema.Types.ObjectId, ref: 'Tuition', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'rejected', 'withdrawn'], 
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
  mediaFee: {
    amount: { type: Number },
    dueDate: { type: Date },
    paidAt: { type: Date },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
  },
  notes: { type: String }, // Internal notes for admin
}, { timestamps: true });

// Compound index to prevent duplicate applications
TutorTuitionSchema.index({ tutor: 1, tuition: 1 }, { unique: true });

const TutorTuition = models.TutorTuition || model('TutorTuition', TutorTuitionSchema);
export default TutorTuition; 