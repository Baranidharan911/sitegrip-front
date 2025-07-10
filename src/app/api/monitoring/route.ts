import { NextRequest, NextResponse } from 'next/server';

const UPTIME_ROBOT_API = 'https://api.uptimerobot.com/v2/';
const UPTIME_ROBOT_KEY = process.env.UPTIME_ROBOT_API_KEY || 'u3021240-f139913b83d2a1d00c8fbb54';

// ============================
// 🌐 MONITORING API ROUTE (UptimeRobot)
// ============================

async function callUptimeRobot(endpoint: string, body: Record<string, any>) {
  try {
    console.log(`🔍 Calling UptimeRobot API: ${endpoint}`, { body });
    
    const res = await fetch(UPTIME_ROBOT_API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api_key: UPTIME_ROBOT_KEY, ...body }).toString(),
    });
    
    const data = await res.json();
    console.log(`📡 UptimeRobot API response:`, { status: res.status, data });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${data.error?.message || data.error || 'UptimeRobot API error'}`);
    }
    
    if (data.stat !== 'ok') {
      throw new Error(data.error?.message || data.error || 'UptimeRobot API error');
    }
    
    return data;
  } catch (error) {
    console.error(`❌ UptimeRobot API error for ${endpoint}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'monitors': {
        const data = await callUptimeRobot('getMonitors', {});
        return NextResponse.json({ success: true, monitors: data.monitors || [] });
      }
      case 'get': {
        const monitorId = searchParams.get('monitorId');
        if (!monitorId) {
          return NextResponse.json({ error: 'Monitor ID required' }, { status: 400 });
        }
        const data = await callUptimeRobot('getMonitors', { monitors: monitorId });
        const monitor = (data.monitors || []).find((m: any) => m.id === monitorId);
        if (!monitor) {
          return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, monitor });
      }
      case 'summary': {
        // UptimeRobot does not have a direct summary endpoint, so fetch monitors and compute summary
        const data = await callUptimeRobot('getMonitors', {});
        const monitors = data.monitors || [];
        const totalMonitors = monitors.length;
        const onlineMonitors = monitors.filter((m: any) => m.status === 2).length;
        const offlineMonitors = monitors.filter((m: any) => m.status !== 2).length;
        const averageUptime = monitors.length ? (monitors.reduce((sum: number, m: any) => sum + (parseFloat(m.all_time_uptime_ratio) || 0), 0) / monitors.length) : 0;
        return NextResponse.json({
          totalMonitors,
          onlineMonitors,
          offlineMonitors,
          averageUptime,
        });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Monitoring API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_monitor': {
        const payload = {
          friendly_name: data.name,
          url: data.url,
          type: 1, // HTTP(s)
        };
        const res = await callUptimeRobot('newMonitor', payload);
        return NextResponse.json(res.monitor);
      }
      case 'trigger_check': {
        // UptimeRobot does not support manual trigger; just fetch status
        const monitors = await callUptimeRobot('getMonitors', { logs: 1, search: data.url });
        const monitor = (monitors.monitors || []).find((m: any) => m.url === data.url);
        if (!monitor) {
          return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
        }
        return NextResponse.json({
          id: monitor.id,
          monitorId: monitor.id,
          status: monitor.status === 2, // 2 = up
          responseTime: monitor.response_times?.[0]?.value || null,
          timestamp: new Date().toISOString(),
          error: null
        });
      }
      case 'get_logs': {
        const monitorId = data.monitorId;
        const limit = data.limit || 50;
        if (!monitorId) {
          return NextResponse.json({ error: 'Monitor ID required' }, { status: 400 });
        }
        const monitorData = await callUptimeRobot('getMonitors', { monitors: monitorId, logs: 1 });
        const monitor = (monitorData.monitors || []).find((m: any) => m.id === monitorId);
        if (!monitor) {
          return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
        }
        // UptimeRobot logs are limited, so we'll return a simplified version
        const logs = monitor.logs ? monitor.logs.slice(0, limit).map((log: any) => ({
          id: log.id,
          type: log.type, // 1 = up, 2 = down
          datetime: log.datetime,
          duration: log.duration,
          response_code: log.response_code,
          details: log.details
        })) : [];
        return NextResponse.json({ success: true, logs });
      }
      case 'delete_monitor': {
        const res = await callUptimeRobot('deleteMonitor', { id: data.id });
        return NextResponse.json(res);
      }
      case 'update_monitor': {
        // UptimeRobot does not support update, so delete and recreate
        await callUptimeRobot('deleteMonitor', { id: data.id });
        const payload = {
          friendly_name: data.name,
          url: data.url,
          type: 1,
        };
        const res = await callUptimeRobot('newMonitor', payload);
        return NextResponse.json(res.monitor);
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 