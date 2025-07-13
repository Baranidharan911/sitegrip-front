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
    
    // Fetch Google Analytics data using the Google Analytics Data API
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [
            {
              startDate,
              endDate,
            },
          ],
          dimensions: [
            {
              name: 'date',
            },
          ],
          metrics: [
            {
              name: 'totalUsers',
            },
            {
              name: 'sessions',
            },
            {
              name: 'screenPageViews',
            },
            {
              name: 'bounceRate',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Analytics Data API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Analytics data' },
      { status: 500 }
    );
  }
} 