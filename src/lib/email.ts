import nodemailer from 'nodemailer';
import { dbConnect } from './mongodb';
import Tutor from '@/models/Tutor';
import Guardian from '@/models/Guardian';
import Tuition from '@/models/Tuition';
import { generateResetToken } from '@/utils/tutorUtils';

// Helper function to get base URL
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.NEXTAUTH_URL || 
         process.env.VERCEL_URL ? 
         `https://${process.env.VERCEL_URL}` : 
         'http://localhost:3000';
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service directly
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // Alternative configuration if service doesn't work:
  // host: 'smtp.gmail.com',
  // port: 587,
  // secure: false, // true for 465, false for other ports
  // requireTLS: true,
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
      from: options.from || `${process.env.EMAIL_FROM_NAME || 'Smart Tutors'} <${process.env.GMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.to);
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw error to prevent registration failure
    console.log('Continuing despite email error...');
  }
}

/**
 * Send welcome email to new tutors
 */
export async function sendWelcomeEmail(
  tutorEmail: string, 
  tutorName: string, 
  tutorId: string, 
  loginPhone: string
): Promise<void> {
  const baseUrl = getBaseUrl();
  const loginUrl = `${baseUrl}/tutors`;
  const dashboardUrl = `${baseUrl}/tutor/dashboard`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">Smart Tutors</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Welcome to our tutoring community!</p>
        </div>

        <!-- Welcome Message -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Welcome, ${tutorName}! 🎉</h2>
          <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
            Congratulations! Your Smart Tutors account has been successfully created. 
            You're now part of our growing community of dedicated educators.
          </p>
        </div>

        <!-- Account Details -->
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">Your Account Details</h3>
          <p style="margin: 8px 0; color: #374151;"><strong>Tutor ID:</strong> ${tutorId}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Login Phone:</strong> ${loginPhone}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> ${tutorEmail}</p>
        </div>

        <!-- Next Steps -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">What's Next? 📚</h3>
          <div style="margin-bottom: 15px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
              <span style="color: #7c3aed; font-weight: bold; margin-right: 10px;">1.</span>
              <span style="color: #374151;">Complete your profile with additional details</span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
              <span style="color: #7c3aed; font-weight: bold; margin-right: 10px;">2.</span>
              <span style="color: #374151;">Browse available tuition opportunities</span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
              <span style="color: #7c3aed; font-weight: bold; margin-right: 10px;">3.</span>
              <span style="color: #374151;">Apply for positions that match your expertise</span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
              <span style="color: #7c3aed; font-weight: bold; margin-right: 10px;">4.</span>
              <span style="color: #374151;">Track your applications in your dashboard</span>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${loginUrl}" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block; 
                    margin-right: 10px; font-weight: bold;">
            Login to Account
          </a>
          <a href="${dashboardUrl}" 
             style="background-color: #059669; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block; 
                    font-weight: bold;">
            Go to Dashboard
          </a>
        </div>

        <!-- Tips -->
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 25px;">
          <h4 style="color: #065f46; margin-top: 0; margin-bottom: 10px;">💡 Pro Tips for Success</h4>
          <ul style="color: #047857; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Keep your profile updated with latest qualifications</li>
            <li style="margin-bottom: 5px;">Respond promptly to application updates</li>
            <li style="margin-bottom: 5px;">Maintain professionalism in all communications</li>
            <li style="margin-bottom: 5px;">Provide quality teaching to build your reputation</li>
          </ul>
        </div>

        <!-- Support -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #6b7280; margin-bottom: 10px;">
            Need help getting started? We're here to support you!
          </p>
          <p style="color: #6b7280; margin-bottom: 15px;">
            Contact us at: <a href="mailto:support@smarttutors.com" style="color: #7c3aed;">support@smarttutors.com</a>
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The Smart Tutors Team</strong>
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Smart Tutors. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textVersion = `
    Welcome to Smart Tutors, ${tutorName}!
    
    Your account has been successfully created.
    
    Account Details:
    - Tutor ID: ${tutorId}
    - Login Phone: ${loginPhone}
    - Email: ${tutorEmail}
    
    Next Steps:
    1. Complete your profile
    2. Browse available tuitions
    3. Apply for teaching positions
    4. Track your applications
    
    Login: ${loginUrl}
    Dashboard: ${dashboardUrl}
    
    Need help? Contact us at support@smarttutors.com
    
    Best regards,
    The Smart Tutors Team
  `;

  await sendEmail({
    to: tutorEmail,
    subject: '🎉 Welcome to Smart Tutors - Your Account is Ready!',
    html,
    text: textVersion,
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
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
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
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
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

/**
 * Send application status update email to tutor
 */
export async function sendApplicationStatusUpdate(
  tutorEmail: string,
  tutorName: string,
  tuitionDetails: {
    tuitionId: string;
    studentClass: string;
    subject: string[];
    location: string;
    salary: number;
  },
  oldStatus: string,
  newStatus: string,
  feedback?: string,
  demoDate?: string
): Promise<void> {
  const statusConfig = {
    confirmed: {
      color: '#10b981',
      bgColor: '#ecfdf5',
      title: '🎉 Congratulations! Your Application has been Confirmed',
      emoji: '✅',
      message: 'Great news! Your application has been accepted.'
    },
    rejected: {
      color: '#ef4444',
      bgColor: '#fef2f2',
      title: '❌ Application Update: Not Selected',
      emoji: '❌',
      message: 'Unfortunately, your application was not selected for this position.'
    },
    completed: {
      color: '#3b82f6',
      bgColor: '#eff6ff',
      title: '🏆 Tuition Completed Successfully',
      emoji: '🎓',
      message: 'Congratulations! You have successfully completed this tuition.'
    },
    withdrawn: {
      color: '#6b7280',
      bgColor: '#f9fafb',
      title: '↩️ Application Withdrawn',
      emoji: '📤',
      message: 'Your application has been withdrawn.'
    }
  };

  const config = statusConfig[newStatus as keyof typeof statusConfig];
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/tutor/dashboard`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">Smart Tutors</h1>
        </div>

        <!-- Status Update -->
        <div style="background-color: ${config?.bgColor || '#f3f4f6'}; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="color: ${config?.color || '#374151'}; margin: 0 0 10px 0; font-size: 22px;">
            ${config?.title || 'Application Status Updated'}
          </h2>
          <p style="color: #374151; font-size: 16px; margin: 0;">
            Hello ${tutorName}, ${config?.message || 'Your application status has been updated.'}
          </p>
        </div>

        <!-- Tuition Details -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">Tuition Details</h3>
          <p style="margin: 8px 0; color: #374151;"><strong>Tuition ID:</strong> ${tuitionDetails.tuitionId}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Class:</strong> ${tuitionDetails.studentClass}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Subjects:</strong> ${tuitionDetails.subject.join(', ')}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> ${tuitionDetails.location}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Salary:</strong> ৳${tuitionDetails.salary.toLocaleString()}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Status:</strong> 
            <span style="background-color: ${config?.color || '#6b7280'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
              ${newStatus.toUpperCase()}
            </span>
          </p>
        </div>

        ${feedback ? `
        <!-- Feedback -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px;">
          <h4 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">💬 Feedback</h4>
          <p style="color: #78350f; margin: 0; font-style: italic;">"${feedback}"</p>
        </div>
        ` : ''}

        ${demoDate ? `
        <!-- Demo Information -->
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px;">
          <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">📅 Demo Scheduled</h4>
          <p style="color: #1e3a8a; margin: 0;">Demo Date: <strong>${new Date(demoDate).toLocaleDateString()}</strong></p>
        </div>
        ` : ''}

        <!-- Next Steps -->
        ${newStatus === 'confirmed' ? `
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h4 style="color: #065f46; margin-top: 0; margin-bottom: 15px;">🚀 Next Steps</h4>
          <ul style="color: #047857; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Contact the guardian to arrange the first class</li>
            <li style="margin-bottom: 8px;">Prepare your teaching materials</li>
            <li style="margin-bottom: 8px;">Confirm the schedule and payment terms</li>
            <li style="margin-bottom: 8px;">Start delivering quality education!</li>
          </ul>
        </div>
        ` : newStatus === 'rejected' ? `
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h4 style="color: #991b1b; margin-top: 0; margin-bottom: 15px;">💪 Keep Going!</h4>
          <p style="color: #7f1d1d; margin: 0;">
            Don't worry! There are many other opportunities available. 
            Keep applying and improving your profile to increase your chances of success.
          </p>
        </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${dashboardUrl}" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block; 
                    font-weight: bold;">
            View Dashboard
          </a>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #6b7280; margin-bottom: 10px;">
            Questions? Contact us at: <a href="mailto:support@smarttutors.com" style="color: #7c3aed;">support@smarttutors.com</a>
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The Smart Tutors Team</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: tutorEmail,
    subject: `${config?.emoji || '📄'} Application Update - ${tuitionDetails.tuitionId}`,
    html,
  });
} 