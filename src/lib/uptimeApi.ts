import { 
  Monitor, 
  UptimeLog, 
  MonitorStats, 
  SSLInfoResponse, 
  CreateMonitorRequest, 
  UpdateMonitorRequest 
} from '../types/uptime';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class UptimeApi {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Get Firebase auth token if available
    if (typeof window !== 'undefined') {
      try {
        // Import Firebase auth directly from our configured firebase instance
        const { auth } = await import('../lib/firebase');
        
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          console.log('🔐 Successfully retrieved Firebase auth token for uptime API');
          return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
        } else {
          console.warn('🔐 No current user found in Firebase auth for uptime API');
        }
      } catch (error) {
        console.warn('🔐 Failed to get Firebase auth token for uptime API:', error);
      }
    }
    
    return {
      'Content-Type': 'application/json'
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const authHeaders = await this.getAuthHeaders();
    
    const config: RequestInit = {
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`📡 Uptime API Request: ${options.method || 'GET'} ${url}`);
      console.log('📡 Request headers:', authHeaders);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error(`❌ Uptime API Error [${endpoint}]:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to access uptime monitoring.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access this resource.');
        } else if (response.status === 404) {
          throw new Error('Resource not found. The requested monitor or endpoint does not exist.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Uptime API Response [${endpoint}]:`, data);
      
      // Extract data from TypeScript backend response format
      if (data.success && data.data !== undefined) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Uptime API Network Error [${endpoint}]:`, error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and ensure the backend server is running.');
      }
      
      throw error;
    }
  }

  // 🚀 Create a new monitor
  async createMonitor(data: CreateMonitorRequest): Promise<string> {
    const response = await this.request<any>('/monitor', {
      method: 'POST',
      body: JSON.stringify({
        url: data.url,
        name: data.name,
        frequency: data.frequency,
        alerts: data.alerts,
        is_public: data.is_public,
        ssl_monitoring_enabled: data.ssl_monitoring_enabled,
        type: 'http',
        expectedStatus: 200,
        timeout: 10000,
        retries: 1
      }),
    });
    
    // TypeScript backend returns the monitor ID directly in data field
    return typeof response === 'string' ? response : response.id;
  }

  // 🔄 Update existing monitor
  async updateMonitor(
    monitorId: string, 
    data: UpdateMonitorRequest
  ): Promise<{ success: boolean }> {
    await this.request<Monitor>(`/monitor/${monitorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return { success: true };
  }

  // ❌ Delete monitor
  async deleteMonitor(monitorId: string): Promise<{ success: boolean }> {
    await this.request<any>(`/monitor/${monitorId}`, {
      method: 'DELETE',
    });
    
    return { success: true };
  }

  // 📊 Get all monitors status
  async getAllMonitors(): Promise<Monitor[]> {
    const response = await this.request<any>('/monitor/status');
    
    // Handle backend response format: { success: true, data: monitors[], pagination: {...} }
    if (response.success && response.data) {
      return response.data;
    }
    
    // Fallback for direct array or other formats
    return Array.isArray(response) ? response : response.monitors || [];
  }

  // 📜 Get monitor history/logs
  async getMonitorHistory(
    monitorId: string, 
    hours: number = 24
  ): Promise<UptimeLog[]> {
    const response = await this.request<any>(`/monitor/${monitorId}/history?hours=${hours}`);
    
    // Handle backend response format: { success: true, data: logs[], pagination: {...} }
    if (response.success && response.data) {
      return response.data;
    }
    
    // Fallback for direct array or other formats
    return Array.isArray(response) ? response : response.logs || [];
  }

  // 🌐 Get public monitors (for status page)
  async getPublicMonitors(): Promise<Monitor[]> {
    const response = await this.request<any>('/status/public');
    
    return Array.isArray(response) ? response : response.monitors || response.data || [];
  }

  // 🔍 Get detailed monitor statistics
  async getMonitorStats(monitorId: string): Promise<MonitorStats> {
    const response = await this.request<any>(`/monitor/${monitorId}/stats`);
    
    // Handle backend response format: { success: true, data: { monitor, stats } }
    if (response.success && response.data) {
      return response.data;
    }
    
    // TypeScript backend returns { monitor, stats } format
    if (response.monitor && response.stats) {
      return {
        monitor: response.monitor,
        stats: response.stats
      };
    }
    
    return response;
  }

  // 🔒 Get SSL certificate information
  async getSSLInfo(monitorId: string): Promise<SSLInfoResponse> {
    try {
      const monitor = await this.request<Monitor>(`/monitor/${monitorId}`);
      
      return {
        ssl_monitoring_enabled: monitor.ssl_monitoring_enabled || false,
        ssl_info: undefined, // Would need to be populated from backend data
        last_checked: monitor.last_checked?.toString(),
        monitor_ssl_status: monitor.ssl_status || 'unknown',
        ssl_cert_expires_at: monitor.ssl_cert_expires_at,
        ssl_cert_days_until_expiry: monitor.ssl_cert_days_until_expiry,
        ssl_cert_issuer: monitor.ssl_cert_issuer,
        message: monitor.ssl_status ? undefined : 'SSL information not available'
      };
    } catch (error) {
      return {
        ssl_monitoring_enabled: false,
        message: 'Failed to retrieve SSL information'
      };
    }
  }

  // 📈 Get uptime percentage for specific timeframe
  async getUptimePercentage(
    monitorId: string, 
    timeframe: '24h' | '7d' | '30d' = '24h'
  ): Promise<number> {
    const stats = await this.getMonitorStats(monitorId);
    return stats.stats.uptime[timeframe] || 0;
  }

  // 🔥 Get monitors with issues (down or SSL problems)
  async getMonitorsWithIssues(): Promise<Monitor[]> {
    const monitors = await this.getAllMonitors();
    return monitors.filter(monitor => 
      monitor.last_status === 'down' || 
      monitor.ssl_status === 'expired' || 
      monitor.ssl_status === 'expiring_soon' ||
      (monitor.failures_in_a_row || 0) > 0
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

    const totalUptime = monitors.reduce((sum, m) => sum + (m.uptime_stats?.['24h'] || 0), 0);
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

  // 🔄 Trigger immediate check
  async triggerCheck(monitorId: string): Promise<{
    success: boolean;
    status: string;
    response_time: number | null;
    http_status: number | null;
    ssl_status: any | null;
    timestamp: string;
  }> {
    const response = await this.request<any>(`/monitor/${monitorId}/check`, {
      method: 'POST',
    });
    
    // Handle backend response format: { success: true, data: {...}, message: '...' }
    const checkData = response.success && response.data ? response.data : response;
    
    return {
      success: checkData.status === 'up',
      status: checkData.status || 'unknown',
      response_time: checkData.response_time || null,
      http_status: checkData.http_status || null,
      ssl_status: null, // SSL status would need to be added to check response
      timestamp: checkData.timestamp || new Date().toISOString()
    };
  }

  // 🚨 Get monitor incidents
  async getMonitorIncidents(monitorId: string, limit: number = 10): Promise<{
    incidents: any[];
    total: number;
  }> {
    const response = await this.request<any>(`/monitor/${monitorId}/incidents?pageSize=${limit}`);
    
    // Handle backend response format: { success: true, data: { incidents, total }, pagination: {...} }
    if (response.success && response.data) {
      return {
        incidents: response.data.incidents || [],
        total: response.data.total || 0
      };
    }
    
    return {
      incidents: response.incidents || response.data?.incidents || [],
      total: response.total || response.data?.total || 0
    };
  }

  // 🔄 Real-time monitoring helpers
  async startRealtimeMonitoring(onUpdate: (monitors: Monitor[]) => void): Promise<() => void> {
    let isActive = true;
    
    const poll = async () => {
      if (!isActive) return;
      
      try {
        const monitors = await this.getAllMonitors();
        onUpdate(monitors);
      } catch (error) {
        console.error('Real-time monitoring error:', error);
      }
      
      if (isActive) {
        setTimeout(poll, 30000); // Poll every 30 seconds
      }
    };
    
    // Start polling
    poll();
    
    // Return cleanup function
    return () => {
      isActive = false;
    };
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
        '', // ssl_valid placeholder
        '' // ssl_expires_at placeholder
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
      m.last_status === 'down' || (m.failures_in_a_row || 0) >= 3
    );
    
    const recentlyDown = monitors.filter(m => 
      m.last_status === 'up' && (m.failures_in_a_row || 0) > 0
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
