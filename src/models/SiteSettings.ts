import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  // Business Identity
  businessName: string;
  tagline: string;
  logoText: string;

  // Contact & Communication
  phoneNumbers: string[];        // primary + backup
  bkashNumber: string;
  nagadNumber: string;
  officeAddress: string;
  googleMapsLink: string;
  emailAddress: string;
  facebookPageUrl: string;
  whatsappNumber: string;

  // Business Hours
  businessHours: {
    sunThu: string;
    fri: string;
    sat: string;
  };

  // Media Fee Configuration
  mediaFeeRules: string[];       // editable list of rule lines
  mediaFeeConfirmText: string;   // the word user must type to agree (default: "Agree")
  mediaFeeNote: string;          // extra note shown below rules

  // Application Settings
  maxApplicationsPerTuition: number;
  autoCloseAfterDays: number;    // 0 = never
  requireAgreement: boolean;

  // Homepage / Hero
  heroHeadline: string;
  heroSubheadline: string;
  heroStatTuitions: string;
  heroStatTutors: string;
  heroStatSuccess: string;

  // SMS Templates
  smsOnTuitionCreated: string;   // use {{code}}, {{class}}, {{location}} placeholders
  smsOnTutorConfirmed: string;
  smsOnApplicationReceived: string;

  // Email Templates
  emailOnContactSubmit: string;

  // Announcements / Notice Bar
  announcementEnabled: boolean;
  announcementText: string;
  announcementType: 'info' | 'warning' | 'success';

  chatConfig: {
    persona: { name: string; greeting: string; personality: string };
    tuitionQuestions: Array<{ field: string; question: string; required: boolean; order: number; validationHint: string }>;
    salaryGuidance: boolean;
    confirmationMessage: string;
    successMessage: string;
    resumeMessage: string;
    escalationMessage: string;
    errorMessage: string;
    whatsappNumber: string;
    knowledgeArticles: Array<{ topic: string; content: string }>;
    maxConversationsPerHour: number;
  };
  searchConfig: {
    weights: { location: number; subject: number; class: number; salary: number; medium: number; gender: number };
  };
  tutorProfileVisibility: {
    showPhone: boolean;
    showEmail: boolean;
    showFatherInfo: boolean;
    showDocuments: boolean;
    showAddress: boolean;
    showSubjects: boolean;
    showLocations: boolean;
    showAcademics: boolean;
    showResults: boolean;
    showExperience: boolean;
    showStats: boolean;
    enableTutorRequest: boolean;
  };

  updatedAt: Date;
  updatedBy: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    businessName:   { type: String, default: 'Smart Tutors' },
    tagline:        { type: String, default: 'টিউশন পরিচালনার সম্পূর্ণ সমাধান' },
    logoText:       { type: String, default: 'Smart Tutors' },

    phoneNumbers:   { type: [String], default: [] },
    bkashNumber:    { type: String, default: '' },
    nagadNumber:    { type: String, default: '' },
    officeAddress:  { type: String, default: 'ঢাকা, বাংলাদেশ' },
    googleMapsLink: { type: String, default: '' },
    emailAddress:   { type: String, default: 'smarttutorsmedia@gmail.com' },
    facebookPageUrl:{ type: String, default: '' },
    whatsappNumber: { type: String, default: '' },

    businessHours: {
      sunThu: { type: String, default: 'সকাল ৯টা – সন্ধ্যা ৬টা' },
      fri:    { type: String, default: 'সকাল ১০টা – বিকাল ২টা' },
      sat:    { type: String, default: 'সকাল ১০টা – বিকাল ৪টা' },
    },

    mediaFeeRules: {
      type: [String],
      default: [
        'গার্ডিয়ান কনফার্ম হলে মিডিয়া ফি (১ দিনের বেতন) অফিসে/বিকাশে প্রদান করতে হবে।',
        'গার্ডিয়ান কনফার্ম হওয়ার পর গার্ডিয়ানের নাম্বার দেয়া হবে।',
        'মিডিয়া ফি না দিলে পরবর্তী টিউশন/গার্ডিয়ান কনফার্মেশন বন্ধ থাকবে।',
      ],
    },
    mediaFeeConfirmText: { type: String, default: 'Agree' },
    mediaFeeNote:        { type: String, default: '' },

    maxApplicationsPerTuition: { type: Number, default: 0 },  // 0 = unlimited
    autoCloseAfterDays:        { type: Number, default: 0 },
    requireAgreement:          { type: Boolean, default: true },

    heroHeadline:    { type: String, default: 'বাংলাদেশের সেরা টিউশন মিডিয়া' },
    heroSubheadline: { type: String, default: 'সঠিক টিউটর খুঁজুন, দ্রুত কনফার্ম করুন' },
    heroStatTuitions:{ type: String, default: '৫০০+' },
    heroStatTutors:  { type: String, default: '১০০০+' },
    heroStatSuccess: { type: String, default: '৯৫%' },

    smsOnTuitionCreated:      { type: String, default: 'নতুন টিউশন {{code}} পোস্ট হয়েছে। Class: {{class}}, Location: {{location}}। আবেদন করুন: smarttutors.com/tuitions' },
    smsOnTutorConfirmed:      { type: String, default: 'অভিনন্দন! আপনি টিউশন {{code}} এ নির্বাচিত হয়েছেন। মিডিয়া ফি প্রদান করুন: {{bkash}}' },
    smsOnApplicationReceived: { type: String, default: 'আপনার টিউশন {{code}} এ নতুন আবেদন এসেছে। ড্যাশবোর্ড চেক করুন।' },

    emailOnContactSubmit: { type: String, default: 'নতুন যোগাযোগ বার্তা পাওয়া গেছে। ড্যাশবোর্ড চেক করুন।' },

    announcementEnabled: { type: Boolean, default: false },
    announcementText:    { type: String, default: '' },
    announcementType:    { type: String, enum: ['info', 'warning', 'success'], default: 'info' },

    chatConfig: {
      persona: {
        name:        { type: String, default: 'কামরুল' },
        greeting:    { type: String, default: 'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?' },
        personality: { type: String, default: 'তুমি কামরুল, একজন বড় ভাইয়ের মতো কথা বলো। casual এবং friendly tone রাখো। বাংলা, English, Banglish সব ভাষায় কথা বলতে পারো।' },
      },
      tuitionQuestions: {
        type: [{
          field:          String,
          question:       String,
          required:       { type: Boolean, default: true },
          order:          Number,
          validationHint: String,
        }],
        default: [
          { field: 'studentClass',  question: 'আপনার সন্তান কোন ক্লাসে পড়ে?',              required: true,  order: 1, validationHint: 'class 1-12, HSC, Honours, Masters' },
          { field: 'medium',        question: 'English Medium, Bangla Medium না English Version?', required: true, order: 2, validationHint: 'Bangla Medium, English Medium, English Version' },
          { field: 'subjects',      question: 'কোন কোন সাবজেক্টে টিউটর চান?',              required: true,  order: 3, validationHint: 'Math, English, Physics, Chemistry, etc.' },
          { field: 'location',      question: 'আপনার বাসা কোন এলাকায়?',                   required: true,  order: 4, validationHint: 'এলাকার নাম এবং জেলা' },
          { field: 'daysPerWeek',   question: 'সপ্তাহে কয়দিন পড়াতে চান?',                required: true,  order: 5, validationHint: '1-7 days' },
          { field: 'salary',        question: 'মাসে বেতন কত দিতে চাইবেন?',                required: true,  order: 6, validationHint: 'amount or range like 3000-5000' },
          { field: 'tutorGender',   question: 'ছেলে না মেয়ে টিউটর পছন্দ করবেন?',          required: false, order: 7, validationHint: 'male, female, or any' },
          { field: 'guardianName',  question: 'আপনার নামটা জানালে ভালো হয়!',              required: true,  order: 8, validationHint: 'guardian full name' },
          { field: 'guardianPhone', question: 'আপনার ফোন নম্বরটা দিন, আপডেট পাঠাবো।',    required: true,  order: 9, validationHint: '01XXXXXXXXX, 11 digits Bangladesh number' },
        ],
      },
      salaryGuidance:      { type: Boolean, default: false },
      confirmationMessage: { type: String, default: 'সব ঠিক আছে? কিছু পরিবর্তন করতে চাইলে বলুন!' },
      successMessage:      { type: String, default: '✅ আপনার তথ্য আমাদের টিমের কাছে পাঠানো হয়েছে! ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে SMS-এ জানাবো। 🙏' },
      resumeMessage:       { type: String, default: 'আবার স্বাগতম! আমরা শেষবার এখানে ছিলাম...' },
      escalationMessage:   { type: String, default: 'আমি আপনাকে আমাদের টিমের সাথে যুক্ত করছি!' },
      errorMessage:        { type: String, default: 'একটু সমস্যা হচ্ছে, কিছুক্ষণ পর আবার চেষ্টা করুন। অথবা সরাসরি ফর্ম পূরণ করুন!' },
      whatsappNumber:      { type: String, default: '' },
      knowledgeArticles: {
        type: [{ topic: String, content: String }],
        default: [],
      },
      maxConversationsPerHour: { type: Number, default: 50 },
    },

    searchConfig: {
      weights: {
        location: { type: Number, default: 0.30 },
        subject:  { type: Number, default: 0.25 },
        class:    { type: Number, default: 0.20 },
        salary:   { type: Number, default: 0.15 },
        medium:   { type: Number, default: 0.05 },
        gender:   { type: Number, default: 0.05 },
      },
    },

    tutorProfileVisibility: {
      showPhone:           { type: Boolean, default: false },
      showEmail:           { type: Boolean, default: false },
      showFatherInfo:      { type: Boolean, default: false },
      showDocuments:       { type: Boolean, default: false },
      showAddress:         { type: Boolean, default: true },
      showSubjects:        { type: Boolean, default: true },
      showLocations:       { type: Boolean, default: true },
      showAcademics:       { type: Boolean, default: true },
      showResults:         { type: Boolean, default: true },
      showExperience:      { type: Boolean, default: true },
      showStats:           { type: Boolean, default: true },
      enableTutorRequest:  { type: Boolean, default: true },
    },

    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

// Singleton pattern — only one settings doc
const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
