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
      
      // Extract data from response format
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
      body: JSON.stringify(data),
    });
    
    // Return the monitor ID
    return typeof response === 'string' ? response : response.id;
  }

  // 🔄 Update existing monitor
  async updateMonitor(
    monitorId: string, 
    data: UpdateMonitorRequest
  ): Promise<void> {
    await this.request<void>(`/monitor/${monitorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ❌ Delete monitor
  async deleteMonitor(monitorId: string): Promise<void> {
    await this.request<void>(`/monitor/${monitorId}`, {
      method: 'DELETE',
    });
  }

  // 📊 Get all monitors status
  async getAllMonitors(): Promise<Monitor[]> {
    const response = await this.request<Monitor[]>('/monitor/status');
    return response;
  }

  // 📜 Get monitor history/logs
  async getMonitorHistory(
    monitorId: string, 
    hours: number = 24
  ): Promise<UptimeLog[]> {
    const response = await this.request<UptimeLog[]>(`/monitor/${monitorId}/history?hours=${hours}`);
    return response;
  }

  // 🌐 Get public monitors (for status page)
  async getPublicMonitors(): Promise<Monitor[]> {
    const response = await this.request<Monitor[]>('/monitor/public');
    return response;
  }

  // 🔍 Get detailed monitor statistics
  async getMonitorStats(monitorId: string): Promise<MonitorStats> {
    const response = await this.request<MonitorStats>(`/monitor/${monitorId}/stats`);
    return response;
  }

  // 🔒 Get SSL certificate information
  async getSSLInfo(monitorId: string): Promise<SSLInfoResponse> {
    try {
      const monitor = await this.request<Monitor>(`/monitor/${monitorId}`);
      
      return {
        ssl_monitoring_enabled: monitor.ssl_monitoring_enabled || false,
        ssl_info: monitor.sslInfo,
        last_checked: monitor.lastChecked?.toString(),
        monitor_ssl_status: monitor.status,
        ssl_cert_expires_at: monitor.sslInfo?.validTo?.toString(),
        ssl_cert_days_until_expiry: monitor.sslInfo?.daysUntilExpiry,
        ssl_cert_issuer: monitor.sslInfo?.issuer,
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
      monitor.status === 'down' || 
      (monitor.sslInfo && !monitor.sslInfo.valid) ||
      (monitor.sslInfo && monitor.sslInfo.daysUntilExpiry !== undefined && monitor.sslInfo.daysUntilExpiry < 30)
    );
  }

  // 📊 Get uptime summary statistics
  async getUptimeSummary(): Promise<{
    total_monitors: number;
    up_monitors: number;
    down_monitors: number;
    ssl_issues: number;
    average_uptime: number;
  }> {
    const response = await this.request<{
      total_monitors: number;
      up_monitors: number;
      down_monitors: number;
      ssl_issues: number;
      average_uptime: number;
    }>('/monitor/summary');
    
    return response;
  }

  // 🔄 Trigger a manual check
  async triggerCheck(monitorId: string): Promise<{
    status: string;
    response_time: number | null;
    http_status: number | null;
  }> {
    const response = await this.request<any>(`/monitor/${monitorId}/check`, {
      method: 'POST',
    });
    
    return {
      status: response.status,
      response_time: response.responseTime || null,
      http_status: response.httpStatus || null
    };
  }

  // 📜 Get monitor incidents
  async getMonitorIncidents(monitorId: string, limit: number = 10): Promise<any[]> {
    const response = await this.request<any[]>(`/monitor/${monitorId}/incidents?limit=${limit}`);
    return response;
  }

  // 📊 Export monitor data
  async exportMonitorData(
    monitorId: string, 
    format: 'json' | 'csv' = 'json',
    timeRange: number = 168 // 7 days
  ): Promise<Blob> {
    const url = `${API_BASE_URL}/api/monitor/${monitorId}/export?format=${format}&hours=${timeRange}`;
    const authHeaders = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      headers: authHeaders,
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to export data: ${response.statusText}`);
    }
    
    return await response.blob();
  }

  // 🔍 Validate URL
  async validateUrl(url: string): Promise<{ valid: boolean; message?: string }> {
    try {
      // Simple URL validation
      new URL(url);
      return { valid: true };
    } catch (error) {
      return { valid: false, message: 'Invalid URL format' };
    }
  }
}

export const uptimeApi = new UptimeApi();
export default uptimeApi;
