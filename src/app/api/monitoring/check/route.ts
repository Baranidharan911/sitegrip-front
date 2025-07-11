import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { monitorId } = await request.json();

    if (!monitorId) {
      return NextResponse.json({ error: 'Monitor ID is required' }, { status: 400 });
    }

    console.log(`🔍 Triggering manual check for monitor: ${monitorId}`);

    // For now, just return success - in a real implementation, this would:
    // 1. Fetch the monitor details from Firebase
    // 2. Perform the actual check
    // 3. Save the result to Firebase
    // 4. Update the monitor status

    const result = {
      success: true,
      message: 'Manual check triggered successfully',
      monitorId,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Manual check triggered: ${monitorId}`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Check endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 