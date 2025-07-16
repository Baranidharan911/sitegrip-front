import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ is_authenticated: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Call the backend GSC API to check authentication status
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/gsc/properties`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Backend API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to match the expected format
    return NextResponse.json({
      is_authenticated: data.success && data.data?.properties && data.data.properties.length > 0,
      properties: data.data?.properties || [],
      index_statuses: []
    });
  } catch (error) {
    console.error('Error in /api/status/:userId:', error);
    return NextResponse.json({ 
      is_authenticated: false, 
      error: 'Failed to fetch analytics properties',
      properties: [],
      index_statuses: []
    }, { status: 500 });
  }
} 