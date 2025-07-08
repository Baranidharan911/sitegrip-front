import { 
  Monitor, 
  CheckResult, 
  Incident, 
  RegionalCheckResult,
  BrowserCheckResult as UptimeBrowserCheckResult,
  ContentIntegrityCheck,
  ImpactAssessment,
  RootCauseAnalysis,
  AnomalyRecord,
  PerformanceDataPoint,
  NotificationConfig,
  AutoRemediationAttempt,
  LiveIncidentMap,
  DetailedUptimeReport,
  MonitorSummary
} from '../types/uptime';
import { websocketSimulator } from './websocketSimulator';
import { firebaseMonitoringService } from './firebaseMonitoringService';
import { playwrightBrowserService } from './playwrightBrowserService';
import { notificationService } from './notificationService';

// ============================
// 🌐 REAL-TIME MONITORING API
// ============================

export class RealTimeMonitoringApi {
  private eventListeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private apiBaseUrl = process.env.NEXT_PUBLIC_MONITORING_API_URL || '/api/monitoring';
  private useFirebase = false; // Disable Firebase for now due to connection issues

  // ============================
  // 🔌 WEBSOCKET CONNECTION (USING SIMULATOR)
  // ============================

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    try {
      console.log('🔌 Connecting to WebSocket simulator...');
      
      // Set up event listeners for the simulator
      this.setupSimulatorListeners();
      
      // Connect to the simulator
      await websocketSimulator.connect();
      
      this.isConnected = true;
      this.emit('connected', { timestamp: new Date() });
      
    } catch (error) {
      console.error('❌ Failed to connect to WebSocket simulator:', error);
      throw error;
    }
  }

  private setupSimulatorListeners(): void {
    // Monitor events
    websocketSimulator.on('monitor_status_changed', (data: any) => {
      this.emit('monitor_status_changed', data);
    });

    websocketSimulator.on('monitor_check_completed', (data: any) => {
      this.emit('monitor_check_completed', data);
    });

    websocketSimulator.on('incident_created', (data: any) => {
      this.emit('incident_created', data);
    });

    websocketSimulator.on('incident_resolved', (data: any) => {
      this.emit('incident_resolved', data);
    });

    websocketSimulator.on('anomaly_detected', (data: any) => {
      this.emit('anomaly_detected', data);
    });

    websocketSimulator.on('performance_degraded', (data: any) => {
      this.emit('performance_degraded', data);
    });

    websocketSimulator.on('live_incident_map_update', (data: any) => {
      this.emit('live_incident_map_update', data);
    });

    websocketSimulator.on('performance_trends_update', (data: any) => {
      this.emit('performance_trends_update', data);
    });
  }

  disconnect(): void {
    console.log('🔌 Disconnecting from WebSocket simulator...');
    websocketSimulator.disconnect();
    this.isConnected = false;
    this.emit('disconnected', { code: 1000, reason: 'Client disconnecting' });
  }

  // ============================
  // 📊 MONITOR MANAGEMENT
  // ============================

  async getAllMonitors(): Promise<Monitor[]> {
    // No mock data, return empty array or fetch from real backend
    return [];
  }

  async createMonitor(data: any): Promise<Monitor> {
    try {
      if (this.useFirebase) {
        return await firebaseMonitoringService.createMonitor(data);
      } else {
        const response = await fetch(this.apiBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_monitor', data })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create monitor');
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('❌ Error creating monitor:', error);
      throw error;
    }
  }

  async updateMonitor(id: string, data: any): Promise<Monitor> {
    try {
      if (this.useFirebase) {
        return await firebaseMonitoringService.updateMonitor(id, data);
      } else {
        const response = await fetch(this.apiBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_monitor', id, data })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update monitor');
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('❌ Error updating monitor:', error);
      throw error;
    }
  }

  async deleteMonitor(id: string): Promise<void> {
    try {
      if (this.useFirebase) {
        await firebaseMonitoringService.deleteMonitor(id);
      } else {
        const response = await fetch(this.apiBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_monitor', id })
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete monitor');
        }
      }
    } catch (error) {
      console.error('❌ Error deleting monitor:', error);
      throw error;
    }
  }

  // ============================
  // 🔍 MONITOR CHECKS
  // ============================

  async triggerCheck(monitorId: string): Promise<CheckResult> {
    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_check', data: { monitorId } })
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger check');
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error triggering check:', error);
      throw error;
    }
  }

  async performMultiRegionCheck(monitorId: string): Promise<RegionalCheckResult[]> {
    // Simulate multi-region check
    const regions = [
      { id: 'us-east-1', name: 'US East (N. Virginia)' },
      { id: 'us-west-2', name: 'US West (Oregon)' },
      { id: 'eu-west-1', name: 'Europe (Ireland)' },
      { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' }
    ];

    const results: RegionalCheckResult[] = [];
    
    for (const region of regions) {
      const responseTime = Math.floor(Math.random() * 500) + 50;
      const rtt = Math.floor(Math.random() * 100) + 10;
      const status = Math.random() > 0.1 ? 'up' : 'down';
      
      results.push({
        regionId: region.id,
        regionName: region.name,
        status,
        responseTime,
        rtt,
        timestamp: new Date(),
        error: status === 'down' ? 'Connection timeout' : undefined
      });
    }

    return results;
  }

  async performBrowserCheck(monitorId: string): Promise<UptimeBrowserCheckResult> {
    try {
      const monitor = await this.getMonitorById(monitorId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      const result = await playwrightBrowserService.performBrowserCheck({
        url: monitor.url,
        viewport: { width: 1920, height: 1080 },
        timeout: 30000,
        screenshot: true,
        performance: true,
        consoleLogs: true,
        networkLogs: true
      });

      return {
        success: result.success,
        loadTime: result.loadTime || 0,
        domReadyTime: result.domContentLoaded || 0,
        screenshot: result.screenshot,
        consoleErrors: result.consoleErrors,
        networkErrors: result.networkErrors,
        visualErrors: [],
        customScriptResults: result.customMetrics || {},
        elementChecks: { expected: [], found: [], missing: [], forbidden: [] }
      };
    } catch (error) {
      console.error('❌ Error performing browser check:', error);
      throw error;
    }
  }

  async getMonitorById(id: string): Promise<Monitor | null> {
    try {
      const monitors = await this.getAllMonitors();
      return monitors.find(m => m.id === id) || null;
    } catch (error) {
      console.error('❌ Error getting monitor by ID:', error);
      return null;
    }
  }

  // ============================
  // ⚠️ INCIDENT MANAGEMENT
  // ============================

  async getIncidents(): Promise<Incident[]> {
    return [];
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    // No data, return null
    return null;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    try {
      if (this.useFirebase) {
        return await firebaseMonitoringService.updateIncident(id, updates);
      } else {
        // Simulate update
        const incident = await this.getIncidentById(id);
        if (!incident) {
          throw new Error('Incident not found');
        }
        
        const updatedIncident = { ...incident, ...updates, updatedAt: new Date() };
        return updatedIncident;
      }
    } catch (error) {
      console.error('❌ Error updating incident:', error);
      throw error;
    }
  }

  async resolveIncident(id: string): Promise<Incident> {
    try {
      if (this.useFirebase) {
        return await firebaseMonitoringService.resolveIncident(id);
      } else {
        return await this.updateIncident(id, { 
          status: 'resolved', 
          endTime: new Date(),
        });
      }
    } catch (error) {
      console.error('❌ Error resolving incident:', error);
      throw error;
    }
  }

  async acknowledgeIncident(id: string): Promise<Incident> {
    try {
      if (this.useFirebase) {
        return await firebaseMonitoringService.acknowledgeIncident(id);
      } else {
        return await this.updateIncident(id, { 
          status: 'acknowledged',
        });
      }
    } catch (error) {
      console.error('❌ Error acknowledging incident:', error);
      throw error;
    }
  }

  // ============================
  // 📊 ANALYTICS & REPORTING
  // ============================

  async getMonitorSummary(): Promise<MonitorSummary> {
    // Return an empty summary with only required properties and correct types
    return {
      totalMonitors: 0,
      upMonitors: 0,
      downMonitors: 0,
      pausedMonitors: 0,
      avgResponseTime: 0,
      activeIncidents: 0,
      uptime: '',
      regionalStats: [],
      protocolStats: [],
      slaCompliance: { target: 0, actual: 0, compliance: 0, violations: 0, penalties: 0 },
      anomalyAlerts: 0,
      autoRemediations: 0
    };
  }

  async getAnomalyHistory(monitorId: string): Promise<AnomalyRecord[]> {
    return [];
  }

  async getPerformanceTrends(monitorId: string): Promise<PerformanceDataPoint[]> {
    return [];
  }

  async generateDetailedUptimeReport(monitorId: string): Promise<DetailedUptimeReport> {
    throw new Error('Not implemented');
  }

  async generateLiveIncidentMap(): Promise<LiveIncidentMap> {
    // Simulate live incident map
    return {
      regions: [
        {
          regionId: 'us-east-1',
          regionName: 'US East (N. Virginia)',
          coordinates: { lat: 38.1308, lng: -78.4568 },
          status: 'up',
          incidents: [],
          lastCheck: new Date()
        }
      ],
      globalStatus: 'operational',
      totalIncidents: 0,
      lastUpdated: new Date()
    };
  }

  // ============================
  // 🔔 NOTIFICATIONS
  // ============================

  async sendNotification(notificationData: any): Promise<boolean> {
    try {
      const result = await notificationService.sendBulkNotification([notificationData]);
      return result[0]?.success || false;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return false;
    }
  }

  async testNotification(notificationConfig: any): Promise<boolean> {
    try {
      const result = await notificationService.testNotification(
        notificationConfig.type, 
        notificationConfig
      );
      return result.success;
    } catch (error) {
      console.error('❌ Error testing notification:', error);
      return false;
    }
  }

  async getNotificationHistory(): Promise<any[]> {
    // Simulate notification history
    return [
      {
        id: '1',
        type: 'email',
        recipient: 'admin@webwatch.com',
        message: 'Database connectivity issues detected',
        sentAt: new Date(Date.now() - 1800000),
        status: 'delivered'
      }
    ];
  }

  // ============================
  // 🤖 AUTO-REMEDIATION
  // ============================

  async attemptAutoRemediation(incidentId: string): Promise<AutoRemediationAttempt> {
    // Simulate auto-remediation
    return {
      attempted: false,
      success: false,
      action: '',
      timestamp: new Date(),
      result: '',
      error: undefined
    };
  }

  async getAutoRemediationHistory(incidentId: string): Promise<AutoRemediationAttempt[]> {
    // Simulate auto-remediation history
    return [
      {
        attempted: true,
        success: true,
        action: 'restart_service',
        timestamp: new Date(Date.now() - 1800000),
        result: 'success',
        error: undefined
      }
    ];
  }

  // ============================
  // 🎯 EVENT SYSTEM
  // ============================

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: 0
    };
  }
}

export const realTimeMonitoringApi = new RealTimeMonitoringApi(); 