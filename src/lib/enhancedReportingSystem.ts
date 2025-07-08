import { 
  Monitor, 
  Incident, 
  CheckResult, 
  LiveIncidentMap,
  DetailedUptimeReport,
  PerformanceDataPoint,
  PublicStatusPage,
  AuditLog,
  RegionalCheckResult,
  MonitorSummary,
  RegionalStats,
  ProtocolStats,
  SLACompliance,
  AnomalyRecord
} from '../types/uptime';
import { MONITORING_REGIONS } from './enhancedMonitoringEngine';

// ============================
// 📊 ENHANCED REPORTING SYSTEM
// ============================

export class EnhancedReportingSystem {
  private auditLogs: AuditLog[] = [];
  private statusPages: Map<string, PublicStatusPage> = new Map();
  private performanceData: Map<string, PerformanceDataPoint[]> = new Map();

  // ============================
  // 🗺️ LIVE INCIDENT MAP
  // ============================

  async generateLiveIncidentMap(monitors: Monitor[], incidents: Incident[]): Promise<LiveIncidentMap> {
    console.log('🗺️ Generating live incident map...');

    const regions = MONITORING_REGIONS.map(region => {
      const regionIncidents = incidents.filter(incident => {
        const monitor = monitors.find(m => m.id === incident.monitorId);
        return monitor?.regions?.some(r => r.id === region.id) || true; // Default to all if not specified
      });

      const status = this.calculateRegionStatus(regionIncidents);
      
      return {
        regionId: region.id,
        regionName: region.name,
        coordinates: region.coordinates,
        status,
        incidents: regionIncidents,
        lastCheck: new Date()
      };
    });

    const globalStatus = this.calculateGlobalStatus(regions);
    const totalIncidents = incidents.filter(i => i.status === 'open').length;

    return {
      regions,
      globalStatus,
      totalIncidents,
      lastUpdated: new Date()
    };
  }

  private calculateRegionStatus(incidents: Incident[]): 'up' | 'down' | 'degraded' {
    const openIncidents = incidents.filter(i => i.status === 'open');
    
    if (openIncidents.length === 0) return 'up';
    
    const criticalIncidents = openIncidents.filter(i => i.severity === 'critical');
    if (criticalIncidents.length > 0) return 'down';
    
    return 'degraded';
  }

  private calculateGlobalStatus(regions: LiveIncidentMap['regions']): 'operational' | 'degraded' | 'outage' {
    const downRegions = regions.filter(r => r.status === 'down').length;
    const degradedRegions = regions.filter(r => r.status === 'degraded').length;
    
    if (downRegions > regions.length * 0.5) return 'outage';
    if (downRegions > 0 || degradedRegions > 0) return 'degraded';
    return 'operational';
  }

  // ============================
  // 📈 DETAILED UPTIME REPORTS
  // ============================

  async generateDetailedUptimeReport(
    monitorId: string,
    timeRange: { start: Date; end: Date },
    checkResults: CheckResult[],
    incidents: Incident[]
  ): Promise<DetailedUptimeReport> {
    console.log(`📈 Generating detailed uptime report for monitor ${monitorId}`);

    const timeRangeMs = timeRange.end.getTime() - timeRange.start.getTime();
    const totalChecks = checkResults.length;
    const successfulChecks = checkResults.filter(c => c.status).length;
    const failedChecks = totalChecks - successfulChecks;

    // Calculate uptime percentages
    const totalUptime = (successfulChecks / totalChecks) * 100;
    const uptime24h = this.calculateUptimeForPeriod(checkResults, 24 * 60 * 60 * 1000);
    const uptime7d = this.calculateUptimeForPeriod(checkResults, 7 * 24 * 60 * 60 * 1000);
    const uptime30d = this.calculateUptimeForPeriod(checkResults, 30 * 24 * 60 * 60 * 1000);

    // Calculate downtime
    const totalDowntime = this.calculateTotalDowntime(incidents);
    const scheduledDowntime = incidents.filter(i => i.status === 'resolved' && i.notes?.some(n => n.includes('scheduled'))).length;

    // Calculate performance metrics
    const responseTimes = checkResults.map(c => c.responseTime).filter(rt => rt > 0);
    const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length : 0;
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);

