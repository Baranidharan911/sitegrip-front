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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class MonitoringApi {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Get Firebase auth token if available
    if (typeof window !== 'undefined') {
      try {
        // Import Firebase auth directly from our configured firebase instance
        const { auth } = await import('../lib/firebase');
        
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          console.log('🔐 Successfully retrieved Firebase auth token for monitoring API');
          return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
        } else {
          console.warn('🔐 No current user found in Firebase auth for monitoring API');
        }
      } catch (error) {
        console.warn('🔐 Failed to get Firebase auth token for monitoring API:', error);
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
      console.log(`📡 Monitoring API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error(`❌ Monitoring API Error [${endpoint}]:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to access monitoring.');
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
      console.log(`✅ Monitoring API Response [${endpoint}]:`, data);
      
      // Extract data from response format
      if (data.success && data.data !== undefined) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Monitoring API Network Error [${endpoint}]:`, error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and ensure the backend server is running.');
      }
      
      throw error;
    }
  }

  // ============================
  // 🔧 MONITOR CRUD OPERATIONS
  // ============================

  // Create a new monitor
  async createMonitor(data: CreateMonitorRequest): Promise<Monitor> {
    console.log('🚀 monitoringApi.createMonitor called with data:', data);
    console.log('📊 Data type:', typeof data);
    console.log('🔍 Data keys:', Object.keys(data));
    console.log('📝 Stringified data:', JSON.stringify(data));
    
    const response = await this.request<Monitor>('/monitoring/monitors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('✅ monitoringApi.createMonitor response:', response);
    return response;
  }

  // Get all monitors for the authenticated user
  async getAllMonitors(): Promise<Monitor[]> {
    const response = await this.request<Monitor[]>('/monitoring/monitors');
    return response;
  }

  // Get a specific monitor by ID
  async getMonitorById(id: string): Promise<Monitor> {
    const response = await this.request<Monitor>(`/monitoring/monitors/${id}`);
    return response;
  }

  // Update existing monitor
  async updateMonitor(id: string, data: UpdateMonitorRequest): Promise<Monitor> {
    const response = await this.request<Monitor>(`/monitoring/monitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return response;
  }

  // Delete monitor
  async deleteMonitor(id: string): Promise<void> {
    await this.request<void>(`/monitoring/monitors/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================
  // 🔍 MONITOR CHECKS & TESTING
  // ============================

  // Perform a manual check on a monitor
  async performMonitorCheck(monitorId: string): Promise<CheckResult> {
    const response = await this.request<CheckResult>(`/monitoring/monitors/${monitorId}/check`, {
      method: 'POST',
    });
    
    return response;
  }

  // Get check history for a monitor
  async getMonitorChecks(monitorId: string, limit: number = 30): Promise<CheckResult[]> {
    const response = await this.request<CheckResult[]>(`/monitoring/monitors/${monitorId}/checks?limit=${limit}`);
    return response;
  }

  // Test a URL before creating a monitor
  async testMonitor(url: string, timeout?: number): Promise<TestResult> {
    const response = await this.request<TestResult>('/monitoring/test', {
      method: 'POST',
      body: JSON.stringify({ url, timeout }),
    });
    
    return response;
  }

  // ============================
  // ⚠️ INCIDENTS MANAGEMENT
  // ============================

  // Get incident history for a monitor
  async getMonitorIncidents(monitorId: string, limit: number = 50): Promise<Incident[]> {
    const response = await this.request<Incident[]>(`/monitoring/monitors/${monitorId}/incidents?limit=${limit}`);
    return response;
  }

  // Resolve an incident
  async resolveIncident(incidentId: string): Promise<void> {
    await this.request<void>(`/monitoring/incidents/${incidentId}/resolve`, {
      method: 'PUT',
    });
  }

  // ============================
  // 📊 DASHBOARD & SUMMARY
  // ============================

  // Get monitoring summary for the authenticated user
  async getMonitorSummary(): Promise<MonitorSummary> {
    const response = await this.request<MonitorSummary>('/monitoring/summary');
    return response;
  }

  // Get monitors with recent checks for dashboard
  async getMonitorsWithChecks(limit: number = 100): Promise<Monitor[]> {
    const response = await this.request<Monitor[]>(`/monitoring/monitors-with-checks?limit=${limit}`);
    return response;
  }

  // ============================
  // 🔄 BULK OPERATIONS
  // ============================

  // Bulk operations (pause/resume/delete)
  async bulkUpdateMonitors(data: BulkUpdateRequest): Promise<BulkUpdateResponse> {
    const response = await this.request<BulkUpdateResponse>('/monitoring/monitors/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response;
  }

  // ============================
  // 📄 STATUS PAGES
  // ============================

  // Get public status page
  async getStatusPage(slug: string): Promise<StatusPage> {
    const response = await this.request<StatusPage>(`/monitoring/status-pages/public/${slug}`);
    return response;
  }

  // ============================
  // 📋 REFERENCE DATA
  // ============================

  // Get available monitor types
  async getMonitorTypes(): Promise<MonitorType[]> {
    const response = await this.request<MonitorType[]>('/monitoring/types');
    return response;
  }

  // Get available notification types
  async getNotificationTypes(): Promise<NotificationType[]> {
    const response = await this.request<NotificationType[]>('/monitoring/notification-types');
    return response;
  }

  // ============================
  // 🔒 SSL & LEGACY SUPPORT
  // ============================

  // Get SSL certificate information (legacy support)
  async getSSLInfo(monitorId: string): Promise<SSLInfoResponse> {
    try {
      const monitor = await this.getMonitorById(monitorId);
      
      return {
        ssl_monitoring_enabled: monitor.type === 'ssl',
        ssl_info: undefined, // Not available in new API
        last_checked: monitor.lastCheck?.toString(),
        monitor_ssl_status: monitor.status ? 'valid' : 'invalid',
        ssl_cert_expires_at: undefined,
        ssl_cert_days_until_expiry: undefined,
        ssl_cert_issuer: undefined,
      };
    } catch (error) {
      return {
        ssl_monitoring_enabled: false,
        message: 'Failed to retrieve SSL information'
      };
    }
  }

  // Get monitor statistics (legacy support)
  async getMonitorStats(monitorId: string): Promise<MonitorStats> {
    const monitor = await this.getMonitorById(monitorId);
    const checks = await this.getMonitorChecks(monitorId, 100);
    
    // Calculate basic stats
    const totalChecks = checks.length;
    const successfulChecks = checks.filter(c => c.status).length;
    const avgResponseTime = checks.length > 0 
      ? checks.reduce((sum, c) => sum + c.responseTime, 0) / checks.length 
      : 0;

    return {
      monitor,
      stats: {
        uptime: {
          '24h': totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
          '7d': totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
          '30d': totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
        },
        average_response_time: avgResponseTime,
        total_checks: totalChecks,
        current_incident: undefined, // Would need to fetch incidents separately
      }
    };
  }

  // ============================
  // 📈 LEGACY UPTIME SUPPORT
  // ============================

  // Legacy method for backward compatibility
  async getUptimeSummary(): Promise<{
    total_monitors: number;
    up_monitors: number;
    down_monitors: number;
    ssl_issues: number;
    average_uptime: number;
  }> {
    const summary = await this.getMonitorSummary();
    
    return {
      total_monitors: summary.totalMonitors,
      up_monitors: summary.upMonitors,
      down_monitors: summary.downMonitors,
      ssl_issues: 0, // Not available in new API
      average_uptime: parseFloat(summary.uptime),
    };
  }

  // Legacy method for backward compatibility
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

  // Legacy method for backward compatibility
  async exportMonitorData(
    monitorId: string, 
    format: 'json' | 'csv' = 'json',
    timeRange: number = 168 // 7 days
  ): Promise<Blob> {
    const checks = await this.getMonitorChecks(monitorId, 1000); // Get more data for export
    
    if (format === 'json') {
      const jsonData = JSON.stringify(checks, null, 2);
      return new Blob([jsonData], { type: 'application/json' });
    } else {
      // CSV format
      const csvHeaders = ['ID', 'Monitor ID', 'Status', 'Response Time', 'Status Code', 'Message', 'Created At'];
      const csvRows = checks.map(check => [
        check.id,
        check.monitorId,
        check.status ? 'UP' : 'DOWN',
        check.responseTime,
        check.statusCode || '',
        check.message,
        new Date(check.createdAt).toISOString()
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    }
  }

  // Legacy method for backward compatibility
  async validateUrl(url: string): Promise<{ valid: boolean; message?: string }> {
    try {
      const result = await this.testMonitor(url);
      return {
        valid: result.status,
        message: result.status ? 'URL is accessible' : result.message
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Failed to validate URL'
      };
    }
  }
}

// Export singleton instance
export const monitoringApi = new MonitoringApi();

// Legacy export for backward compatibility
export const uptimeApi = monitoringApi;
