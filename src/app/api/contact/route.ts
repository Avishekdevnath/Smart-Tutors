import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendContactFormNotification } from '@/lib/email';
import smsService from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, phone number, subject, and message are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create new contact inquiry
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new',
      ipAddress,
      userAgent
    });

    await contact.save();

    // Send email notification
    try {
      await sendContactFormNotification(name, email, subject, message);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue even if email fails
    }

    // Send SMS greeting to the user
    try {
      const smsMessage = `Hello ${name}, thank you for contacting Smart Tutors! We have received your message and will get back to you soon. Visit us: smarttutors.com.bd`;
      if (phone) {
        await smsService.sendSMS(phone, smsMessage);
      }
    } catch (smsError) {
      console.error('Failed to send SMS greeting:', smsError);
      // Continue even if SMS fails
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const status = searchParams.get('status');
    
    // Build query
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    // Get inquiries sorted by date (newest first)
    const inquiries = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      inquiries,
      count: inquiries.length
    });

  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact inquiries' },
      { status: 500 }
    );
  }
} 