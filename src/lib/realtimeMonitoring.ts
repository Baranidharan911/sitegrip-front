import { frontendUptimeApi } from './frontendUptimeApi';
import { Monitor, CheckResult } from '../types/uptime';

class RealtimeMonitoringService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private checkQueue: string[] = [];
  private processingQueue = false;
  private eventListeners: Map<string, Function[]> = new Map();

  // Event types
  readonly EVENTS = {
    MONITOR_STATUS_CHANGED: 'monitor_status_changed',
    MONITOR_CHECK_COMPLETED: 'monitor_check_completed',
    MONITOR_ADDED: 'monitor_added',
    MONITOR_REMOVED: 'monitor_removed',
    ERROR_OCCURRED: 'error_occurred',
  } as const;

  constructor() {
    // Don't start monitoring automatically - wait for user to add monitors
  }

  // Start the monitoring service
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🔄 Monitoring service is already running');
      return;
    }

    console.log('🚀 Starting real-time monitoring service...');
    this.isRunning = true;

    // Start the monitoring loop
    this.monitoringInterval = setInterval(async () => {
      await this.performMonitoringCycle();
    }, 30000); // Check every 30 seconds

    // Perform initial check
    await this.performMonitoringCycle();
  }

  // Stop the monitoring service
  stop(): void {
    if (!this.isRunning) {
      console.log('🛑 Monitoring service is not running');
      return;
    }

    console.log('🛑 Stopping real-time monitoring service...');
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Perform a monitoring cycle
  private async performMonitoringCycle(): Promise<void> {
    try {
      console.log('🔄 Performing monitoring cycle...');
      
      // Get all active monitors
      const monitors = await frontendUptimeApi.getAllMonitors();
      const activeMonitors = monitors.filter(monitor => monitor.isActive);

      console.log(`📊 Found ${activeMonitors.length} active monitors`);

      // Check which monitors need to be checked
      const now = new Date();
      const monitorsToCheck = activeMonitors.filter(monitor => {
        if (!monitor.lastCheck) return true;
        
        const lastCheck = new Date(monitor.lastCheck);
        const intervalMs = (monitor.interval || 60) * 1000;
        return now.getTime() - lastCheck.getTime() >= intervalMs;
      });

      console.log(`🔍 ${monitorsToCheck.length} monitors need checking`);

      // Add monitors to the queue
      monitorsToCheck.forEach(monitor => {
        if (!this.checkQueue.includes(monitor.id)) {
          this.checkQueue.push(monitor.id);
        }
      });

      // Process the queue if not already processing
      if (!this.processingQueue) {
        await this.processCheckQueue();
      }

    } catch (error) {
      console.error('❌ Error in monitoring cycle:', error);
      this.emit(this.EVENTS.ERROR_OCCURRED, error);
    }
  }

  // Process the check queue
  private async processCheckQueue(): Promise<void> {
    if (this.processingQueue || this.checkQueue.length === 0) {
      return;
    }

    this.processingQueue = true;
    console.log(`🔄 Processing check queue with ${this.checkQueue.length} monitors`);

    try {
      // Process monitors in parallel (max 5 at a time to avoid overwhelming)
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < this.checkQueue.length; i += batchSize) {
        batches.push(this.checkQueue.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.allSettled(
          batch.map(monitorId => this.checkSingleMonitor(monitorId))
        );
        
        // Small delay between batches to be nice to the network
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Clear the queue
      this.checkQueue = [];

    } catch (error) {
      console.error('❌ Error processing check queue:', error);
      this.emit(this.EVENTS.ERROR_OCCURRED, error);
    } finally {
      this.processingQueue = false;
    }
  }

  // Check a single monitor
  private async checkSingleMonitor(monitorId: string): Promise<void> {
    try {
      console.log(`🔍 Checking monitor ${monitorId}...`);
      
      // Get the monitor details
      const monitor = await frontendUptimeApi.getMonitorById(monitorId);
      const oldStatus = monitor.status;

      // Perform the check
      const checkResult = await frontendUptimeApi.performMonitorCheck(monitorId);
      
      console.log(`✅ Monitor ${monitorId} check completed: ${checkResult.status}`);

      // Emit events
      this.emit(this.EVENTS.MONITOR_CHECK_COMPLETED, {
        monitorId,
        checkResult,
        monitor
      });

      // If status changed, emit status change event
      if (oldStatus !== checkResult.status) {
        console.log(`🔄 Monitor ${monitorId} status changed from ${oldStatus} to ${checkResult.status}`);
        
        this.emit(this.EVENTS.MONITOR_STATUS_CHANGED, {
          monitorId,
          oldStatus,
          newStatus: checkResult.status,
          checkResult,
          monitor
        });
      }

    } catch (error) {
      console.error(`❌ Error checking monitor ${monitorId}:`, error);
      this.emit(this.EVENTS.ERROR_OCCURRED, {
        monitorId,
        error
      });
    }
  }

  // Manually trigger a check for a specific monitor
  async triggerCheck(monitorId: string): Promise<CheckResult> {
    console.log(`🔍 Manually triggering check for monitor ${monitorId}...`);
    
    try {
      const result = await frontendUptimeApi.performMonitorCheck(monitorId);
      
      this.emit(this.EVENTS.MONITOR_CHECK_COMPLETED, {
        monitorId,
        checkResult: result,
        manual: true
      });

      return result;
    } catch (error) {
      console.error(`❌ Error in manual check for monitor ${monitorId}:`, error);
      throw error;
    }
  }

  // Add a monitor to the monitoring service
  async addMonitor(monitor: Monitor): Promise<void> {
    console.log(`➕ Adding monitor ${monitor.id} to monitoring service`);
    
    // Perform initial check
    await this.triggerCheck(monitor.id);
    
    this.emit(this.EVENTS.MONITOR_ADDED, { monitor });
  }

  // Remove a monitor from the monitoring service
  removeMonitor(monitorId: string): void {
    console.log(`➖ Removing monitor ${monitorId} from monitoring service`);
    
    // Remove from queue if present
    this.checkQueue = this.checkQueue.filter(id => id !== monitorId);
    
    this.emit(this.EVENTS.MONITOR_REMOVED, { monitorId });
  }

  // Event system
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

  // Get service status
  getStatus(): {
    isRunning: boolean;
    queueLength: number;
    processingQueue: boolean;
  } {
    return {
      isRunning: this.isRunning,
      queueLength: this.checkQueue.length,
      processingQueue: this.processingQueue,
    };
  }

  // Get monitoring statistics
  async getStats(): Promise<{
    totalMonitors: number;
    activeMonitors: number;
    upMonitors: number;
    downMonitors: number;
    lastCheckTime: Date | null;
  }> {
    try {
      const monitors = await frontendUptimeApi.getAllMonitors();
      const activeMonitors = monitors.filter(m => m.isActive);
      const upMonitors = activeMonitors.filter(m => m.status === true);
      const downMonitors = activeMonitors.filter(m => m.status === false);

      return {
        totalMonitors: monitors.length,
        activeMonitors: activeMonitors.length,
        upMonitors: upMonitors.length,
        downMonitors: downMonitors.length,
        lastCheckTime: this.isRunning ? new Date() : null,
      };
    } catch (error) {
      console.error('❌ Error getting monitoring stats:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const realtimeMonitoring = new RealtimeMonitoringService();

// Don't auto-start - wait for user to add monitors 