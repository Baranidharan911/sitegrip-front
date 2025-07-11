import { NextRequest, NextResponse } from 'next/server';

interface PerformanceData {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
    totalBlockingTime: number;
    speedIndex: number;
    timeToFirstByte: number;
    totalResources: number;
    totalSize: number;
    domSize: number;
  };
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  sessionId?: string;
  userId?: string;
}

interface InteractionData {
  name: string;
  duration: number;
  timestamp: number;
  component?: string;
  sessionId?: string;
  userId?: string;
}

// In-memory storage for development (replace with database in production)
let performanceData: PerformanceData[] = [];
let interactionData: InteractionData[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log(`📊 Performance API: ${type}`, { timestamp: new Date().toISOString() });

    switch (type) {
      case 'performance':
        const perfData: PerformanceData = {
          ...data,
          timestamp: Date.now(),
        };
        performanceData.push(perfData);
        
        // Keep only last 1000 records
        if (performanceData.length > 1000) {
          performanceData = performanceData.slice(-1000);
        }
        
        console.log(`✅ Performance data recorded: ${perfData.score}/100 (${perfData.grade})`);
        break;

      case 'interaction':
        const intData: InteractionData = {
          ...data,
          timestamp: Date.now(),
        };
        interactionData.push(intData);
        
        // Keep only last 5000 interactions
        if (interactionData.length > 5000) {
          interactionData = interactionData.slice(-5000);
        }
        
        console.log(`✅ Interaction data recorded: ${intData.name} (${intData.duration.toFixed(2)}ms)`);
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Performance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const timeRange = searchParams.get('timeRange') || '24h';
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log(`📊 Performance API GET: ${action}`);

    const now = Date.now();
    let startTime: number;

    switch (timeRange) {
      case '1h':
        startTime = now - 60 * 60 * 1000;
        break;
      case '24h':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }

    switch (action) {
      case 'summary':
        const recentPerformance = performanceData.filter(p => p.timestamp >= startTime);
        const recentInteractions = interactionData.filter(i => i.timestamp >= startTime);

        if (recentPerformance.length === 0) {
          return NextResponse.json({
            success: true,
            summary: {
              totalReports: 0,
              totalInteractions: 0,
              averageScore: 0,
              averageLoadTime: 0,
              gradeDistribution: {},
              interactionStats: {},
            }
          });
        }

        const avgScore = recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length;
        const avgLoadTime = recentPerformance.reduce((sum, p) => sum + p.metrics.loadTime, 0) / recentPerformance.length;

        const gradeDistribution = recentPerformance.reduce((dist, p) => {
          dist[p.grade] = (dist[p.grade] || 0) + 1;
          return dist;
        }, {} as Record<string, number>);

        const interactionStats = recentInteractions.reduce((stats, i) => {
          if (!stats[i.name]) {
            stats[i.name] = { count: 0, totalTime: 0, avgTime: 0 };
          }
          stats[i.name].count++;
          stats[i.name].totalTime += i.duration;
          stats[i.name].avgTime = stats[i.name].totalTime / stats[i.name].count;
          return stats;
        }, {} as Record<string, { count: number; totalTime: number; avgTime: number }>);

        return NextResponse.json({
          success: true,
          summary: {
            totalReports: recentPerformance.length,
            totalInteractions: recentInteractions.length,
            averageScore: avgScore,
            averageLoadTime: avgLoadTime,
            gradeDistribution,
            interactionStats,
            timeRange,
          }
        });

      case 'performance':
        const filteredPerformance = performanceData
          .filter(p => p.timestamp >= startTime)
          .slice(-limit)
          .map(p => ({
            timestamp: p.timestamp,
            score: p.score,
            grade: p.grade,
            metrics: {
              loadTime: p.metrics.loadTime,
              firstContentfulPaint: p.metrics.firstContentfulPaint,
              largestContentfulPaint: p.metrics.largestContentfulPaint,
              cumulativeLayoutShift: p.metrics.cumulativeLayoutShift,
              firstInputDelay: p.metrics.firstInputDelay,
            }
          }));

        return NextResponse.json({
          success: true,
          performance: filteredPerformance,
          timeRange,
        });

      case 'interactions':
        const filteredInteractions = interactionData
          .filter(i => i.timestamp >= startTime)
          .slice(-limit)
          .map(i => ({
            name: i.name,
            duration: i.duration,
            timestamp: i.timestamp,
            component: i.component,
          }));

        return NextResponse.json({
          success: true,
          interactions: filteredInteractions,
          timeRange,
        });

      case 'trends':
        const hourlyData = [];
        const hourMs = 60 * 60 * 1000;
        
        for (let i = 0; i < 24; i++) {
          const hourStart = now - (23 - i) * hourMs;
          const hourEnd = hourStart + hourMs;
          
          const hourPerformance = performanceData.filter(p => 
            p.timestamp >= hourStart && p.timestamp < hourEnd
          );
          
          if (hourPerformance.length > 0) {
            const avgScore = hourPerformance.reduce((sum, p) => sum + p.score, 0) / hourPerformance.length;
            const avgLoadTime = hourPerformance.reduce((sum, p) => sum + p.metrics.loadTime, 0) / hourPerformance.length;
            
            hourlyData.push({
              hour: new Date(hourStart).toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
              avgScore: Math.round(avgScore),
              avgLoadTime: Math.round(avgLoadTime),
              count: hourPerformance.length,
            });
          }
        }

        return NextResponse.json({
          success: true,
          trends: hourlyData,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Performance API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    console.log(`📊 Performance API DELETE: ${action}`);

    switch (action) {
      case 'all':
        performanceData = [];
        interactionData = [];
        console.log('✅ All performance data cleared');
        break;
      
      case 'performance':
        performanceData = [];
        console.log('✅ Performance data cleared');
        break;
      
      case 'interactions':
        interactionData = [];
        console.log('✅ Interaction data cleared');
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Performance API DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 