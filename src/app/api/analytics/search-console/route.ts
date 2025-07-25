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
    
    // Fetch Search Console data using the Search Console API
    const [topQueries, searchTrends] = await Promise.all([
      fetchTopQueries(propertyId, startDate, endDate, token),
      fetchSearchTrends(propertyId, startDate, endDate, token)
    ]);

    const searchConsoleData = {
      topQueries,
      searchTrends
    };
    
    return NextResponse.json({ data: searchConsoleData });
  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Search Console data' },
      { status: 500 }
    );
  }
}

async function fetchTopQueries(propertyId: string, startDate: string, endDate: string, token: string) {
  try {
    const response = await fetch(
      `https://searchconsole.googleapis.com/v1/sites/${propertyId}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 10,
          startRow: 0
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Search Console API error: ${response.status}`);
    }

    const data = await response.json();
    return data.rows?.map((row: any) => ({
      query: row.keys[0],
      clicks: parseInt(row.clicks),
      impressions: parseInt(row.impressions),
      ctr: parseFloat(row.ctr),
      position: parseFloat(row.position)
    })) || [];
  } catch (error) {
    console.warn('Search Console top queries not available:', error);
    throw new Error(`Failed to fetch top queries: ${error.message}`);
  }
}

async function fetchSearchTrends(propertyId: string, startDate: string, endDate: string, token: string) {
  try {
    const response = await fetch(
      `https://searchconsole.googleapis.com/v1/sites/${propertyId}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 31,
          startRow: 0
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Search Console API error: ${response.status}`);
    }

    const data = await response.json();
    return data.rows?.map((row: any) => ({
      date: row.keys[0],
      clicks: parseInt(row.clicks),
      impressions: parseInt(row.impressions),
      ctr: parseFloat(row.ctr),
      position: parseFloat(row.position)
    })) || [];
  } catch (error) {
    console.warn('Search Console trends not available:', error);
    throw new Error(`Failed to fetch search trends: ${error.message}`);
  }
} 