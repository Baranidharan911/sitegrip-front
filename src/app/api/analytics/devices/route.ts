import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering since this route uses request headers
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, startDate, endDate } = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Call the backend API instead of Google Analytics directly
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/analytics/data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ data: data.data.deviceData });
  } catch (error) {
    console.error('Error fetching device data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device data' },
      { status: 500 }
    );
  }
} 