import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  confidence: number;
}

export interface ContentGenerationOptions {
  tone?: 'professional' | 'friendly' | 'formal';
  length?: 'short' | 'medium' | 'long';
  language?: string;
}

/**
 * Generate tutor profile description
 */
export async function generateTutorDescription(
  name: string,
  subjects: string[],
  experience: number,
  qualifications: string[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate a professional tutor profile description for:
      Name: ${name}
      Subjects: ${Array.isArray(subjects) ? subjects.join(', ') : subjects || 'Not specified'}
      Experience: ${experience} years
      Qualifications: ${qualifications.join(', ')}
      
      Requirements:
      - Professional and engaging tone
      - Highlight key strengths and experience
      - Mention teaching approach
      - Keep it concise (2-3 sentences)
      - Focus on student benefits
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI generation error:', error);
    return `${name} is an experienced tutor with ${experience} years of teaching experience in ${Array.isArray(subjects) ? subjects.join(', ') : subjects || 'Not specified'}.`;
  }
}

/**
 * Generate tuition posting description
 */
export async function generateTuitionDescription(
  subject: string,
  level: string,
  requirements: string[],
  location: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate a compelling tuition posting description for:
      Subject: ${subject}
      Level: ${level}
      Requirements: ${requirements.join(', ')}
      Location: ${location}
      
      Requirements:
      - Professional and attractive tone
      - Highlight what makes this opportunity special
      - Mention student needs and expectations
      - Include location benefits if relevant
      - Keep it concise (3-4 sentences)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI generation error:', error);
    return `Looking for a qualified ${subject} tutor for ${level} level student in ${location}.`;
  }
}

/**
 * Analyze tutor-tuition match
 */
export async function analyzeTutorMatch(
  tutorProfile: {
    subjects: string[];
    experience: number;
    qualifications: string[];
    location: string;
  },
  tuitionRequirements: {
    subject: string;
    level: string;
    requirements: string[];
    location: string;
  }
): Promise<AIAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze the match between a tutor and tuition opportunity:
      
      Tutor Profile:
      - Subjects: ${Array.isArray(tutorProfile.subjects) ? tutorProfile.subjects.join(', ') : tutorProfile.subjects || 'Not specified'}
      - Experience: ${tutorProfile.experience} years
      - Qualifications: ${tutorProfile.qualifications.join(', ')}
      - Location: ${tutorProfile.location}
      
      Tuition Requirements:
      - Subject: ${tuitionRequirements.subject}
      - Level: ${tuitionRequirements.level}
      - Requirements: ${tuitionRequirements.requirements.join(', ')}
      - Location: ${tuitionRequirements.location}
      
      Provide analysis in JSON format:
      {
        "summary": "Brief match summary",
        "recommendations": ["recommendation1", "recommendation2"],
        "confidence": 0.85
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const analysis = JSON.parse(text);
      return analysis;
    } catch {
      // Fallback if JSON parsing fails
      return {
        summary: "Good match based on subject expertise and experience",
        recommendations: ["Consider location proximity", "Verify qualification requirements"],
        confidence: 0.75
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      summary: "Unable to analyze match at this time",
      recommendations: ["Review requirements manually"],
      confidence: 0.5
    };
  }
}

/**
 * Generate personalized recommendations
 */
export async function generateRecommendations(
  userType: 'tutor' | 'guardian',
  userData: any
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';
    
    if (userType === 'tutor') {
      prompt = `
        Generate personalized recommendations for a tutor:
        - Subjects: ${userData.subjects?.join(', ') || 'Not specified'}
        - Experience: ${userData.experience || 0} years
        - Location: ${userData.location || 'Not specified'}
        - Current status: ${userData.status || 'active'}
        
        Provide 3-5 actionable recommendations to improve their profile and get more tuitions.
        Return as a simple list.
      `;
    } else {
      prompt = `
        Generate personalized recommendations for a guardian:
        - Looking for: ${userData.subjects?.join(', ') || 'Not specified'}
        - Student level: ${userData.level || 'Not specified'}
        - Location: ${userData.location || 'Not specified'}
        
        Provide 3-5 actionable recommendations to find the best tutor.
        Return as a simple list.
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse recommendations from text
    const recommendations = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5);
    
    return recommendations;
  } catch (error) {
    console.error('AI recommendation error:', error);
    return [
      "Complete your profile with detailed information",
      "Add relevant qualifications and certifications",
      "Include a professional profile picture"
    ];
  }
}

/**
 * Generate content for marketing materials
 */
export async function generateMarketingContent(
  type: 'email' | 'social' | 'website',
  topic: string,
  options: ContentGenerationOptions = {}
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const { tone = 'professional', length = 'medium', language = 'English' } = options;

    const prompt = `
      Generate ${type} content about: ${topic}
      
      Requirements:
      - Tone: ${tone}
      - Length: ${length}
      - Language: ${language}
      - Include call-to-action if appropriate
      - Focus on value proposition
      - Professional and engaging
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI content generation error:', error);
    return `Learn more about ${topic} and how it can benefit you. Contact us for more information.`;
  }
}

/**
 * Analyze feedback and generate insights
 */
export async function analyzeFeedback(feedback: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
  suggestions: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze this feedback and provide insights:
      "${feedback}"
      
      Return analysis in JSON format:
      {
        "sentiment": "positive/negative/neutral",
        "keyPoints": ["point1", "point2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const analysis = JSON.parse(text);
      return analysis;
    } catch {
      return {
        sentiment: 'neutral',
        keyPoints: ['Feedback received'],
        suggestions: ['Review and respond appropriately']
      };
    }
  } catch (error) {
    console.error('AI feedback analysis error:', error);
    return {
      sentiment: 'neutral',
      keyPoints: ['Unable to analyze feedback'],
      suggestions: ['Review manually']
    };
  }
} 

