import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITutorRequest extends Document {
  tutorId: Types.ObjectId;
  tutorName: string;
  guardianName: string;
  guardianPhone: string;
  guardianAddress?: string;
  studentClass: string;
  subjects?: string[];
  message?: string;
  status: 'pending' | 'processing' | 'converted' | 'rejected';
  adminNote?: string;
  tuitionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TutorRequestSchema = new Schema<ITutorRequest>(
  {
    tutorId:        { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },
    tutorName:      { type: String, default: '' },
    guardianName:   { type: String, required: true },
    guardianPhone:  { type: String, required: true },
    guardianAddress:{ type: String, default: '' },
    studentClass:   { type: String, required: true },
    subjects:       { type: [String], default: [] },
    message:        { type: String, default: '' },
    status:         { type: String, enum: ['pending', 'processing', 'converted', 'rejected'], default: 'pending' },
    adminNote:      { type: String, default: '' },
    tuitionId:      { type: Schema.Types.ObjectId, ref: 'Tuition', default: null },
  },
  { timestamps: true }
);

const TutorRequest = mongoose.models.TutorRequest || mongoose.model<ITutorRequest>('TutorRequest', TutorRequestSchema);
export default TutorRequest;
