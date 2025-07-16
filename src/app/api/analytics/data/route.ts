import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering since this route uses request headers
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, startDate, endDate } = await request.json();
    
    console.log('📊 [Analytics Data] Request received:', { propertyId, startDate, endDate });
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [Analytics Data] No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 [Analytics Data] Token received:', token.substring(0, 20) + '...');
    
    // Call the backend API instead of Google Analytics directly
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log('🌐 [Analytics Data] Calling backend:', `${backendUrl}/api/analytics/data`);
    
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

    console.log('📡 [Analytics Data] Backend response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ [Analytics Data] Backend error response:', errorData);
      } catch (parseError) {
        console.error('❌ [Analytics Data] Failed to parse error response:', parseError);
        errorData = { message: `Backend API error: ${response.status} ${response.statusText}` };
      }
      
      return NextResponse.json(
        { 
          error: errorData.message || errorData.error || `Backend API error: ${response.status}`,
          details: errorData,
          status: response.status
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Analytics Data] Success response received');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [Analytics Data] Internal error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Google Analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

 