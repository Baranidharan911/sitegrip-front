import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering since this route uses request headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      throw new Error(`Google Analytics API error: ${response.status}`);
    }

    const accountsData = await response.json();
    
    // For each account, fetch its properties
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

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error fetching Google Analytics properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Analytics properties' },
      { status: 500 }
    );
  }
} 