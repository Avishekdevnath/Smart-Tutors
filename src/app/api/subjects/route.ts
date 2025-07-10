import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';

// GET - Fetch all subjects
export async function GET() {
  try {
    await dbConnect();
    
    // For now, return a static list of subjects
    // In the future, you can create a Subject model and fetch from database
    const subjects = [
      'Bangla', 'English', 'Math', 'Science', 'Physics', 'Chemistry', 'Biology',
      'History', 'Geography', 'Civics', 'Economics', 'Accounting', 'Business Studies',
      'ICT', 'Computer Science', 'Religious Studies', 'Literature', 'All'
    ];
    
    return NextResponse.json({ 
      success: true, 
      subjects 
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

// POST - Add new subject
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name } = body;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Subject name is required' },
        { status: 400 }
      );
    }
    
    // For now, just return success
    // In the future, you can save to a Subject model in database
    console.log('New subject added:', name);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subject added successfully',
      subject: name
    });
  } catch (error) {
    console.error('Error adding subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add subject' },
      { status: 500 }
    );
  }
} 