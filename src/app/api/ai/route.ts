import { NextRequest, NextResponse } from 'next/server';
import {
  generateTutorDescription,
  generateTuitionDescription,
  analyzeTutorMatch,
  generateRecommendations,
  generateMarketingContent,
  analyzeFeedback,
  generateTuitionPost,
} from '@/lib/google-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'tutor-description':
        const tutorDesc = await generateTutorDescription(
          data.name,
          data.subjects,
          data.experience,
          data.qualifications
        );
        return NextResponse.json({ success: true, data: tutorDesc });

      case 'tuition-description':
        const tuitionDesc = await generateTuitionDescription(
          data.subject,
          data.level,
          data.requirements,
          data.location
        );
        return NextResponse.json({ success: true, data: tuitionDesc });

      case 'analyze-match':
        const matchAnalysis = await analyzeTutorMatch(
          data.tutorProfile,
          data.tuitionRequirements
        );
        return NextResponse.json({ success: true, data: matchAnalysis });

      case 'recommendations':
        const recommendations = await generateRecommendations(
          data.userType,
          data.userData
        );
        return NextResponse.json({ success: true, data: recommendations });

      case 'marketing-content':
        const content = await generateMarketingContent(
          data.contentType,
          data.topic,
          data.options
        );
        return NextResponse.json({ success: true, data: content });

      case 'analyze-feedback':
        const feedbackAnalysis = await analyzeFeedback(data.feedback);
        return NextResponse.json({ success: true, data: feedbackAnalysis });

      case 'tuition-post':
        const tuitionPost = await generateTuitionPost(data);
        return NextResponse.json({ success: true, data: tuitionPost });

      default:
        return NextResponse.json(
          { error: 'Invalid AI feature type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI feature error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
} 