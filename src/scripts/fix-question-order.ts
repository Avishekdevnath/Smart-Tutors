// Run with: npx tsx src/scripts/fix-question-order.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const NEW_QUESTIONS = [
  { field: 'studentClass',  question: 'আপনার সন্তান কোন ক্লাসে পড়ে?',                      required: true,  order: 1, validationHint: 'class 1-12, HSC, Honours, Masters' },
  { field: 'medium',        question: 'English Medium, Bangla Medium না English Version?',    required: true,  order: 2, validationHint: 'Bangla Medium, English Medium, English Version' },
  { field: 'subjects',      question: 'কোন কোন সাবজেক্টে টিউটর চান?',                       required: true,  order: 3, validationHint: 'Math, English, Physics, Chemistry, etc.' },
  { field: 'location',      question: 'আপনার বাসা কোন এলাকায়?',                            required: true,  order: 4, validationHint: 'এলাকার নাম এবং জেলা' },
  { field: 'daysPerWeek',   question: 'সপ্তাহে কয়দিন পড়াতে চান?',                         required: true,  order: 5, validationHint: '1-7 days' },
  { field: 'salary',        question: 'মাসে বেতন কত দিতে চাইবেন?',                         required: true,  order: 6, validationHint: 'amount or range like 3000-5000' },
  { field: 'tutorGender',   question: 'ছেলে না মেয়ে টিউটর পছন্দ করবেন?',                   required: false, order: 7, validationHint: 'male, female, or any' },
  { field: 'guardianName',  question: 'আপনার নামটা জানালে ভালো হয়!',                       required: true,  order: 8, validationHint: 'guardian full name' },
  { field: 'guardianPhone', question: 'আপনার ফোন নম্বরটা দিন, আপডেট পাঠাবো।',             required: true,  order: 9, validationHint: '01XXXXXXXXX, 11 digits Bangladesh number' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const col = db.collection('sitesettings');

  const settings = await col.findOne({});
  if (!settings) { console.log('No settings doc found'); process.exit(0); }

  const existing: any[] = settings.chatConfig?.tuitionQuestions || [];

  let updated: any[];
  if (existing.length === 0) {
    // No questions yet — set full defaults
    updated = NEW_QUESTIONS;
    console.log('No existing questions — inserting defaults');
  } else {
    // Remap order/question by field
    updated = existing.map((q: any) => {
      const override = NEW_QUESTIONS.find(n => n.field === q.field);
      if (!override) return q;
      return { ...q, order: override.order, question: override.question };
    }).sort((a: any, b: any) => a.order - b.order);
    console.log('Updating existing question order');
  }

  await col.updateOne({}, { $set: { 'chatConfig.tuitionQuestions': updated } });
  console.log('Done. New order:');
  updated.forEach((q: any) => console.log(`  ${q.order}. [${q.field}] ${q.question}`));
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
