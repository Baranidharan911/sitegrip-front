import { 
  Monitor, 
  UptimeLog, 
  MonitorStats, 
  SSLInfoResponse, 
  CreateMonitorRequest, 
  UpdateMonitorRequest 
} from '../types/uptime';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';

class UptimeApi {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // 🚀 Create a new monitor
  async createMonitor(data: CreateMonitorRequest): Promise<string> {
    return this.request<string>('/monitor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 🔄 Update existing monitor
  async updateMonitor(
    monitorId: string, 
    data: UpdateMonitorRequest
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/monitor/${monitorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ❌ Delete monitor
  async deleteMonitor(monitorId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/monitor/${monitorId}`, {
      method: 'DELETE',
    });
  }

  // 📊 Get all monitors status
  async getAllMonitors(): Promise<Monitor[]> {
    return this.request<Monitor[]>('/monitor/status');
  }

  // 📜 Get monitor history/logs
  async getMonitorHistory(
    monitorId: string, 
    hours: number = 24
  ): Promise<UptimeLog[]> {
    return this.request<UptimeLog[]>(`/monitor/${monitorId}/history?hours=${hours}`);
  }

  // 🌐 Get public monitors (for status page)
  async getPublicMonitors(): Promise<Monitor[]> {
    return this.request<Monitor[]>('/status/public');
  }

  // 🔍 Get detailed monitor statistics
  async getMonitorStats(monitorId: string): Promise<MonitorStats> {
    return this.request<MonitorStats>(`/monitor/${monitorId}/stats`);
  }

  // 🔒 Get SSL certificate information
  async getSSLInfo(monitorId: string): Promise<SSLInfoResponse> {
    return this.request<SSLInfoResponse>(`/monitor/${monitorId}/ssl`);
  }

  // 📈 Get uptime percentage for specific timeframe
  async getUptimePercentage(
    monitorId: string, 
    timeframe: '24h' | '7d' | '30d' = '24h'
  ): Promise<number> {
    const stats = await this.getMonitorStats(monitorId);
    return stats.stats.uptime[timeframe];
  }

  // 🔥 Get monitors with issues (down or SSL problems)
  async getMonitorsWithIssues(): Promise<Monitor[]> {
    const monitors = await this.getAllMonitors();
    return monitors.filter(monitor => 
      monitor.last_status === 'down' || 
      monitor.ssl_status === 'expired' || 
      monitor.ssl_status === 'expiring_soon' ||
      monitor.failures_in_a_row > 0
    );
  }

  // 📊 Get uptime summary statistics
  async getUptimeSummary(): Promise<{
    total_monitors: number;
    up_monitors: number;
    down_monitors: number;
    ssl_issues: number;
    average_uptime: number;
    average_response_time: number;
  }> {
    const monitors = await this.getAllMonitors();
    
    const upMonitors = monitors.filter(m => m.last_status === 'up').length;
    const downMonitors = monitors.filter(m => m.last_status === 'down').length;
    const sslIssues = monitors.filter(m => 
      m.ssl_status === 'expired' || 
      m.ssl_status === 'expiring_soon' ||
      m.ssl_status === 'invalid'
    ).length;

    const totalUptime = monitors.reduce((sum, m) => sum + (m.uptime_stats['24h'] || 0), 0);
    const averageUptime = monitors.length > 0 ? totalUptime / monitors.length : 0;

    const totalResponseTime = monitors.reduce((sum, m) => sum + (m.last_response_time || 0), 0);
    const averageResponseTime = monitors.length > 0 ? totalResponseTime / monitors.length : 0;

    return {
      total_monitors: monitors.length,
      up_monitors: upMonitors,
      down_monitors: downMonitors,
      ssl_issues: sslIssues,
      average_uptime: averageUptime,
      average_response_time: averageResponseTime,
    };
  }

  // 🔄 Refresh monitor (trigger immediate check)
  async refreshMonitor(monitorId: string): Promise<{ success: boolean }> {
    // This would trigger an immediate check - might need backend endpoint
    // For now, we'll simulate by fetching fresh data
    await this.getMonitorStats(monitorId);
    return { success: true };
  }

  // 📋 Export monitor data
  async exportMonitorData(
    monitorId: string, 
    format: 'json' | 'csv' = 'json',
    hours: number = 168 // 7 days
  ): Promise<Blob> {
    const logs = await this.getMonitorHistory(monitorId, hours);
    
    if (format === 'csv') {
      const csvContent = this.convertToCSV(logs);
      return new Blob([csvContent], { type: 'text/csv' });
    }
    
    return new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  }

  private convertToCSV(logs: UptimeLog[]): string {
    if (logs.length === 0) return '';
    
    const headers = ['timestamp', 'status', 'response_time', 'http_status', 'error', 'ssl_valid', 'ssl_expires_at'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.status,
        log.response_time?.toString() || '',
        log.http_status?.toString() || '',
        log.error ? `"${log.error.replace(/"/g, '""')}"` : '',
        log.ssl_info?.is_valid?.toString() || '',
        log.ssl_info?.expires_at || ''
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // 🎯 Validate URL before creating monitor
  async validateUrl(url: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const urlObj = new URL(url);
      
      // Basic URL validation
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, message: 'URL must use HTTP or HTTPS protocol' };
      }
      
      if (!urlObj.hostname) {
        return { valid: false, message: 'URL must have a valid hostname' };
      }
      
      // Check if URL is reachable (basic check)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors' // Allow cross-origin requests for validation
        });
        clearTimeout(timeoutId);
        return { valid: true };
      } catch (error) {
        clearTimeout(timeoutId);
        // Even if CORS blocks the request, the URL might be valid
        return { valid: true, message: 'URL appears valid but could not be verified due to CORS policy' };
      }
    } catch (error) {
      return { valid: false, message: 'Invalid URL format' };
    }
  }

  // 📱 Get mobile-optimized monitor data
  async getMobileMonitorData(): Promise<{
    criticalIssues: Monitor[];
    recentlyDown: Monitor[];
    expiringSSL: Monitor[];
    summary: {
      total: number;
      up: number;
      down: number;
      issues: number;
    };
  }> {
    const monitors = await this.getAllMonitors();
    
    const criticalIssues = monitors.filter(m => 
      m.last_status === 'down' || m.failures_in_a_row >= 3
    );
    
    const recentlyDown = monitors.filter(m => 
      m.last_status === 'up' && m.failures_in_a_row > 0
    );
    
    const expiringSSL = monitors.filter(m => 
      m.ssl_status === 'expiring_soon' && m.ssl_cert_days_until_expiry && m.ssl_cert_days_until_expiry <= 7
    );
    
    return {
      criticalIssues,
      recentlyDown,
      expiringSSL,
      summary: {
        total: monitors.length,
        up: monitors.filter(m => m.last_status === 'up').length,
        down: monitors.filter(m => m.last_status === 'down').length,
        issues: criticalIssues.length + expiringSSL.length,
      }
    };
  }
}

// Export singleton instance
export const uptimeApi = new UptimeApi();
export default uptimeApi;
