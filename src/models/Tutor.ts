import mongoose, { Schema, models, model } from 'mongoose';

const TutorSchema = new Schema({
  tutorId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  fatherName: { type: String },
  fatherNumber: { type: String },
  version: { type: String, enum: ['EM', 'BM', 'EV'] },
  group: { type: String, enum: ['Science', 'Arts', 'Commerce'] },
  academicQualifications: {
    sscResult: { type: String },
    hscResult: { type: String },
    oLevelResult: { type: String },
    aLevelResult: { type: String },
  },
  schoolName: { type: String, default: null },
  collegeName: { type: String, default: null },
  university: { type: String },
  universityShortForm: { type: String },
  department: { type: String },
  yearAndSemester: { type: String },
  preferredSubjects: [{ type: String }],
  preferredLocation: [{ type: String }],
  experience: { type: String },
  documents: {
    nidPhoto: { type: String },
    studentIdPhoto: { type: String },
    additionalDocuments: [{
      label: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  // Removed global status - now tracked per application in TutorTuition model
  profileStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  mediaFeeHistory: [
    {
      date: { type: Date, default: Date.now },
      amount: { type: Number },
      description: { type: String },
      dueDate: { type: Date },
      status: {
        type: String,
        enum: ['pending', 'complete', 'overdue'],
        default: 'pending'
      },
    },
  ],
  password: { 
    type: String, 
    minlength: 6,
    default: "654321"
  },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: false,
  },
  // Additional profile fields
  isProfileComplete: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  totalApplications: { type: Number, default: 0 },
  successfulTuitions: { type: Number, default: 0 },
}, { timestamps: true });

const Tutor = models.Tutor || model('Tutor', TutorSchema);
export default Tutor; 