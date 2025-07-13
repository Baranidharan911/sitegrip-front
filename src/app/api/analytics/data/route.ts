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
    
    // Fetch comprehensive Google Analytics data using multiple API calls
    const [
      basicMetrics,
      newUsersData,
      sessionDurationData,
      trafficSourcesData,
      geoData,
      topPagesData,
      searchConsoleData
    ] = await Promise.all([
      // Basic metrics (existing)
      fetchBasicMetrics(propertyId, startDate, endDate, token),
      // New vs Returning Users
      fetchNewUsersData(propertyId, startDate, endDate, token),
      // Session Duration
      fetchSessionDurationData(propertyId, startDate, endDate, token),
      // Traffic Sources
      fetchTrafficSourcesData(propertyId, startDate, endDate, token),
      // Geographic Data
      fetchGeoData(propertyId, startDate, endDate, token),
      // Top Pages
      fetchTopPagesData(propertyId, startDate, endDate, token),
      // Search Console Data (if available)
      fetchSearchConsoleData(propertyId, startDate, endDate, token)
    ]);

    // Combine all data
    const combinedData = {
      basicMetrics,
      newUsersData,
      sessionDurationData,
      trafficSourcesData,
      geoData,
      topPagesData,
      searchConsoleData,
      // Calculate derived metrics
      derivedMetrics: calculateDerivedMetrics(basicMetrics, newUsersData, sessionDurationData)
    };
    
    return NextResponse.json({ data: combinedData });
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Analytics data' },
      { status: 500 }
    );
  }
}

async function fetchBasicMetrics(propertyId: string, startDate: string, endDate: string, token: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'sessionsPerUser' },
          { name: 'screenPageViewsPerSession' }
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Analytics Data API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.rows?.map((row: any) => ({
    date: row.dimensionValues[0].value,
    totalUsers: parseInt(row.metricValues[0].value),
    sessions: parseInt(row.metricValues[1].value),
    screenPageViews: parseInt(row.metricValues[2].value),
    bounceRate: parseFloat(row.metricValues[3].value),
    averageSessionDuration: parseFloat(row.metricValues[4].value),
    sessionsPerUser: parseFloat(row.metricValues[5].value),
    screenPageViewsPerSession: parseFloat(row.metricValues[6].value),
  })) || [];
}

async function fetchNewUsersData(propertyId: string, startDate: string, endDate: string, token: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'newUsers' },
          { name: 'totalUsers' }
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Analytics Data API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.rows?.map((row: any) => ({
    date: row.dimensionValues[0].value,
    newUsers: parseInt(row.metricValues[0].value),
    totalUsers: parseInt(row.metricValues[1].value),
    returningUsers: parseInt(row.metricValues[1].value) - parseInt(row.metricValues[0].value)
  })) || [];
}

async function fetchSessionDurationData(propertyId: string, startDate: string, endDate: string, token: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'averageSessionDuration' }
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Analytics Data API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.rows?.map((row: any) => ({
    date: row.dimensionValues[0].value,
    avgSessionDuration: parseFloat(row.metricValues[0].value)
  })) || [];
}

async function fetchTrafficSourcesData(propertyId: string, startDate: string, endDate: string, token: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' }
        ],
        limit: 10
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Analytics Data API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.rows?.map((row: any) => ({
    source: row.dimensionValues[0].value,
    value: parseInt(row.metricValues[0].value),
    users: parseInt(row.metricValues[1].value)
  })) || [];
}

async function fetchGeoData(propertyId: string, startDate: string, endDate: string, token: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' }
        ],
        limit: 10
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Analytics Data API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.rows?.map((row: any) => ({
    country: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value),
    sessions: parseInt(row.metricValues[1].value)
  })) || [];
}

async function fetchTopPagesData(propertyId: string, startDate: string, endDate: string, token: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' }
        ],
        limit: 10
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Analytics Data API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.rows?.map((row: any) => ({
    page: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value),
    sessions: parseInt(row.metricValues[1].value),
    pageviews: parseInt(row.metricValues[2].value),
    bounceRate: parseFloat(row.metricValues[3].value)
  })) || [];
}

async function fetchSearchConsoleData(propertyId: string, startDate: string, endDate: string, token: string) {
  try {
    // Note: This would require Search Console API access
    // For now, return mock data structure
    return {
      topQueries: [
        { query: 'site audit', clicks: 120, impressions: 1500, ctr: 8.0, position: 12.3 },
        { query: 'seo tools', clicks: 100, impressions: 1200, ctr: 8.3, position: 10.1 },
        { query: 'website monitoring', clicks: 80, impressions: 900, ctr: 8.9, position: 9.5 },
      ],
      searchTrends: [
        { date: '2025-01-01', clicks: 120, impressions: 1500, ctr: 8.0, position: 12.3 },
        { date: '2025-01-02', clicks: 140, impressions: 1700, ctr: 8.2, position: 11.8 },
        { date: '2025-01-03', clicks: 110, impressions: 1600, ctr: 6.9, position: 13.1 },
      ]
    };
  } catch (error) {
    console.warn('Search Console data not available:', error);
    return { topQueries: [], searchTrends: [] };
  }
}

function calculateDerivedMetrics(basicMetrics: any[], newUsersData: any[], sessionDurationData: any[]) {
  if (basicMetrics.length === 0) return {};

  const totalUsers = basicMetrics.reduce((sum, item) => sum + item.totalUsers, 0);
  const totalSessions = basicMetrics.reduce((sum, item) => sum + item.sessions, 0);
  const totalPageViews = basicMetrics.reduce((sum, item) => sum + item.screenPageViews, 0);
  const avgBounceRate = basicMetrics.reduce((sum, item) => sum + item.bounceRate, 0) / basicMetrics.length;
  
  const totalNewUsers = newUsersData.reduce((sum, item) => sum + item.newUsers, 0);
  const totalReturningUsers = newUsersData.reduce((sum, item) => sum + item.returningUsers, 0);
  
  const avgSessionDuration = sessionDurationData.reduce((sum, item) => sum + item.avgSessionDuration, 0) / sessionDurationData.length;
  
  const conversionRate = totalSessions > 0 ? (totalNewUsers / totalSessions) * 100 : 0;

  return {
    totalUsers,
    totalSessions,
    totalPageViews,
    avgBounceRate,
    totalNewUsers,
    totalReturningUsers,
    avgSessionDuration,
    conversionRate
  };
} 