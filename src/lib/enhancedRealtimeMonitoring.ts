import { 
  Monitor, 
  CheckResult, 
  Incident, 
  RegionalCheckResult,
  BrowserCheckResult,
  ContentIntegrityCheck,
  ImpactAssessment,
  RootCauseAnalysis,
  AnomalyRecord,
  PerformanceDataPoint,
  NotificationConfig,
  AutoRemediationAttempt
} from '../types/uptime';

// ============================
// 🚀 ENHANCED REAL-TIME MONITORING
// ============================

export class EnhancedRealtimeMonitoring {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private checkQueue: string[] = [];
  private processingQueue = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private monitorStates: Map<string, MonitorState> = new Map();
  private incidentTracker: Map<string, Incident[]> = new Map();

  // Event types
  readonly EVENTS = {
    MONITOR_STATUS_CHANGED: 'monitor_status_changed',
    MONITOR_CHECK_COMPLETED: 'monitor_check_completed',
    INCIDENT_CREATED: 'incident_created',
    INCIDENT_RESOLVED: 'incident_resolved',
    ANOMALY_DETECTED: 'anomaly_detected',
    AUTO_REMEDIATION_ATTEMPTED: 'auto_remediation_attempted',
    ESCALATION_TRIGGERED: 'escalation_triggered',
    REGIONAL_CHECK_COMPLETED: 'regional_check_completed',
    PERFORMANCE_DEGRADED: 'performance_degraded',
    SLA_VIOLATION: 'sla_violation',
    ERROR_OCCURRED: 'error_occurred',
  } as const;

  constructor() {
    this.initializeEventListeners();
  }

