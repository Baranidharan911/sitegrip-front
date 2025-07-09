import { NextRequest, NextResponse } from 'next/server';

const SCRAPINGBEE_API = 'https://app.scrapingbee.com/api/v1/';
const SCRAPINGBEE_KEY = '03AO48GG72NL2CDT3T1SRO2KCYBYAHFNMANYTX4KJXK2IOTEZHY7A0Y2IEPL5KVKCQ5UHG2HAUZP6BSO';

// ============================
// 🌐 MONITORING API ROUTE
// ============================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'health':
        return NextResponse.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });

      case 'monitors':
        // Return sample monitors for demo
        return NextResponse.json([
          {
            id: '1',
            name: 'WebWatch Homepage',
            url: 'https://webwatch.com',
            status: true,
            uptime: 99.95,
            responseTime: 245,
            lastCheck: new Date().toISOString(),
            isActive: true,
            ssl_cert_days_until_expiry: 45
          },
          {
            id: '2',
            name: 'API Gateway',
            url: 'https://api.webwatch.com',
            status: true,
            uptime: 99.98,
            responseTime: 89,
            lastCheck: new Date().toISOString(),
            isActive: true,
            ssl_cert_days_until_expiry: 12
          },
          {
            id: '3',
            name: 'Database Server',
            url: 'https://db.webwatch.com',
            status: false,
            uptime: 95.2,
            responseTime: null,
            lastCheck: new Date(Date.now() - 300000).toISOString(),
            isActive: true,
            ssl_cert_days_until_expiry: 30
          }
        ]);

      case 'summary':
        return NextResponse.json({
          totalMonitors: 3,
          onlineMonitors: 2,
          offlineMonitors: 1,
          averageUptime: 98.38,
          totalChecks: 15420,
          averageResponseTime: 167,
          incidentsLast24h: 1,
          resolvedToday: 0,
          averageMTTR: 15
        });

      case 'incidents':
        return NextResponse.json([
          {
            id: '1',
            title: 'Database connectivity issues',
            description: 'Database server is experiencing intermittent connectivity problems',
            severity: 'critical',
            status: 'open',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            monitorId: '3',
            duration: '30 minutes',
            affectedUsers: 'All users'
          }
        ]);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_monitor':
        return NextResponse.json({
          id: Date.now().toString(),
          ...data,
          status: true,
          uptime: 100,
          responseTime: 0,
          lastCheck: new Date().toISOString(),
          isActive: true
        });

      case 'trigger_check': {
        const url = data?.url;
        if (!url || typeof url !== 'string') {
          return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }
        const beeUrl = `${SCRAPINGBEE_API}?api_key=${SCRAPINGBEE_KEY}&url=${encodeURIComponent(url)}&render_js=true`;
        const start = Date.now();
        let status = false;
        let responseTime = null;
        let error = null;
        try {
          const res = await fetch(beeUrl, { method: 'GET' });
          responseTime = Date.now() - start;
          status = res.ok;
          if (!res.ok) {
            const errorText = await res.text();
            error = `ScrapingBee error: ${res.status} ${errorText}`;
          }
        } catch (err: any) {
          responseTime = Date.now() - start;
          error = err.message || 'Unknown error';
        }
        return NextResponse.json({
          id: Date.now().toString(),
          monitorId: data.monitorId,
          status,
          responseTime,
          timestamp: new Date().toISOString(),
          error
        });
      }

      case 'update_monitor':
        return NextResponse.json({
          ...data,
          updatedAt: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 