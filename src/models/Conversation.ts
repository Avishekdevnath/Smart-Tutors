import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  sessionId: string;
  browserSessionId: string;
  guardianId?: mongoose.Types.ObjectId;
  userPhone?: string;
  userName?: string;
  userType: 'guardian' | 'tutor' | 'unknown';
  intent: 'post_tuition' | 'track_status' | 'faq' | 'support' | null;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  completeness: number;
  confirmedByUser: boolean;
  extractedData: {
    studentClass?: string;
    subjects?: string[];
    location?: {
      division?: string;
      district?: string;
      area?: string;
      subarea?: string;
    };
    medium?: string;
    tutorGender?: string;
    daysPerWeek?: number;
    salary?: { min?: number; max?: number };
    additionalNotes?: string;
    guardianName?: string;
    guardianPhone?: string;
  };
  status: 'active' | 'completed' | 'escalated' | 'abandoned';
  tuitionId?: mongoose.Types.ObjectId;
  escalationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  sessionId: { type: String, required: true, unique: true },
  browserSessionId: { type: String, required: true, index: true },
  guardianId: { type: Schema.Types.ObjectId, ref: 'Guardian' },
  userPhone: { type: String },
  userName: { type: String },
  userType: { type: String, enum: ['guardian', 'tutor', 'unknown'], default: 'unknown' },
  intent: { type: String, enum: ['post_tuition', 'track_status', 'faq', 'support', null], default: null },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  completeness: { type: Number, default: 0 },
  confirmedByUser: { type: Boolean, default: false },
  extractedData: {
    studentClass: String,
    subjects: [String],
    location: {
      division: String,
      district: String,
      area: String,
      subarea: String
    },
    medium: String,
    tutorGender: String,
    daysPerWeek: Number,
    salary: {
      min: Number,
      max: Number
    },
    additionalNotes: String,
    guardianName: String,
    guardianPhone: String
  },
  status: { type: String, enum: ['active', 'completed', 'escalated', 'abandoned'], default: 'active' },
  tuitionId: { type: Schema.Types.ObjectId, ref: 'Tuition' },
  escalationReason: String
}, {
  timestamps: true
});

ConversationSchema.index({ browserSessionId: 1, status: 1, updatedAt: -1 });
ConversationSchema.index({ status: 1, updatedAt: 1 });

const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