/**
 * Generate AI-powered tuition post content
 */
export async function generateTuitionPost(
  tuitionData: {
    code: string;
    class: string;
    version: string;
    subjects: string[];
    weeklyDays: string;
    weeklyHours?: string;
    salary: string;
    location: string;
    tutorGender: string;
    specialRemarks?: string;
    urgent?: boolean;
  },
  format: 'detailed' | 'short' = 'detailed'
): Promise<{ detailedPost: string; shortPost: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate Facebook tuition posts for a tutoring platform. Use the exact format provided below.

      Tuition Data:
      - Code: ${tuitionData.code}
      - Class: ${tuitionData.class} (${tuitionData.version})
      - Subjects: ${Array.isArray(tuitionData.subjects) ? tuitionData.subjects.join(', ') : tuitionData.subjects || 'Not specified'}
      - Weekly: ${tuitionData.weeklyDays}${tuitionData.weeklyHours ? ` (${tuitionData.weeklyHours})` : ''}
      - Salary: ${tuitionData.salary}
      - Location: ${tuitionData.location}
      - Tutor Gender: ${tuitionData.tutorGender}
      - Special Remarks: ${tuitionData.specialRemarks || 'None'}
      - Urgent: ${tuitionData.urgent ? 'Yes' : 'No'}

      Generate TWO posts:

      1. DETAILED POST (use exact format):
      🔴 Tuition Code: [CODE]
      ✅ [DYNAMIC TUTOR REQUIREMENT - make it engaging and specific]
      ✒️ Class: [CLASS] ([VERSION]) – [SUBJECTS]
      🕒 Weekly: [DAYS]
      💸 Salary: [SALARY]
      🏠 Location: [LOCATION]
      [REMARKS LINE - only if special remarks exist]
      👉 Only Whatsapp: 01516539430

      2. SHORT POST (one line format):
      [TUTOR TYPE] Needed, [CLASS] ([VERSION]), [SUBJECTS], [DAYS], [SALARY], [LOCATION].
      👉 Only Whatsapp: 01516539430

      Requirements:
      - Use plain text only (no markdown/bold)
      - Make tutor requirement line engaging and specific
      - For detailed post: Use line breaks and emojis exactly as shown
      - For short post: One line, comma-separated, concise
      - Always include the WhatsApp number: 01516539430
      - If urgent, emphasize in tutor requirement line
      - If special remarks exist, add as separate line in detailed post
      - Location should be the exact location provided
      
      Return as JSON:
      {
        "detailedPost": "detailed post text",
        "shortPost": "short post text"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const posts = JSON.parse(text);
      return {
        detailedPost: posts.detailedPost || generateFallbackDetailedPost(tuitionData),
        shortPost: posts.shortPost || generateFallbackShortPost(tuitionData)
      };
    } catch {
      // Fallback if JSON parsing fails
      return {
        detailedPost: generateFallbackDetailedPost(tuitionData),
        shortPost: generateFallbackShortPost(tuitionData)
      };
    }
  } catch (error) {
    console.error('AI post generation error:', error);
    return {
      detailedPost: generateFallbackDetailedPost(tuitionData),
      shortPost: generateFallbackShortPost(tuitionData)
    };
  }
}

/**
 * Generate fallback detailed post when AI fails
 */
function generateFallbackDetailedPost(tuitionData: any): string {
  const tutorLine = tuitionData.tutorGender && tuitionData.tutorGender !== 'Not specified' 
    ? `Experienced ${tuitionData.tutorGender} Tutor Needed`
    : 'Experienced Tutor Needed';
  
  const classLine = `${tuitionData.class} (${tuitionData.version}) – ${Array.isArray(tuitionData.subjects) ? tuitionData.subjects.join(', ') : tuitionData.subjects || 'Not specified'}`;
  const locationLine = tuitionData.location ? `🏠 Location: ${tuitionData.location}` : '';
  const remarksLine = tuitionData.specialRemarks ? `remarks: ${tuitionData.specialRemarks}` : '';
  
  return [
    `🔴 Tuition Code: ${tuitionData.code}`,
    `✅ ${tutorLine}`,
    `✒️ Class: ${classLine}`,
    `🕒 Weekly: ${tuitionData.weeklyDays}${tuitionData.weeklyHours ? ` (${tuitionData.weeklyHours})` : ''}`,
    `💸 Salary: ${tuitionData.salary}`,
    locationLine,
    remarksLine,
    `👉 Only Whatsapp: 01516539430`
  ].filter(Boolean).join('\n');
}

/**
 * Generate fallback short post when AI fails
 */
function generateFallbackShortPost(tuitionData: any): string {
  const tutorType = tuitionData.tutorGender && tuitionData.tutorGender !== 'Not specified' 
    ? `${tuitionData.tutorGender} Tutor`
    : 'Tutor';
  
  const classInfo = `${tuitionData.class} (${tuitionData.version})`;
  const subjects = Array.isArray(tuitionData.subjects) ? tuitionData.subjects.join(', ') : tuitionData.subjects || 'Not specified';
  const weekly = `${tuitionData.weeklyDays}${tuitionData.weeklyHours ? ` (${tuitionData.weeklyHours})` : ''}`;
  const location = tuitionData.location || '';
  
  return [
    `${tutorType} Needed, ${classInfo}, ${subjects}, ${weekly}, ${tuitionData.salary}, ${location}.`,
    `👉 Only Whatsapp: 01516539430`
  ].filter(Boolean).join('\n');
} 