import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Send email using Gmail SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: options.from || `${process.env.EMAIL_FROM_NAME} <${process.env.GMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send welcome email to new tutors
 */
export async function sendWelcomeEmail(tutorEmail: string, tutorName: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Smart Tutors!</h2>
      <p>Dear ${tutorName},</p>
      <p>Welcome to Smart Tutors! Your account has been successfully created.</p>
      <p>You can now:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Browse available tuitions</li>
        <li>Apply for teaching positions</li>
        <li>Track your applications</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The Smart Tutors Team</p>
    </div>
  `;

  await sendEmail({
    to: tutorEmail,
    subject: 'Welcome to Smart Tutors!',
    html,
  });
}

/**
 * Send tuition application notification
 */
export async function sendApplicationNotification(
  tutorEmail: string,
  tutorName: string,
  tuitionTitle: string,
  guardianName: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Tuition Application</h2>
      <p>Dear ${tutorName},</p>
      <p>Great news! You have a new application for the tuition:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>${tuitionTitle}</h3>
        <p><strong>Guardian:</strong> ${guardianName}</p>
      </div>
      <p>Please review the application and respond accordingly.</p>
      <p>Best regards,<br>The Smart Tutors Team</p>
    </div>
  `;

  await sendEmail({
    to: tutorEmail,
    subject: 'New Tuition Application Received',
    html,
  });
}

/**
 * Send tuition status update
 */
export async function sendTuitionStatusUpdate(
  tutorEmail: string,
  tutorName: string,
  tuitionTitle: string,
  status: 'accepted' | 'rejected' | 'pending'
): Promise<void> {
  const statusColors = {
    accepted: '#10b981',
    rejected: '#ef4444',
    pending: '#f59e0b',
  };

  const statusText = {
    accepted: 'Accepted',
    rejected: 'Rejected',
    pending: 'Under Review',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Tuition Application Update</h2>
      <p>Dear ${tutorName},</p>
      <p>Your application for the tuition has been updated:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>${tuitionTitle}</h3>
        <p style="color: ${statusColors[status]}; font-weight: bold;">
          Status: ${statusText[status]}
        </p>
      </div>
      <p>Please log in to your dashboard for more details.</p>
      <p>Best regards,<br>The Smart Tutors Team</p>
    </div>
  `;

  await sendEmail({
    to: tutorEmail,
    subject: `Tuition Application ${statusText[status]}`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  resetToken: string,
  userName: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Dear ${userName},</p>
      <p>You requested a password reset for your Smart Tutors account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>The Smart Tutors Team</p>
    </div>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Password Reset Request - Smart Tutors',
    html,
  });
}

/**
 * Send contact form notification
 */
export async function sendContactFormNotification(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Contact Form Submission</h2>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      <p>Please respond to this inquiry as soon as possible.</p>
    </div>
  `;

  await sendEmail({
    to: process.env.GMAIL_USER!,
    subject: `Contact Form: ${subject}`,
    html,
  });
} 