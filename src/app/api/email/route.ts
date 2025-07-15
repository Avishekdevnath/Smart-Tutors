import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendContactFormNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'contact':
        await sendContactFormNotification(
          data.name,
          data.email,
          data.subject,
          data.message
        );
        break;

      case 'welcome':
        await sendEmail({
          to: data.email,
          subject: 'Welcome to Smart Tutors!',
          html: data.html,
        });
        break;

      case 'application':
        await sendEmail({
          to: data.email,
          subject: 'New Tuition Application',
          html: data.html,
        });
        break;

      case 'status-update':
        await sendEmail({
          to: data.email,
          subject: 'Application Status Update',
          html: data.html,
        });
        break;

      case 'password-reset':
        await sendEmail({
          to: data.email,
          subject: 'Password Reset Request',
          html: data.html,
        });
        break;

      case 'custom':
        await sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 