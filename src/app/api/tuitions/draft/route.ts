import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Guardian from '@/models/Guardian';
import Tuition from '@/models/Tuition';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      class: studentClass,
      subjects,
      location,
      locationData,
      version,
      genderPreference,
      daysPerWeek,
      salary,
      guardianName,
      guardianNumber,
      requirements,
    } = body;

    if (!studentClass || !subjects?.length || !guardianName || !guardianNumber) {
      return Response.json({ error: 'Required fields missing' }, { status: 400 });
    }

    if (!/^01\d{9}$/.test(guardianNumber)) {
      return Response.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Honeypot — silently succeed for bots
    if (body._hp) return Response.json({ success: true, message: 'Thank you!' });

    let guardian = await Guardian.findOne({ number: guardianNumber });
    if (!guardian) {
      guardian = await Guardian.create({
        name: guardianName,
        number: guardianNumber,
        address: location || '',
      });
    }

    await Tuition.create({
      guardianName,
      guardianNumber,
      guardian: guardian._id,
      class: studentClass,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      version: version || 'Bangla Medium',
      location: location || '',
      locationData: locationData || {},
      salary: salary || {},
      weeklyDays: daysPerWeek ? String(daysPerWeek) : '',
      tutorGender: genderPreference || 'any',
      specialRemarks: requirements || '',
      status: 'draft',
      source: 'form',
    });

    return Response.json({
      success: true,
      message:
        'আপনার টিউশনের তথ্য জমা হয়েছে! ৩০ মিনিট থেকে ১ ঘণ্টার মধ্যে কনফার্ম করে SMS-এ জানাবো।',
    });
  } catch (error) {
    console.error('Draft tuition error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
