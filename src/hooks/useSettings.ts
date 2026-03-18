'use client';

import { useState, useEffect } from 'react';

export interface SiteSettings {
  businessName: string;
  tagline: string;
  logoText: string;
  phoneNumbers: string[];
  bkashNumber: string;
  nagadNumber: string;
  officeAddress: string;
  googleMapsLink: string;
  emailAddress: string;
  facebookPageUrl: string;
  whatsappNumber: string;
  businessHours: { sunThu: string; fri: string; sat: string };
  mediaFeeRules: string[];
  mediaFeeConfirmText: string;
  mediaFeeNote: string;
  maxApplicationsPerTuition: number;
  autoCloseAfterDays: number;
  requireAgreement: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroStatTuitions: string;
  heroStatTutors: string;
  heroStatSuccess: string;
  smsOnTuitionCreated: string;
  smsOnTutorConfirmed: string;
  smsOnApplicationReceived: string;
  emailOnContactSubmit: string;
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
}

const DEFAULT_SETTINGS: SiteSettings = {
  businessName: 'Smart Tutors',
  tagline: 'টিউশন পরিচালনার সম্পূর্ণ সমাধান',
  logoText: 'Smart Tutors',
  phoneNumbers: [],
  bkashNumber: '',
  nagadNumber: '',
  officeAddress: 'ঢাকা, বাংলাদেশ',
  googleMapsLink: '',
  emailAddress: 'smarttutorsmedia@gmail.com',
  facebookPageUrl: '',
  whatsappNumber: '',
  businessHours: { sunThu: 'সকাল ৯টা – সন্ধ্যা ৬টা', fri: 'সকাল ১০টা – বিকাল ২টা', sat: 'সকাল ১০টা – বিকাল ৪টা' },
  mediaFeeRules: [
    'গার্ডিয়ান কনফার্ম হলে মিডিয়া ফি (১ দিনের বেতন) অফিসে/বিকাশে প্রদান করতে হবে।',
    'গার্ডিয়ান কনফার্ম হওয়ার পর গার্ডিয়ানের নাম্বার দেয়া হবে।',
    'মিডিয়া ফি না দিলে পরবর্তী টিউশন/গার্ডিয়ান কনফার্মেশন বন্ধ থাকবে।',
  ],
  mediaFeeConfirmText: 'Agree',
  mediaFeeNote: '',
  maxApplicationsPerTuition: 0,
  autoCloseAfterDays: 0,
  requireAgreement: true,
  heroHeadline: 'বাংলাদেশের সেরা টিউশন মিডিয়া',
  heroSubheadline: 'সঠিক টিউটর খুঁজুন, দ্রুত কনফার্ম করুন',
  heroStatTuitions: '৫০০+',
  heroStatTutors: '১০০০+',
  heroStatSuccess: '৯৫%',
  smsOnTuitionCreated: '',
  smsOnTutorConfirmed: '',
  smsOnApplicationReceived: '',
  emailOnContactSubmit: '',
  announcementEnabled: false,
  announcementText: '',
  announcementType: 'info',
  chatConfig: {
    persona: {
      name:        'কামরুল',
      greeting:    'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?',
      personality: 'তুমি কামরুল, একজন বড় ভাইয়ের মতো কথা বলো। casual এবং friendly tone রাখো। বাংলা, English, Banglish সব ভাষায় কথা বলতে পারো।',
    },
    tuitionQuestions: [
      { field: 'studentClass',  question: 'আপনার সন্তান কোন ক্লাসে পড়ে?',           required: true,  order: 1, validationHint: 'class 1-12, HSC, Honours, Masters' },
      { field: 'subjects',      question: 'কোন কোন সাবজেক্টে টিউটর চান?',           required: true,  order: 2, validationHint: 'Math, English, Physics, Chemistry, etc.' },
      { field: 'location',      question: 'আপনার বাসা কোন এলাকায়?',                required: true,  order: 3, validationHint: 'এলাকার নাম এবং জেলা' },
      { field: 'medium',        question: 'English Medium না Bangla Medium?',        required: true,  order: 4, validationHint: 'Bangla Medium, English Medium, English Version' },
      { field: 'daysPerWeek',   question: 'সপ্তাহে কয়দিন পড়াতে চান?',             required: true,  order: 5, validationHint: '1-7 days' },
      { field: 'salary',        question: 'মাসে বেতন কত দিতে চাইবেন?',             required: true,  order: 6, validationHint: 'amount or range like 3000-5000' },
      { field: 'tutorGender',   question: 'ছেলে না মেয়ে টিউটর পছন্দ করবেন?',       required: false, order: 7, validationHint: 'male, female, or any' },
      { field: 'guardianName',  question: 'আপনার নামটা জানালে ভালো হয়!',           required: true,  order: 8, validationHint: 'guardian full name' },
      { field: 'guardianPhone', question: 'আপনার ফোন নম্বরটা দিন, আপডেট পাঠাবো।', required: true,  order: 9, validationHint: '01XXXXXXXXX, 11 digits Bangladesh number' },
    ],
    salaryGuidance:      false,
    confirmationMessage: 'সব ঠিক আছে? কিছু পরিবর্তন করতে চাইলে বলুন!',
    successMessage:      '✅ আপনার তথ্য আমাদের টিমের কাছে পাঠানো হয়েছে! ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে SMS-এ জানাবো। 🙏',
    resumeMessage:       'আবার স্বাগতম! আমরা শেষবার এখানে ছিলাম...',
    escalationMessage:   'আমি আপনাকে আমাদের টিমের সাথে যুক্ত করছি!',
    errorMessage:        'একটু সমস্যা হচ্ছে, কিছুক্ষণ পর আবার চেষ্টা করুন। অথবা সরাসরি ফর্ম পূরণ করুন!',
    whatsappNumber:      '',
    knowledgeArticles:   [],
    maxConversationsPerHour: 50,
  },
  searchConfig: {
    weights: { location: 0.30, subject: 0.25, class: 0.20, salary: 0.15, medium: 0.05, gender: 0.05 },
  },
};

let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

async function fetchSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings;
  if (!fetchPromise) {
    fetchPromise = fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        cachedSettings = { ...DEFAULT_SETTINGS, ...data };
        fetchPromise = null;
        return cachedSettings as SiteSettings;
      })
      .catch(() => {
        fetchPromise = null;
        return DEFAULT_SETTINGS;
      });
  }
  return fetchPromise;
}

export function invalidateSettingsCache() {
  cachedSettings = null;
  fetchPromise = null;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
