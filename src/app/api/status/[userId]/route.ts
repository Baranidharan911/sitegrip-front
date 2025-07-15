import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ is_authenticated: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Fetch Google Analytics properties using the Google Analytics Management API
    const response = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/accounts',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ is_authenticated: false, error: 'Failed to fetch GA accounts' }, { status: 500 });
    }

    const accountsData = await response.json();
    const properties = [];
    for (const account of accountsData.accounts || []) {
      const propertiesResponse = await fetch(
        `https://analyticsadmin.googleapis.com/v1beta/${account.name}/properties`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        properties.push(...(propertiesData.properties || []));
      }
    }

    return NextResponse.json({
      is_authenticated: properties.length > 0,
      properties,
      index_statuses: []
    });
  } catch (error) {
    console.error('Error in /api/status/:userId:', error);
    return NextResponse.json({ is_authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
} 