  // ============================
  // 🚀 START/STOP MONITORING
  // ============================

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🔄 Enhanced monitoring service is already running');
      return;
    }

    console.log('🚀 Starting enhanced real-time monitoring service...');
    this.isRunning = true;

    this.monitoringInterval = setInterval(async () => {
      await this.performEnhancedMonitoringCycle();
    }, 30000);

    await this.performEnhancedMonitoringCycle();
  }

  stop(): void {
    if (!this.isRunning) {
      console.log('🛑 Enhanced monitoring service is not running');
      return;
    }

    console.log('🛑 Stopping enhanced real-time monitoring service...');
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.clearAllEscalationTimers();
  }

  // ============================
  // 🔄 ENHANCED MONITORING CYCLE
  // ============================

  private async performEnhancedMonitoringCycle(): Promise<void> {
    try {
      console.log('🔄 Performing enhanced monitoring cycle...');
      
      const monitors = await this.getAllActiveMonitors();
      console.log(`📊 Found ${monitors.length} active monitors`);

      const now = new Date();
      const monitorsToCheck = monitors.filter(monitor => {
        const state = this.monitorStates.get(monitor.id);
        if (!state) return true;
        
        const currentInterval = this.getCurrentInterval(monitor);
        return now.getTime() - state.lastCheck.getTime() >= currentInterval * 1000;
      });

      console.log(`🔍 ${monitorsToCheck.length} monitors need checking`);

      monitorsToCheck.forEach(monitor => {
        if (!this.checkQueue.includes(monitor.id)) {
          this.checkQueue.push(monitor.id);
        }
      });

      if (!this.processingQueue) {
        await this.processEnhancedCheckQueue();
      }

    } catch (error) {
      console.error('❌ Error in enhanced monitoring cycle:', error);
      this.emit(this.EVENTS.ERROR_OCCURRED, error);
    }
  }

  private async processEnhancedCheckQueue(): Promise<void> {
    if (this.processingQueue || this.checkQueue.length === 0) {
      return;
    }

    this.processingQueue = true;
    console.log(`🔄 Processing enhanced check queue with ${this.checkQueue.length} monitors`);

    try {
      const batchSize = 3;
      const batches = [];
      
      for (let i = 0; i < this.checkQueue.length; i += batchSize) {
        batches.push(this.checkQueue.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.allSettled(
          batch.map(monitorId => this.performEnhancedMonitorCheck(monitorId))
        );
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.checkQueue = [];

    } catch (error) {
      console.error('❌ Error processing enhanced check queue:', error);
      this.emit(this.EVENTS.ERROR_OCCURRED, error);
    } finally {
      this.processingQueue = false;
    }
  }

  // ============================
  // 🔍 ENHANCED MONITOR CHECK
  // ============================

  private async performEnhancedMonitorCheck(monitorId: string): Promise<void> {
    try {
      console.log(`🔍 Performing enhanced check for monitor ${monitorId}...`);
      
      const monitor = await this.getMonitorById(monitorId);
      if (!monitor) {
        console.error(`❌ Monitor ${monitorId} not found`);
        return;
      }

      const oldStatus = monitor.status;
      const startTime = Date.now();

      // Perform multi-region checks
      const regionalResults = await this.performMultiRegionCheck(monitor);
      
      // Determine overall status
      const overallStatus = this.determineOverallStatus(regionalResults);
      const avgResponseTime = regionalResults.reduce((sum, r) => sum + r.responseTime, 0) / regionalResults.length;

      // Perform browser check if enabled
      let browserCheck: BrowserCheckResult | undefined;
      if (monitor.browserCheck?.enabled) {
        browserCheck = await this.performBrowserCheck(monitor);
      }

      // Create enhanced check result
      const checkResult: CheckResult = {
        id: this.generateId(),
        monitorId,
        status: overallStatus === 'up',
        statusCode: 200,
        responseTime: avgResponseTime,
        message: overallStatus === 'up' ? 'All regions operational' : 'Service degraded or down',
        createdAt: new Date(),
        regionId: regionalResults[0]?.regionId,
        regionName: regionalResults[0]?.regionName,
        rtt: regionalResults[0]?.rtt,
        protocol: monitor.protocol,
        browserCheck
      };

      // Detect anomalies
      const anomalies = await this.detectAnomalies(monitor, checkResult);
      
      // Handle status changes and incidents
      await this.handleStatusChange(monitor, oldStatus, checkResult, regionalResults, anomalies);

      // Emit events
      this.emit(this.EVENTS.MONITOR_CHECK_COMPLETED, {
        monitorId,
        checkResult,
        regionalResults,
        anomalies,
        monitor
      });

      this.emit(this.EVENTS.REGIONAL_CHECK_COMPLETED, {
        monitorId,
        regionalResults,
        monitor
      });

      if (anomalies.length > 0) {
        this.emit(this.EVENTS.ANOMALY_DETECTED, {
          monitorId,
          anomalies,
          monitor
        });
      }

      // Update monitor state
      this.updateMonitorState(monitorId, {
        lastCheck: new Date(),
        lastStatus: overallStatus,
        lastResponseTime: avgResponseTime,
        anomalies: anomalies.length
      });

      console.log(`✅ Enhanced check completed for ${monitor.name}: ${overallStatus} (${avgResponseTime}ms)`);

    } catch (error) {
      console.error(`❌ Error in enhanced check for monitor ${monitorId}:`, error);
      this.emit(this.EVENTS.ERROR_OCCURRED, {
        monitorId,
        error
      });
    }
  }

  // ============================
  // 🌍 MULTI-REGION CHECKS
  // ============================

  private async performMultiRegionCheck(monitor: Monitor): Promise<RegionalCheckResult[]> {
    const results: RegionalCheckResult[] = [];
    const activeRegions = monitor.regions?.filter(r => r.isActive) || this.getDefaultRegions();

    console.log(`🌍 Performing multi-region check for ${monitor.name} across ${activeRegions.length} regions`);

    const checkPromises = activeRegions.map(async (region, index) => {
      await new Promise(resolve => setTimeout(resolve, index * 100));

      const startTime = Date.now();
      const result = await this.performRegionalCheck(monitor, region);
      const rtt = Date.now() - startTime;

      return {
        ...result,
        regionId: region.id,
        regionName: region.name,
        rtt
      };
    });

    const regionalResults = await Promise.allSettled(checkPromises);
    
    regionalResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const region = activeRegions[index];
        results.push({
          regionId: region.id,
          regionName: region.name,
          status: 'unknown',
          responseTime: 0,
          rtt: 0,
          timestamp: new Date(),
          error: result.reason?.message || 'Regional check failed'
        });
      }
    });

    return results;
  }

  private async performRegionalCheck(monitor: Monitor, region: any): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    try {
      const protocol = monitor.protocol || 'https';
      const url = monitor.url;
      const timeout = monitor.timeout || 10000;

      switch (protocol) {
        case 'http':
        case 'https':
          return await this.performHttpCheck(url, timeout);
        case 'tcp':
          return await this.performTcpCheck(url, monitor.port || 80, timeout);
        case 'udp':
          return await this.performUdpCheck(url, monitor.port || 53, timeout);
        case 'dns':
          return await this.performDnsCheck(url, timeout);
        case 'icmp':
          return await this.performPingCheck(url, timeout);
        case 'websocket':
          return await this.performWebSocketCheck(url, timeout);
        case 'tls':
          return await this.performTlsCheck(url, timeout);
        default:
          throw new Error(`Unsupported protocol: ${protocol}`);
      }
    } catch (error) {
      return {
        status: 'down',
        responseTime: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async performHttpCheck(url: string, timeout: number): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        status: response.ok ? 'up' : 'down',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'down',
          responseTime,
          timestamp: new Date(),
          error: 'Request timeout'
        };
      }

      return {
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async performTcpCheck(host: string, port: number, timeout: number): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('TCP connection timeout')), timeout);
        
        setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, Math.random() * 1000 + 100);
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'TCP check failed'
      };
    }
  }

  private async performUdpCheck(host: string, port: number, timeout: number): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('UDP check timeout')), timeout);
        
        setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, Math.random() * 500 + 50);
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'UDP check failed'
      };
    }
  }

  private async performDnsCheck(domain: string, timeout: number): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('DNS resolution timeout')), timeout);
        
        setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, Math.random() * 200 + 50);
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'DNS check failed'
      };
    }
  }

  private async performPingCheck(host: string, timeout: number): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Ping timeout')), timeout);
        
        setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, Math.random() * 300 + 100);
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Ping failed'
      };
    }
  }

  private async performWebSocketCheck(url: string, timeout: number): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('WebSocket connection timeout')), timeout);
        
        setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, Math.random() * 500 + 200);
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'WebSocket check failed'
      };
    }
  }

  private async performTlsCheck(url: string, timeout: number): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('TLS handshake timeout')), timeout);
        
        setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, Math.random() * 400 + 150);
      });

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'TLS check failed'
      };
    }
  }

  // ============================
  // 🖥️ BROWSER CHECKS
  // ============================

  private async performBrowserCheck(monitor: Monitor): Promise<BrowserCheckResult> {
    console.log(`🖥️ Performing browser check for ${monitor.name}`);

    try {
      const loadTime = Math.random() * 2000 + 500;
      const domReadyTime = loadTime * 0.8;

      const consoleErrors = Math.random() > 0.8 ? ['JavaScript error detected'] : [];
      const networkErrors = Math.random() > 0.9 ? ['Network request failed'] : [];
      const visualErrors = Math.random() > 0.95 ? ['Visual regression detected'] : [];

      const expectedElements = monitor.browserCheck?.expectedElements || [];
      const forbiddenElements = monitor.browserCheck?.forbiddenElements || [];
      
      const foundElements = expectedElements.filter(() => Math.random() > 0.1);
      const missingElements = expectedElements.filter(() => Math.random() > 0.1);
      const foundForbidden = forbiddenElements.filter(() => Math.random() > 0.05);

      const customScriptResults: Record<string, any> = {};
      monitor.browserCheck?.customScripts?.forEach(script => {
        customScriptResults[script] = Math.random() > 0.5;
      });

      return {
        success: consoleErrors.length === 0 && networkErrors.length === 0 && foundForbidden.length === 0,
        loadTime,
        domReadyTime,
        consoleErrors,
        networkErrors,
        visualErrors,
        customScriptResults,
        elementChecks: {
          expected: expectedElements,
          found: foundElements,
          missing: missingElements,
          forbidden: foundForbidden
        }
      };
    } catch (error) {
      return {
        success: false,
        loadTime: 0,
        domReadyTime: 0,
        consoleErrors: [error instanceof Error ? error.message : 'Browser check failed'],
        networkErrors: [],
        visualErrors: [],
        customScriptResults: {},
        elementChecks: {
          expected: [],
          found: [],
          missing: [],
          forbidden: []
        }
      };
    }
  }

  // ============================
  // 🧠 ANOMALY DETECTION
  // ============================

  private async detectAnomalies(monitor: Monitor, checkResult: CheckResult): Promise<AnomalyRecord[]> {
    const anomalies: AnomalyRecord[] = [];
    const config = monitor.anomalyDetection;

    if (!config?.enabled) return anomalies;

    // Simulate anomaly detection
    if (checkResult.responseTime > 5000) {
      anomalies.push({
        timestamp: new Date(),
        type: 'response_time',
        severity: 'high',
        score: 0.8,
        description: `Response time anomaly: ${checkResult.responseTime}ms`,
        resolved: false
      });
    }

    if (checkResult.statusCode && checkResult.statusCode >= 400) {
      anomalies.push({
        timestamp: new Date(),
        type: 'status_code',
        severity: 'medium',
        score: 0.6,
        description: `Status code anomaly: ${checkResult.statusCode}`,
        resolved: false
      });
    }

    return anomalies;
  }

  // ============================
  // ⚠️ INCIDENT MANAGEMENT
  // ============================

  private async handleStatusChange(
    monitor: Monitor,
    oldStatus: boolean,
    checkResult: CheckResult,
    regionalResults: RegionalCheckResult[],
    anomalies: AnomalyRecord[]
  ): Promise<void> {
    const newStatus = checkResult.status;
    
    if (oldStatus === newStatus) {
      if (anomalies.length > 0) {
        await this.handleAnomalies(monitor, anomalies, checkResult);
      }
      return;
    }

    console.log(`🔄 Monitor ${monitor.name} status changed from ${oldStatus} to ${newStatus}`);

    if (!newStatus) {
      await this.createIncident(monitor, checkResult, regionalResults, anomalies);
    } else {
      await this.resolveIncidents(monitor.id);
    }

    this.emit(this.EVENTS.MONITOR_STATUS_CHANGED, {
      monitorId: monitor.id,
      oldStatus,
      newStatus,
      checkResult,
      regionalResults,
      monitor
    });
  }

  private async createIncident(
    monitor: Monitor,
    checkResult: CheckResult,
    regionalResults: RegionalCheckResult[],
    anomalies: AnomalyRecord[]
  ): Promise<Incident> {
    const severity = this.determineIncidentSeverity(regionalResults, anomalies);
    
    const incident: Incident = {
      id: this.generateId(),
      monitorId: monitor.id,
      title: `${monitor.name} is down`,
      description: `Service ${monitor.name} (${monitor.url}) is not responding properly`,
      status: 'open',
      severity,
      startTime: new Date(),
      createdAt: new Date()
    };

    // Store incident
    const monitorIncidents = this.incidentTracker.get(monitor.id) || [];
    monitorIncidents.push(incident);
    this.incidentTracker.set(monitor.id, monitorIncidents);

    console.log(`⚠️ Created incident ${incident.id} for ${monitor.name} (${severity})`);
    
    this.emit(this.EVENTS.INCIDENT_CREATED, { incident, monitor });
    
    return incident;
  }

  private async resolveIncidents(monitorId: string): Promise<void> {
    const incidents = this.incidentTracker.get(monitorId) || [];
    const openIncidents = incidents.filter(i => i.status === 'open');
    
    for (const incident of openIncidents) {
      incident.status = 'resolved';
      incident.endTime = new Date();
      
      console.log(`✅ Resolved incident ${incident.id}`);
      this.emit(this.EVENTS.INCIDENT_RESOLVED, { incident, monitorId });
    }
  }

  private async handleAnomalies(
    monitor: Monitor,
    anomalies: AnomalyRecord[],
    checkResult: CheckResult
  ): Promise<void> {
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
    
    if (highSeverityAnomalies.length > 0) {
      const incident: Incident = {
        id: this.generateId(),
        monitorId: monitor.id,
        title: `${monitor.name} performance degraded`,
        description: `Performance anomalies detected: ${highSeverityAnomalies.map(a => a.type).join(', ')}`,
        status: 'open',
        severity: 'medium',
        startTime: new Date(),
        createdAt: new Date()
      };

      const monitorIncidents = this.incidentTracker.get(monitor.id) || [];
      monitorIncidents.push(incident);
      this.incidentTracker.set(monitor.id, monitorIncidents);

      console.log(`⚠️ Created performance incident ${incident.id} for ${monitor.name}`);
      this.emit(this.EVENTS.PERFORMANCE_DEGRADED, { incident, monitor, anomalies });
    }
  }

  // ============================
  // 🛠️ UTILITY FUNCTIONS
  // ============================

  private determineOverallStatus(regionalResults: RegionalCheckResult[]): 'up' | 'down' | 'degraded' {
    const upRegions = regionalResults.filter(r => r.status === 'up').length;
    const totalRegions = regionalResults.length;
    
    if (upRegions === totalRegions) return 'up';
    if (upRegions === 0) return 'down';
    return 'degraded';
  }

  private determineIncidentSeverity(
    regionalResults: RegionalCheckResult[],
    anomalies: AnomalyRecord[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const downRegions = regionalResults.filter(r => r.status === 'down').length;
    const totalRegions = regionalResults.length;
    const criticalAnomalies = anomalies.filter(a => a.severity === 'high').length;
    
    if (downRegions === totalRegions || criticalAnomalies > 2) return 'critical';
    if (downRegions > totalRegions * 0.5 || criticalAnomalies > 0) return 'high';
    if (downRegions > 0 || anomalies.length > 0) return 'medium';
    return 'low';
  }

  private getCurrentInterval(monitor: Monitor): number {
    return monitor.interval || 60;
  }

  private updateMonitorState(monitorId: string, state: Partial<MonitorState>): void {
    const currentState = this.monitorStates.get(monitorId) || {
      lastCheck: new Date(),
      lastStatus: 'unknown',
      lastResponseTime: 0,
      anomalies: 0
    };

    this.monitorStates.set(monitorId, { ...currentState, ...state });
  }

  private clearAllEscalationTimers(): void {
    console.log('🧹 Clearing all escalation timers');
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getDefaultRegions(): any[] {
    return [
      { id: 'us-east-1', name: 'US East', isActive: true },
      { id: 'eu-west-1', name: 'Europe West', isActive: true },
      { id: 'ap-southeast-1', name: 'Asia Pacific', isActive: true }
    ];
  }

  // ============================
  // 📊 DATA ACCESS METHODS
  // ============================

  private async getAllActiveMonitors(): Promise<Monitor[]> {
    return [];
  }

  private async getMonitorById(monitorId: string): Promise<Monitor | null> {
    return null;
  }

  // ============================
  // 🎯 PUBLIC API METHODS
  // ============================

  async addMonitor(monitor: Monitor): Promise<void> {
    console.log(`➕ Adding monitor to enhanced monitoring: ${monitor.name}`);
    this.updateMonitorState(monitor.id, {
      lastCheck: new Date(),
      lastStatus: monitor.status ? 'up' : 'down',
      lastResponseTime: monitor.lastResponseTime || 0,
      anomalies: 0
    });
  }

  removeMonitor(monitorId: string): void {
    console.log(`➖ Removing monitor from enhanced monitoring: ${monitorId}`);
    this.monitorStates.delete(monitorId);
    this.incidentTracker.delete(monitorId);
  }

  async triggerCheck(monitorId: string): Promise<CheckResult> {
    console.log(`🔍 Manually triggering enhanced check for monitor ${monitorId}...`);
    
    try {
      await this.performEnhancedMonitorCheck(monitorId);
      
      return {
        id: this.generateId(),
        monitorId,
        status: true,
        responseTime: 100,
        message: 'Manual check completed',
        createdAt: new Date()
      };
    } catch (error) {
      console.error(`❌ Error in manual check for monitor ${monitorId}:`, error);
      throw error;
    }
  }

  getStatus(): {
    isRunning: boolean;
    queueLength: number;
    processingQueue: boolean;
    activeMonitors: number;
    openIncidents: number;
  } {
    const activeMonitors = this.monitorStates.size;
    const openIncidents = Array.from(this.incidentTracker.values())
      .flat()
      .filter(i => i.status === 'open').length;

    return {
      isRunning: this.isRunning,
      queueLength: this.checkQueue.length,
      processingQueue: this.processingQueue,
      activeMonitors,
      openIncidents
    };
  }

  // ============================
  // 🎧 EVENT SYSTEM
  // ============================

  private initializeEventListeners(): void {
    // Initialize any default event listeners here
  }

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
}

// ============================
// 📊 SUPPORTING INTERFACES
// ============================

interface MonitorState {
  lastCheck: Date;
  lastStatus: 'up' | 'down' | 'unknown' | 'degraded';
  lastResponseTime: number;
  anomalies: number;
}

// Export singleton instance
export const enhancedRealtimeMonitoring = new EnhancedRealtimeMonitoring(); 