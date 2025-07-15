import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import smsService from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).userType !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'send-single':
        return await handleSingleSMS(data);
      case 'send-bulk':
        return await handleBulkSMS(data);
      case 'send-bulk-same':
        return await handleBulkSMSSameMessage(data);
      case 'check-balance':
        return await handleCheckBalance();
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: send-single, send-bulk, send-bulk-same, check-balance' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSingleSMS(data: any) {
  const { number, message } = data;
  if (!number || !message) {
    return NextResponse.json(
      { error: 'Phone number and message are required' },
      { status: 400 }
    );
  }
  const result = await smsService.sendSMS(number, message);
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }
}

async function handleBulkSMS(data: any) {
  const { messages } = data;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'Messages array is required and must not be empty' },
      { status: 400 }
    );
  }
  const result = await smsService.sendBulkSMS(messages);
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }
}

async function handleBulkSMSSameMessage(data: any) {
  const { numbers, message } = data;
  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return NextResponse.json(
      { error: 'Numbers array is required and must not be empty' },
      { status: 400 }
    );
  }
  if (!message) {
    return NextResponse.json(
      { error: 'Message is required' },
      { status: 400 }
    );
  }
  const result = await smsService.sendBulkSMSSameMessage(numbers, message);
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }
}

async function handleCheckBalance() {
  console.log('Checking SMS balance...');
  const result = await smsService.checkBalance();
  console.log('SMS balance result:', result);
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }
} 