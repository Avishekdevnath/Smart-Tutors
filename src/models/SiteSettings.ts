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

    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

// Singleton pattern — only one settings doc
const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