    // Generate time series data
    const timeSeries = this.generatePerformanceTimeSeries(checkResults, timeRange);

    // Calculate MTTR and MTBF
    const mttr = this.calculateMTTR(incidents);
    const mtbf = this.calculateMTBF(incidents, timeRangeMs);

    return {
      monitorId,
      timeRange,
      uptime: {
        total: totalUptime,
        '24h': uptime24h,
        '7d': uptime7d,
        '30d': uptime30d
      },
      downtime: {
        total: totalDowntime,
        incidents: incidents.length,
        scheduled: scheduledDowntime
      },
      performance: {
        averageResponseTime: avgResponseTime,
        p95ResponseTime,
        p99ResponseTime,
        timeSeries
      },
      incidents,
      mttr,
      mtbf
    };
  }

  private calculateUptimeForPeriod(checkResults: CheckResult[], periodMs: number): number {
    const cutoffTime = Date.now() - periodMs;
    const periodChecks = checkResults.filter(c => c.createdAt.getTime() > cutoffTime);
    
    if (periodChecks.length === 0) return 100;
    
    const successfulChecks = periodChecks.filter(c => c.status).length;
    return (successfulChecks / periodChecks.length) * 100;
  }

  private calculateTotalDowntime(incidents: Incident[]): number {
    return incidents.reduce((total, incident) => {
      if (incident.endTime) {
        return total + (incident.endTime.getTime() - incident.startTime.getTime());
      }
      return total + (Date.now() - incident.startTime.getTime());
    }, 0) / (1000 * 60); // Convert to minutes
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private generatePerformanceTimeSeries(
    checkResults: CheckResult[],
    timeRange: { start: Date; end: Date }
  ): PerformanceDataPoint[] {
    // Group results by hour for better visualization
    const hourlyData = new Map<string, { responseTimes: number[]; statusCodes: number[] }>();
    
    checkResults.forEach(result => {
      const hour = new Date(result.createdAt.getTime() - (result.createdAt.getTime() % (60 * 60 * 1000))).toISOString();
      
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { responseTimes: [], statusCodes: [] });
      }
      
      const data = hourlyData.get(hour)!;
      data.responseTimes.push(result.responseTime);
      data.statusCodes.push(result.statusCode || 0);
    });

    return Array.from(hourlyData.entries()).map(([timestamp, data]) => ({
      timestamp: new Date(timestamp),
      responseTime: data.responseTimes.reduce((sum, rt) => sum + rt, 0) / data.responseTimes.length,
      statusCode: Math.round(data.statusCodes.reduce((sum, sc) => sum + sc, 0) / data.statusCodes.length)
    }));
  }

  private calculateMTTR(incidents: Incident[]): number {
    const resolvedIncidents = incidents.filter(i => i.endTime);
    
    if (resolvedIncidents.length === 0) return 0;
    
    const totalRecoveryTime = resolvedIncidents.reduce((total, incident) => {
      return total + (incident.endTime!.getTime() - incident.startTime.getTime());
    }, 0);
    
    return totalRecoveryTime / (resolvedIncidents.length * 60 * 1000); // Convert to minutes
  }

  private calculateMTBF(incidents: Incident[], totalTimeMs: number): number {
    if (incidents.length === 0) return totalTimeMs / (60 * 1000); // Convert to minutes
    
    const totalDowntime = this.calculateTotalDowntime(incidents) * 60 * 1000; // Convert to milliseconds
    const uptime = totalTimeMs - totalDowntime;
    
    return uptime / (incidents.length * 60 * 1000); // Convert to minutes
  }

  // ============================
  // 📊 PERFORMANCE TRENDS
  // ============================

  async generatePerformanceTrends(
    monitorId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    ttfb: PerformanceDataPoint[];
    dnsLookup: PerformanceDataPoint[];
    tcpLatency: PerformanceDataPoint[];
    responseSize: PerformanceDataPoint[];
  }> {
    const performanceData = this.performanceData.get(monitorId) || [];
    const filteredData = performanceData.filter(
      point => point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
    );

    // In a real implementation, you'd have separate metrics for each performance aspect
    // For demo purposes, we'll simulate these metrics
    return {
      ttfb: this.simulatePerformanceMetric(filteredData, 'ttfb'),
      dnsLookup: this.simulatePerformanceMetric(filteredData, 'dns'),
      tcpLatency: this.simulatePerformanceMetric(filteredData, 'tcp'),
      responseSize: this.simulatePerformanceMetric(filteredData, 'size')
    };
  }

  private simulatePerformanceMetric(
    data: PerformanceDataPoint[],
    metricType: string
  ): PerformanceDataPoint[] {
    return data.map(point => ({
      ...point,
      responseTime: this.generateSimulatedMetric(point.responseTime, metricType)
    }));
  }

  private generateSimulatedMetric(baseValue: number, metricType: string): number {
    const multipliers = {
      ttfb: 0.3,
      dns: 0.1,
      tcp: 0.2,
      size: 1000 // Response size in bytes
    };
    
    return baseValue * (multipliers[metricType as keyof typeof multipliers] || 1);
  }

  // ============================
  // 🌐 PUBLIC STATUS PAGES
  // ============================

  async createStatusPage(data: Omit<PublicStatusPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<PublicStatusPage> {
    const statusPage: PublicStatusPage = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.statusPages.set(statusPage.id, statusPage);
    this.logAuditEvent('status_page_created', { statusPageId: statusPage.id, title: statusPage.title });
    
    return statusPage;
  }

  async updateStatusPage(id: string, updates: Partial<PublicStatusPage>): Promise<PublicStatusPage> {
    const statusPage = this.statusPages.get(id);
    if (!statusPage) {
      throw new Error(`Status page ${id} not found`);
    }

    const updatedStatusPage = {
      ...statusPage,
      ...updates,
      updatedAt: new Date()
    };

    this.statusPages.set(id, updatedStatusPage);
    this.logAuditEvent('status_page_updated', { statusPageId: id, updates });
    
    return updatedStatusPage;
  }

  async getStatusPage(id: string): Promise<PublicStatusPage | null> {
    return this.statusPages.get(id) || null;
  }

  async getStatusPageBySlug(slug: string): Promise<PublicStatusPage | null> {
    for (const statusPage of Array.from(this.statusPages.values())) {
      if (statusPage.slug === slug) {
        return statusPage;
      }
    }
    return null;
  }

  async deleteStatusPage(id: string): Promise<void> {
    const statusPage = this.statusPages.get(id);
    if (statusPage) {
      this.statusPages.delete(id);
      this.logAuditEvent('status_page_deleted', { statusPageId: id, title: statusPage.title });
    }
  }

  async generateStatusPageData(statusPage: PublicStatusPage, monitors: Monitor[], incidents: Incident[]): Promise<{
    statusPage: PublicStatusPage;
    monitors: Monitor[];
    incidents: Incident[];
    globalStatus: 'operational' | 'degraded' | 'outage';
    lastUpdated: Date;
  }> {
    const pageMonitors = monitors.filter(m => statusPage.monitors.includes(m.id));
    const pageIncidents = incidents.filter(i => 
      statusPage.monitors.includes(i.monitorId) && i.status === 'open'
    );

    const globalStatus = this.calculateGlobalStatusForMonitors(pageMonitors, pageIncidents);

    return {
      statusPage,
      monitors: pageMonitors,
      incidents: pageIncidents,
      globalStatus,
      lastUpdated: new Date()
    };
  }

  private calculateGlobalStatusForMonitors(monitors: Monitor[], incidents: Incident[]): 'operational' | 'degraded' | 'outage' {
    if (incidents.length === 0) return 'operational';
    
    const criticalIncidents = incidents.filter(i => i.severity === 'critical');
    if (criticalIncidents.length > 0) return 'outage';
    
    return 'degraded';
  }

  // ============================
  // 📝 AUDIT LOGS
  // ============================

  logAuditEvent(
    action: string,
    details: Record<string, any>,
    userId?: string,
    monitorId?: string
  ): void {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      action,
      userId,
      monitorId,
      details,
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    };

    this.auditLogs.push(auditLog);
    
    // Keep only last 10,000 audit logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }
  }

  async getAuditLogs(
    filters?: {
      action?: string;
      userId?: string;
      monitorId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100
  ): Promise<AuditLog[]> {
    let filteredLogs = this.auditLogs;

    if (filters?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters?.monitorId) {
      filteredLogs = filteredLogs.filter(log => log.monitorId === filters.monitorId);
    }

    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async exportAuditLogs(
    format: 'csv' | 'json',
    filters?: {
      action?: string;
      userId?: string;
      monitorId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Blob> {
    const logs = await this.getAuditLogs(filters, 10000);

    if (format === 'json') {
      return new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    } else {
      const csvContent = this.convertLogsToCSV(logs);
      return new Blob([csvContent], { type: 'text/csv' });
    }
  }

  private convertLogsToCSV(logs: AuditLog[]): string {
    const headers = ['ID', 'Timestamp', 'Action', 'User ID', 'Monitor ID', 'Details', 'IP Address', 'User Agent'];
    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.action,
      log.userId || '',
      log.monitorId || '',
      JSON.stringify(log.details),
      log.ipAddress || '',
      log.userAgent || ''
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }

  // ============================
  // 📊 ENHANCED SUMMARY REPORTS
  // ============================

  async generateEnhancedSummary(monitors: Monitor[], incidents: Incident[]): Promise<MonitorSummary> {
    const totalMonitors = monitors.length;
    const upMonitors = monitors.filter(m => m.status).length;
    const downMonitors = totalMonitors - upMonitors;
    const pausedMonitors = monitors.filter(m => !m.isActive).length;

    const avgResponseTime = monitors.reduce((sum, m) => sum + (m.lastResponseTime || 0), 0) / totalMonitors;
    const activeIncidents = incidents.filter(i => i.status === 'open').length;

    // Calculate uptime percentage
    const totalChecks = monitors.reduce((sum, m) => sum + (m.uptime || 0), 0);
    const uptime = totalMonitors > 0 ? (totalChecks / totalMonitors).toFixed(2) + '%' : '0%';

    // Generate regional stats
    const regionalStats = await this.generateRegionalStats(monitors);

    // Generate protocol stats
    const protocolStats = this.generateProtocolStats(monitors);

    // Calculate SLA compliance
    const slaCompliance = this.calculateSLACompliance(monitors);

    // Count anomalies and auto-remediations
    const anomalyAlerts = incidents.filter(i => i.rootCause?.aiGenerated).length;
    const autoRemediations = incidents.filter(i => i.autoRemediation?.attempted).length;

    return {
      totalMonitors,
      upMonitors,
      downMonitors,
      pausedMonitors,
      avgResponseTime,
      activeIncidents,
      uptime,
      regionalStats,
      protocolStats,
      slaCompliance,
      anomalyAlerts,
      autoRemediations
    };
  }

  private async generateRegionalStats(monitors: Monitor[]): Promise<RegionalStats[]> {
    return MONITORING_REGIONS.map(region => {
      const regionMonitors = monitors.filter(m => 
        m.regions?.some(r => r.id === region.id) || true // Default to all if not specified
      );
      
      const upMonitors = regionMonitors.filter(m => m.status).length;
      const downMonitors = regionMonitors.length - upMonitors;
      const avgResponseTime = regionMonitors.reduce((sum, m) => sum + (m.lastResponseTime || 0), 0) / regionMonitors.length;
      const uptime = regionMonitors.length > 0 ? (upMonitors / regionMonitors.length) * 100 : 100;

      return {
        regionId: region.id,
        regionName: region.name,
        monitors: regionMonitors.length,
        upMonitors,
        downMonitors,
        avgResponseTime,
        uptime
      };
    });
  }

  private generateProtocolStats(monitors: Monitor[]): ProtocolStats[] {
    const protocolGroups = new Map<string, Monitor[]>();
    
    monitors.forEach(monitor => {
      const protocol = monitor.protocol || 'https';
      if (!protocolGroups.has(protocol)) {
        protocolGroups.set(protocol, []);
      }
      protocolGroups.get(protocol)!.push(monitor);
    });

    return Array.from(protocolGroups.entries()).map(([protocol, protocolMonitors]) => {
      const upMonitors = protocolMonitors.filter(m => m.status).length;
      const downMonitors = protocolMonitors.length - upMonitors;
      const avgResponseTime = protocolMonitors.reduce((sum, m) => sum + (m.lastResponseTime || 0), 0) / protocolMonitors.length;
      const uptime = protocolMonitors.length > 0 ? (upMonitors / protocolMonitors.length) * 100 : 100;

      return {
        protocol,
        monitors: protocolMonitors.length,
        upMonitors,
        downMonitors,
        avgResponseTime,
        uptime
      };
    });
  }

  private calculateSLACompliance(monitors: Monitor[]): SLACompliance {
    const slaMonitors = monitors.filter(m => m.slaTracking?.enabled);
    
    if (slaMonitors.length === 0) {
      return {
        target: 99.9,
        actual: 100,
        compliance: 100,
        violations: 0,
        penalties: 0
      };
    }

    const totalTarget = slaMonitors.reduce((sum, m) => sum + (m.slaTracking?.targetUptime || 99.9), 0);
    const totalActual = slaMonitors.reduce((sum, m) => sum + (m.uptime || 100), 0);
    
    const target = totalTarget / slaMonitors.length;
    const actual = totalActual / slaMonitors.length;
    const compliance = (actual / target) * 100;
    
    const violations = slaMonitors.filter(m => (m.uptime || 100) < (m.slaTracking?.targetUptime || 99.9)).length;
    const penalties = violations * 100; // $100 per violation

    return {
      target,
      actual,
      compliance,
      violations,
      penalties
    };
  }

  // ============================
  // 🛠️ UTILITY FUNCTIONS
  // ============================

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getClientIP(): string {
    // In a real implementation, you'd get this from the request
    return '127.0.0.1';
  }

  private getUserAgent(): string {
    // In a real implementation, you'd get this from the request
    return 'WebWatch-Reporting-System/1.0';
  }

  // ============================
  // 📊 DATA MANAGEMENT
  // ============================

  addPerformanceData(monitorId: string, dataPoint: PerformanceDataPoint): void {
    if (!this.performanceData.has(monitorId)) {
      this.performanceData.set(monitorId, []);
    }

    const data = this.performanceData.get(monitorId)!;
    data.push(dataPoint);

    // Keep only last 1000 data points per monitor
    if (data.length > 1000) {
      data.splice(0, data.length - 1000);
    }
  }

  getPerformanceData(monitorId: string, timeRange?: { start: Date; end: Date }): PerformanceDataPoint[] {
    const data = this.performanceData.get(monitorId) || [];
    
    if (!timeRange) return data;
    
    return data.filter(point => 
      point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
    );
  }

  clearPerformanceData(monitorId: string): void {
    this.performanceData.delete(monitorId);
  }

  getAllStatusPages(): PublicStatusPage[] {
    return Array.from(this.statusPages.values());
  }

  getAuditLogsCount(): number {
    return this.auditLogs.length;
  }
}

// Export singleton instance
export const enhancedReportingSystem = new EnhancedReportingSystem(); 