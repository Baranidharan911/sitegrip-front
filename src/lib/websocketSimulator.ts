// ============================
// 🔌 WEBSOCKET SIMULATOR
// ============================

export class WebSocketSimulator {
  private listeners: Map<string, Function[]> = new Map();
  private interval: NodeJS.Timeout | null = null;
  private isConnected = false;

  connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🔌 Simulating WebSocket connection...');
      
      // Simulate connection delay
      setTimeout(() => {
        this.isConnected = true;
        console.log('✅ WebSocket simulator connected successfully');
        
        // Emit connected event
        this.emit('connected', { timestamp: new Date() });
        
        // Start simulating real-time updates
        this.startSimulation();
        
        resolve();
      }, 1000);
    });
  }

  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket simulator...');
    this.isConnected = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.emit('disconnected', { code: 1000, reason: 'Client disconnecting' });
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
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

  private startSimulation(): void {
    // Simulate real-time updates every 5 seconds
    this.interval = setInterval(() => {
      if (!this.isConnected) return;

      try {
        // Simulate random events
        const events = [
          'monitor_status_changed',
          'monitor_check_completed',
          'incident_created',
          'incident_updated',
          'incident_resolved',
          'anomaly_detected',
          'regional_check_completed',
          'performance_degraded',
          'sla_violation',
          'auto_remediation_attempted',
          'escalation_triggered',
          'notification_sent',
          'live_incident_map_update',
          'performance_trends_update',
          'audit_log_entry'
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        switch (randomEvent) {
          case 'monitor_status_changed':
            this.emit('monitor_status_changed', {
              monitorId: '3',
              oldStatus: false,
              newStatus: true,
              monitor: {
                id: '3',
                name: 'Database Server',
                status: true,
                lastCheck: new Date().toISOString()
              }
            });
            break;

          case 'monitor_check_completed':
            this.emit('monitor_check_completed', {
              monitorId: '1',
              checkResult: {
                id: Date.now().toString(),
                monitorId: '1',
                status: true,
                responseTime: Math.floor(Math.random() * 300) + 100,
                timestamp: new Date().toISOString(),
                error: null
              }
            });
            break;

          case 'incident_created':
            this.emit('incident_created', {
              incident: {
                id: Date.now().toString(),
                title: 'Performance degradation detected',
                description: 'Response times have increased by 200%',
                severity: 'high',
                status: 'open',
                createdAt: new Date().toISOString(),
                monitorId: '2'
              }
            });
            break;

          case 'incident_resolved':
            this.emit('incident_resolved', {
              incident: {
                id: '1',
                title: 'Database connectivity issues',
                status: 'resolved',
                resolvedAt: new Date().toISOString()
              }
            });
            break;

          case 'anomaly_detected':
            this.emit('anomaly_detected', {
              monitorId: '1',
              anomalies: [{
                id: Date.now().toString(),
                type: 'response_time_spike',
                severity: 'medium',
                detectedAt: new Date().toISOString(),
                description: 'Response time increased by 150%'
              }]
            });
            break;

          case 'performance_degraded':
            this.emit('performance_degraded', {
              incident: {
                id: Date.now().toString(),
                title: 'Performance degradation',
                severity: 'medium'
              },
              monitor: {
                id: '2',
                name: 'API Gateway'
              },
              anomalies: []
            });
            break;

          case 'live_incident_map_update':
            this.emit('live_incident_map_update', {
              activeIncidents: [
                {
                  id: '1',
                  title: 'Database connectivity issues',
                  severity: 'critical',
                  location: { lat: 37.7749, lng: -122.4194 }
                }
              ],
              lastUpdated: new Date().toISOString()
            });
            break;

          case 'performance_trends_update':
            this.emit('performance_trends_update', {
              monitorId: '1',
              trends: [
                {
                  timestamp: new Date().toISOString(),
                  responseTime: Math.floor(Math.random() * 500) + 100,
                  statusCode: 200
                }
              ]
            });
            break;

          default:
            // Emit a generic event for other types
            this.emit(randomEvent, {
              timestamp: new Date().toISOString(),
              data: `Simulated ${randomEvent} event`
            });
            break;
        }
      } catch (error) {
        console.error('❌ Error in WebSocket simulation:', error);
      }
    }, 5000);
  }

  getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: 0
    };
  }
}

// Export singleton instance
export const websocketSimulator = new WebSocketSimulator(); 