import { 
  Monitor, 
  CheckResult, 
  Incident,
  MonitorSummary,
  MonitorStats, 
  SSLInfoResponse, 
  CreateMonitorRequest, 
  UpdateMonitorRequest,
  BulkUpdateRequest,
  BulkUpdateResponse,
  TestResult,
  MonitorType,
  NotificationType,
  StatusPage
} from '../types/uptime';

// Frontend-only uptime monitoring API
class FrontendUptimeApi {
  private readonly STORAGE_KEY = 'webwatch_uptime_monitors';
  private readonly CHECKS_STORAGE_KEY = 'webwatch_uptime_checks';
  private readonly INCIDENTS_STORAGE_KEY = 'webwatch_uptime_incidents';
  private readonly STATS_STORAGE_KEY = 'webwatch_uptime_stats';

  // ============================
  // 📦 LOCAL STORAGE UTILITIES
  // ============================

  private getStoredMonitors(): Monitor[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load monitors from localStorage:', error);
      return [];
    }
  }

  private saveMonitors(monitors: Monitor[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(monitors));
    } catch (error) {
      console.error('Failed to save monitors to localStorage:', error);
    }
  }

  private getStoredChecks(): Record<string, CheckResult[]> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(this.CHECKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load checks from localStorage:', error);
      return {};
    }
  }

  private saveChecks(checks: Record<string, CheckResult[]>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.CHECKS_STORAGE_KEY, JSON.stringify(checks));
    } catch (error) {
      console.error('Failed to save checks to localStorage:', error);
    }
  }

  private getStoredIncidents(): Record<string, Incident[]> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(this.INCIDENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load incidents from localStorage:', error);
      return {};
    }
  }

  private saveIncidents(incidents: Record<string, Incident[]>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
    } catch (error) {
      console.error('Failed to save incidents to localStorage:', error);
    }
  }

  // ============================
  // 🔍 URL VALIDATION & TESTING
  // ============================

  private _validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private async performHttpCheck(url: string, timeout: number = 10000): Promise<{
    status: 'up' | 'down';
    responseTime: number;
    httpStatus: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Use a CORS proxy for demo purposes (in production, you'd use a backend)
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(proxyUrl, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        status: response.ok ? 'up' : 'down',
        responseTime,
        httpStatus: response.status,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'down',
            responseTime,
            httpStatus: 0,
            error: 'Request timeout'
          };
        }
      }

      return {
        status: 'down',
        responseTime,
        httpStatus: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkSSL(url: string): Promise<SSLInfoResponse> {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        return {
          ssl_monitoring_enabled: false,
          message: 'Not HTTPS',
          ssl_info: {
            valid: false,
            is_valid: false,
            is_self_signed: false,
            days_until_expiry: 0
          }
        };
      }

      // For demo purposes, we'll simulate SSL checks
      // In a real implementation, you'd need a backend to check SSL certificates
      const isSecure = Math.random() > 0.1; // 90% chance of being secure for demo
      const daysUntilExpiry = isSecure ? Math.floor(Math.random() * 365) + 30 : Math.floor(Math.random() * 30);

      return {
        ssl_monitoring_enabled: true,
        message: isSecure ? 'Valid certificate' : 'Certificate expired or invalid',
        ssl_info: {
          valid: isSecure,
          is_valid: isSecure,
          is_self_signed: false,
          days_until_expiry: daysUntilExpiry,
          issuer: isSecure ? 'Demo Certificate Authority' : undefined,
          subject: isSecure ? urlObj.hostname : undefined,
          expires_at: isSecure ? new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000).toISOString() : undefined
        }
      };
    } catch (error) {
      return {
        ssl_monitoring_enabled: false,
        message: 'Invalid URL',
        ssl_info: {
          valid: false,
          is_valid: false,
          is_self_signed: false,
          days_until_expiry: 0
        }
      };
    }
  }

  // ============================
  // 🔧 MONITOR CRUD OPERATIONS
  // ============================

  async createMonitor(data: CreateMonitorRequest): Promise<Monitor> {
    console.log('🚀 FrontendUptimeApi: Creating monitor...', data);
    
    if (!this._validateUrl(data.url)) {
      throw new Error('Invalid URL format');
    }

    const monitors = this.getStoredMonitors();
    const newMonitor: Monitor = {
      id: `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      url: data.url,
      type: data.type || 'http',
      interval: data.interval || 60,
      timeout: data.timeout || 10,
      retries: data.retries || 3,
      userId: 'demo-user',
      status: true, // Start as up
      createdAt: new Date(),
      updatedAt: new Date(),
      lastCheck: undefined,
      lastResponseTime: undefined,
      lastStatusCode: undefined,
      uptime: 100,
      downtime: 0,
      tags: data.tags || [],
      notifications: data.notifications || [],
      threshold: data.threshold,
      isActive: data.isActive !== false,
      description: data.description || '',
      expectedStatusCode: data.expectedStatusCode || 200,
      retryInterval: data.retryInterval || 30,
      // Additional properties for incident management
      last_status: 'up',
      failures_in_a_row: 0,
      ssl_status: 'valid',
      ssl_monitoring_enabled: data.url.startsWith('https://'),
      uptime_stats: {
        '24h': 100,
        '7d': 100,
        '30d': 100
      }
    };

    monitors.push(newMonitor);
    this.saveMonitors(monitors);

    // Perform initial check
    await this.performMonitorCheck(newMonitor.id);

    console.log('✅ FrontendUptimeApi: Created monitor successfully:', newMonitor);
    return newMonitor;
  }

  async getAllMonitors(): Promise<Monitor[]> {
    const monitors = this.getStoredMonitors();
    console.log(`📊 FrontendUptimeApi: Loaded ${monitors.length} monitors`);
    return monitors;
  }

  async getMonitorById(id: string): Promise<Monitor> {
    const monitors = this.getStoredMonitors();
    const monitor = monitors.find(m => m.id === id);
    if (!monitor) {
      throw new Error('Monitor not found');
    }
    return monitor;
  }

  async updateMonitor(id: string, data: UpdateMonitorRequest): Promise<Monitor> {
    const monitors = this.getStoredMonitors();
    const index = monitors.findIndex(m => m.id === id);
    
    if (index === -1) {
      throw new Error('Monitor not found');
    }

    if (data.url && !this._validateUrl(data.url)) {
      throw new Error('Invalid URL format');
    }

    monitors[index] = {
      ...monitors[index],
      ...data,
      updatedAt: new Date(),
    };

    this.saveMonitors(monitors);
    return monitors[index];
  }

  async deleteMonitor(id: string): Promise<void> {
    const monitors = this.getStoredMonitors();
    const filteredMonitors = monitors.filter(m => m.id !== id);
    
    if (filteredMonitors.length === monitors.length) {
      throw new Error('Monitor not found');
    }

    this.saveMonitors(filteredMonitors);

    // Clean up related data
    const checks = this.getStoredChecks();
    delete checks[id];
    this.saveChecks(checks);

    const incidents = this.getStoredIncidents();
    delete incidents[id];
    this.saveIncidents(incidents);
  }

  // ============================
  // 🔍 MONITOR CHECKS & TESTING
  // ============================

  async performMonitorCheck(monitorId: string): Promise<CheckResult> {
    const monitors = this.getStoredMonitors();
    const monitor = monitors.find(m => m.id === monitorId);
    
    if (!monitor) {
      throw new Error('Monitor not found');
    }

    const startTime = Date.now();
    const checkResult = await this.performHttpCheck(monitor.url, monitor.timeout * 1000);
    const checkTime = new Date().toISOString();

    const result: CheckResult = {
      id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      monitorId,
      status: checkResult.status === 'up',
      responseTime: checkResult.responseTime,
      statusCode: checkResult.httpStatus,
      message: checkResult.status === 'up' ? 'Check successful' : checkResult.error || 'Check failed',
      createdAt: new Date(),
      error: checkResult.error
    };

    // Update monitor status
    const monitorIndex = monitors.findIndex(m => m.id === monitorId);
    if (monitorIndex !== -1) {
      const oldStatus = monitors[monitorIndex].status;
      monitors[monitorIndex] = {
        ...monitors[monitorIndex],
        status: checkResult.status === 'up',
        lastCheck: new Date(),
        lastResponseTime: checkResult.responseTime,
        lastStatusCode: checkResult.httpStatus,
        updatedAt: new Date(),
        last_status: checkResult.status === 'up' ? 'up' : 'down'
      };

      if (checkResult.status === 'up') {
        monitors[monitorIndex].lastUp = new Date();
      } else {
        monitors[monitorIndex].lastDown = new Date();
      }

      // Update uptime percentage (simplified calculation)
      const checks = this.getStoredChecks();
      if (!checks[monitorId]) {
        checks[monitorId] = [];
      }
      checks[monitorId].unshift(result);
      checks[monitorId] = checks[monitorId].slice(0, 100); // Keep last 100 checks
      this.saveChecks(checks);

      // Calculate uptime percentage
      const recentChecks = checks[monitorId].slice(0, 30); // Last 30 checks
      const upChecks = recentChecks.filter(c => c.status === true).length;
      monitors[monitorIndex].uptime = recentChecks.length > 0 ? (upChecks / recentChecks.length) * 100 : 100;

      this.saveMonitors(monitors);

      // Check for status change and create incident
      if ((oldStatus ? 'up' : 'down') !== checkResult.status) {
        await this.createIncident(monitorId, checkResult.status, result);
      }
    }

    return result;
  }

  async getMonitorChecks(monitorId: string, limit: number = 30): Promise<CheckResult[]> {
    const checks = this.getStoredChecks();
    return (checks[monitorId] || []).slice(0, limit);
  }

  async testMonitor(url: string, timeout?: number): Promise<TestResult> {
    if (!this._validateUrl(url)) {
      throw new Error('Invalid URL format');
    }

    const checkResult = await this.performHttpCheck(url, (timeout || 10) * 1000);
    const sslInfo = await this.checkSSL(url);

    return {
      id: 'test',
      monitorId: 'test',
      status: checkResult.status === 'up',
      responseTime: checkResult.responseTime,
      statusCode: checkResult.httpStatus,
      error: checkResult.error,
      createdAt: new Date(),
      message: checkResult.status === 'up' ? 'Check successful' : checkResult.error || 'Check failed',
    };
  }

  // ============================
  // ⚠️ INCIDENTS MANAGEMENT
  // ============================

  private async createIncident(monitorId: string, status: string, checkResult: CheckResult): Promise<void> {
    const incidents = this.getStoredIncidents();
    if (!incidents[monitorId]) {
      incidents[monitorId] = [];
    }

    const incident: Incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      monitorId,
      title: `${status === 'down' ? 'Service Down' : 'Service Restored'}`,
      description: status === 'down' 
        ? `Service is currently down. Response time: ${checkResult.responseTime}ms`
        : `Service has been restored. Response time: ${checkResult.responseTime}ms`,
      status: status === 'down' ? 'open' : 'resolved',
      severity: status === 'down' ? 'high' : 'low',
      startTime: checkResult.createdAt,
      endTime: status === 'up' ? checkResult.createdAt : undefined,
      createdAt: checkResult.createdAt,
    };

    incidents[monitorId].unshift(incident);
    incidents[monitorId] = incidents[monitorId].slice(0, 50); // Keep last 50 incidents
    this.saveIncidents(incidents);
  }

  async getMonitorIncidents(monitorId: string, limit: number = 50): Promise<Incident[]> {
    const incidents = this.getStoredIncidents();
    return (incidents[monitorId] || []).slice(0, limit);
  }

  async resolveIncident(incidentId: string): Promise<void> {
    const incidents = this.getStoredIncidents();
    
    for (const monitorId in incidents) {
      const incidentIndex = incidents[monitorId].findIndex(i => i.id === incidentId);
      if (incidentIndex !== -1) {
        incidents[monitorId][incidentIndex] = {
          ...incidents[monitorId][incidentIndex],
          status: 'resolved',
          endTime: new Date(),
        };
        this.saveIncidents(incidents);
        break;
      }
    }
  }

  // ============================
  // 📊 STATISTICS & SUMMARY
  // ============================

  async getMonitorSummary(): Promise<MonitorSummary> {
    const monitors = this.getStoredMonitors();
    const activeMonitors = monitors.filter(m => m.isActive);
    
    const upMonitors = activeMonitors.filter(m => m.status === true).length;
    const downMonitors = activeMonitors.filter(m => m.status === false).length;
    // Remove or adjust unknownMonitors if not needed
    // const unknownMonitors = activeMonitors.filter(m => m.status === 'unknown').length;

    const totalUptime = activeMonitors.reduce((sum, m) => sum + (m.uptime || 0), 0);
    const averageUptime = activeMonitors.length > 0 ? totalUptime / activeMonitors.length : 100;

    return {
      totalMonitors: activeMonitors.length,
      upMonitors: upMonitors,
      downMonitors: downMonitors,
      pausedMonitors: 0, // Assuming paused monitors is 0 as per the new logic
      avgResponseTime: 0, // Would need to calculate from checks
      activeIncidents: 0, // Would need to calculate from incidents
      uptime: `${Math.round(averageUptime * 100) / 100}%`,
    };
  }

  async getMonitorStats(monitorId: string): Promise<MonitorStats> {
    const checks = this.getStoredChecks();
    const monitorChecks = checks[monitorId] || [];
    
    const totalChecks = monitorChecks.length;
    const upChecks = monitorChecks.filter(c => c.status === true).length;
    const downChecks = monitorChecks.filter(c => c.status === false).length;
    
    const uptime = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 100;
    const downtime = totalChecks > 0 ? (downChecks / totalChecks) * 100 : 0;
    
    const responseTimes = monitorChecks
      .filter(c => c.responseTime !== null)
      .map(c => c.responseTime!);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const monitor = this.getStoredMonitors().find(m => m.id === monitorId);
    if (!monitor) {
      throw new Error('Monitor not found');
    }

    return {
      monitor,
      stats: {
        uptime: {
          '24h': Math.round(uptime * 100) / 100,
          '7d': Math.round(uptime * 100) / 100,
          '30d': Math.round(uptime * 100) / 100,
        },
        average_response_time: Math.round(avgResponseTime),
        total_checks: totalChecks,
        current_incident: undefined, // Would need to fetch from incidents
      },
    };
  }

  async getSSLInfo(monitorId: string): Promise<SSLInfoResponse> {
    const monitors = this.getStoredMonitors();
    const monitor = monitors.find(m => m.id === monitorId);
    
    if (!monitor) {
      throw new Error('Monitor not found');
    }

    return await this.checkSSL(monitor.url);
  }

  // ============================
  // 🔧 UTILITY METHODS
  // ============================

  async getMonitorTypes(): Promise<MonitorType[]> {
    return [
      { type: 'http', label: 'HTTP/HTTPS', description: 'Monitor HTTP/HTTPS endpoints' },
      { type: 'ping', label: 'Ping', description: 'Monitor server availability' },
      { type: 'port', label: 'TCP Port', description: 'Monitor TCP port availability' },
      { type: 'ssl', label: 'SSL Certificate', description: 'Monitor SSL certificate validity' },
    ];
  }

  async getNotificationTypes(): Promise<NotificationType[]> {
    return [
      { type: 'email', label: 'Email', description: 'Send notifications via email' },
      { type: 'webhook', label: 'Webhook', description: 'Send notifications to webhook URL' },
      { type: 'slack', label: 'Slack', description: 'Send notifications to Slack channel' },
      { type: 'discord', label: 'Discord', description: 'Send notifications to Discord channel' },
    ];
  }

  async triggerCheck(monitorId: string): Promise<{
    status: string;
    response_time: number | null;
    http_status: number | null;
  }> {
    const result = await this.performMonitorCheck(monitorId);
    return {
      status: result.status ? 'up' : 'down',
      response_time: result.responseTime,
      http_status: result.statusCode || null,
    };
  }

  async validateUrl(url: string): Promise<{ valid: boolean; message?: string }> {
    const isValid = this._validateUrl(url);
    return {
      valid: isValid,
      message: isValid ? 'Valid URL' : 'Invalid URL format',
    };
  }

  async bulkUpdateMonitors(data: BulkUpdateRequest): Promise<BulkUpdateResponse> {
    const monitors = this.getStoredMonitors();
    const updated: string[] = [];
    const failed: string[] = [];

    for (const monitorId of data.monitorIds) {
      try {
        const index = monitors.findIndex(m => m.id === monitorId);
        if (index !== -1) {
          const monitor = monitors[index];
          
          switch (data.action) {
            case 'pause':
              monitor.isActive = false;
              break;
            case 'resume':
              monitor.isActive = true;
              break;
            case 'delete':
              monitors.splice(index, 1);
              break;
          }
          
          if (data.action !== 'delete') {
            monitor.updatedAt = new Date();
          }
          
          updated.push(monitorId);
        } else {
          failed.push(monitorId);
        }
      } catch (error) {
        failed.push(monitorId);
      }
    }

    this.saveMonitors(monitors);

    return {
      action: data.action,
      results: data.monitorIds.map(id => ({
        id,
        success: updated.includes(id),
        error: failed.includes(id) ? 'Operation failed' : undefined,
      })),
      summary: {
        total: data.monitorIds.length,
        successful: updated.length,
        failed: failed.length,
      },
    };
  }

  async exportMonitorData(
    monitorId: string, 
    format: 'json' | 'csv' = 'json',
    timeRange: number = 168 // 7 days
  ): Promise<Blob> {
    const checks = this.getStoredChecks();
    const monitorChecks = checks[monitorId] || [];
    
    if (format === 'json') {
      const data = JSON.stringify(monitorChecks, null, 2);
      return new Blob([data], { type: 'application/json' });
    } else {
      // CSV format
      const headers = ['timestamp', 'status', 'response_time', 'http_status', 'error'];
      const csvData = [
        headers.join(','),
        ...monitorChecks.map(check => [
          check.createdAt,
          check.status ? 'up' : 'down',
          check.responseTime,
          check.statusCode,
          check.error || ''
        ].join(','))
      ].join('\n');
      
      return new Blob([csvData], { type: 'text/csv' });
    }
  }
}

export const frontendUptimeApi = new FrontendUptimeApi(); 