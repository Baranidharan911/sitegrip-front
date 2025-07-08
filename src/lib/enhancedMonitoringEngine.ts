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
  MonitoringRegion,
  ProtocolCheckConfig,
  BrowserCheckConfig,
  SSLMonitoringConfig,
  AdaptiveFrequencyConfig,
  AnomalyDetectionConfig,
  ImpactCalculatorConfig,
  RedirectChain,
  SSLInfo
} from '../types/uptime';

// ============================
// 🌍 MONITORING REGIONS
// ============================

export const MONITORING_REGIONS: MonitoringRegion[] = [
  {
    id: 'us-east-1',
    name: 'US East (N. Virginia)',
    location: 'Virginia, USA',
    country: 'US',
    coordinates: { lat: 38.1308, lng: -78.4568 },
    isActive: true
  },
  {
    id: 'us-west-2',
    name: 'US West (Oregon)',
    location: 'Oregon, USA',
    country: 'US',
    coordinates: { lat: 45.5152, lng: -122.6784 },
    isActive: true
  },
  {
    id: 'eu-west-1',
    name: 'Europe (Ireland)',
    location: 'Dublin, Ireland',
    country: 'IE',
    coordinates: { lat: 53.3498, lng: -6.2603 },
    isActive: true
  },
  {
    id: 'eu-central-1',
    name: 'Europe (Frankfurt)',
    location: 'Frankfurt, Germany',
    country: 'DE',
    coordinates: { lat: 50.1109, lng: 8.6821 },
    isActive: true
  },
  {
    id: 'ap-southeast-1',
    name: 'Asia Pacific (Singapore)',
    location: 'Singapore',
    country: 'SG',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    isActive: true
  },
  {
    id: 'ap-northeast-1',
    name: 'Asia Pacific (Tokyo)',
    location: 'Tokyo, Japan',
    country: 'JP',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    isActive: true
  },
  {
    id: 'sa-east-1',
    name: 'South America (São Paulo)',
    location: 'São Paulo, Brazil',
    country: 'BR',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    isActive: true
  }
];

// ============================
// 🚀 ENHANCED MONITORING ENGINE
// ============================

export class EnhancedMonitoringEngine {
  private anomalyBaselines: Map<string, AnomalyBaseline> = new Map();
  private performanceHistory: Map<string, PerformanceDataPoint[]> = new Map();
  private incidentHistory: Map<string, Incident[]> = new Map();
  private adaptiveIntervals: Map<string, number> = new Map();

  // ============================
  // 🌍 MULTI-REGION CHECKS
  // ============================

  async performMultiRegionCheck(monitor: Monitor): Promise<RegionalCheckResult[]> {
    const results: RegionalCheckResult[] = [];
    const activeRegions = monitor.regions?.filter(r => r.isActive) || MONITORING_REGIONS.filter(r => r.isActive);

    console.log(`🌍 Performing multi-region check for ${monitor.name} across ${activeRegions.length} regions`);

    // Perform checks in parallel with regional delays to simulate real-world conditions
    const checkPromises = activeRegions.map(async (region, index) => {
      // Add small delay to simulate regional differences
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
        // Handle failed regional checks
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

  private async performRegionalCheck(monitor: Monitor, region: MonitoringRegion): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
    try {
      const protocol = monitor.protocol || 'https';
      const url = monitor.url;
      const timeout = monitor.timeout || 10000;

      switch (protocol) {
        case 'http':
        case 'https':
          return await this.performHttpCheck(url, timeout, monitor);
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

  // ============================
  // 🌐 PROTOCOL COVERAGE
  // ============================

  private async performHttpCheck(url: string, timeout: number, monitor: Monitor): Promise<Omit<RegionalCheckResult, 'regionId' | 'regionName' | 'rtt'>> {
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

      // Check for redirects if enabled
      const redirectChain: RedirectChain[] = [];
      if (monitor.redirectTracing && response.redirected) {
        redirectChain.push({
          url: response.url,
          statusCode: response.status,
          responseTime,
          timestamp: new Date()
        });
      }

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
    // Simulate TCP check (in real implementation, you'd use a backend service)
    const startTime = Date.now();
    
    try {
      // For demo purposes, simulate TCP connection
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('TCP connection timeout')), timeout);
        
        // Simulate connection attempt
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
    // Simulate UDP check
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
      // Simulate DNS resolution
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
      // Simulate ICMP ping
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
      // Simulate WebSocket connection
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
      // Simulate TLS handshake
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
  // 🖥️ REAL BROWSER CHECKS
  // ============================

  async performBrowserCheck(monitor: Monitor): Promise<BrowserCheckResult> {
    if (!monitor.browserCheck?.enabled) {
      return {
        success: true,
        loadTime: 0,
        domReadyTime: 0,
        consoleErrors: [],
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

    console.log(`🖥️ Performing browser check for ${monitor.name}`);

    try {
      // In a real implementation, this would use Playwright or Puppeteer
      // For demo purposes, we'll simulate browser checks
      const loadTime = Math.random() * 2000 + 500;
      const domReadyTime = loadTime * 0.8;

      // Simulate various checks
      const consoleErrors = Math.random() > 0.8 ? ['JavaScript error detected'] : [];
      const networkErrors = Math.random() > 0.9 ? ['Network request failed'] : [];
      const visualErrors = Math.random() > 0.95 ? ['Visual regression detected'] : [];

      // Element checks
      const expectedElements = monitor.browserCheck.expectedElements || [];
      const forbiddenElements = monitor.browserCheck.forbiddenElements || [];
      
      const foundElements = expectedElements.filter(() => Math.random() > 0.1);
      const missingElements = expectedElements.filter(() => Math.random() > 0.1);
      const foundForbidden = forbiddenElements.filter(() => Math.random() > 0.05);

      // Custom script results
      const customScriptResults: Record<string, any> = {};
      monitor.browserCheck.customScripts?.forEach(script => {
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
  // 🔍 CONTENT INTEGRITY CHECKS
  // ============================

  async performContentIntegrityCheck(monitor: Monitor, content: string): Promise<ContentIntegrityCheck> {
    const checksum = this.generateChecksum(content);
    const expectedChecksum = monitor.contentChecksum;
    const checksumMatch = !expectedChecksum || checksum === expectedChecksum;

    // Keyword checks
    const expectedKeywords = monitor.expectedContent || [];
    const foundKeywords = expectedKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    const missingKeywords = expectedKeywords.filter(keyword => 
      !content.toLowerCase().includes(keyword.toLowerCase())
    );

    // DOM changes (simulated)
    const domChanges = {
      addedElements: Math.random() > 0.9 ? ['new-element'] : [],
      removedElements: Math.random() > 0.9 ? ['old-element'] : [],
      modifiedElements: Math.random() > 0.9 ? ['modified-element'] : []
    };

    return {
      checksum,
      expectedChecksum,
      checksumMatch,
      keywordChecks: {
        expected: expectedKeywords,
        found: foundKeywords,
        missing: missingKeywords
      },
      domChanges
    };
  }

  private generateChecksum(content: string): string {
    // Simple checksum generation (in production, use crypto)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // ============================
  // 🧠 ANOMALY DETECTION
  // ============================

  async detectAnomalies(monitor: Monitor, checkResult: CheckResult): Promise<AnomalyRecord[]> {
    const anomalies: AnomalyRecord[] = [];
    const config = monitor.anomalyDetection;

    if (!config?.enabled) return anomalies;

    const baseline = await this.getAnomalyBaseline(monitor.id);
    const history = this.getPerformanceHistory(monitor.id);

    // Response time anomaly detection
    if (config.metrics.includes('response_time')) {
      const responseTimeAnomaly = this.detectResponseTimeAnomaly(
        checkResult.responseTime,
        baseline.responseTime,
        config.alertThreshold
      );
      if (responseTimeAnomaly) {
        anomalies.push(responseTimeAnomaly);
      }
    }

    // Error rate anomaly detection
    if (config.metrics.includes('error_rate')) {
      const errorRateAnomaly = this.detectErrorRateAnomaly(
        history,
        baseline.errorRate,
        config.alertThreshold
      );
      if (errorRateAnomaly) {
        anomalies.push(errorRateAnomaly);
      }
    }

    // Status code anomaly detection
    if (config.metrics.includes('status_codes')) {
      const statusCodeAnomaly = this.detectStatusCodeAnomaly(
        checkResult.statusCode ?? 0,
        baseline.statusCodes
      );
      if (statusCodeAnomaly) {
        anomalies.push(statusCodeAnomaly);
      }
    }

    return anomalies;
  }

  private detectResponseTimeAnomaly(
    currentResponseTime: number,
    baseline: { mean: number; stdDev: number },
    threshold: number
  ): AnomalyRecord | null {
    const zScore = Math.abs(currentResponseTime - baseline.mean) / baseline.stdDev;
    
    if (zScore > threshold) {
      return {
        timestamp: new Date(),
        type: 'response_time',
        severity: zScore > threshold * 2 ? 'high' : 'medium',
        score: zScore,
        description: `Response time anomaly detected: ${currentResponseTime}ms (baseline: ${baseline.mean}ms ± ${baseline.stdDev}ms)`,
        resolved: false
      };
    }
    
    return null;
  }

  private detectErrorRateAnomaly(
    history: PerformanceDataPoint[],
    baseline: { mean: number; stdDev: number },
    threshold: number
  ): AnomalyRecord | null {
    // Calculate recent error rate
    const recentChecks = history.slice(-10);
    const errorCount = recentChecks.filter(check => check.statusCode >= 400).length;
    const errorRate = errorCount / recentChecks.length;

    const zScore = Math.abs(errorRate - baseline.mean) / baseline.stdDev;
    
    if (zScore > threshold) {
      return {
        timestamp: new Date(),
        type: 'error_rate',
        severity: zScore > threshold * 2 ? 'high' : 'medium',
        score: zScore,
        description: `Error rate anomaly detected: ${(errorRate * 100).toFixed(1)}% (baseline: ${(baseline.mean * 100).toFixed(1)}%)`,
        resolved: false
      };
    }
    
    return null;
  }

  private detectStatusCodeAnomaly(
    currentStatusCode: number,
    baseline: Record<number, number>
  ): AnomalyRecord | null {
    const expectedCodes = Object.keys(baseline).map(Number);
    
    if (!expectedCodes.includes(currentStatusCode)) {
      return {
        timestamp: new Date(),
        type: 'status_code',
        severity: 'medium',
        score: 1.0,
        description: `Unexpected status code: ${currentStatusCode} (expected: ${expectedCodes.join(', ')})`,
        resolved: false
      };
    }
    
    return null;
  }

  // ============================
  // 📊 IMPACT CALCULATION
  // ============================

  async calculateImpact(monitor: Monitor, incident: Incident): Promise<ImpactAssessment> {
    const config = monitor.impactCalculator;
    
    if (!config?.enabled) {
      return {
        trafficLoss: 0,
        revenueLoss: 0,
        seoRankingDrop: 0,
        customerChurn: 0,
        supportCost: 0,
        totalImpact: 0
      };
    }

    const downtimeMinutes = incident.endTime 
      ? (incident.endTime.getTime() - incident.startTime.getTime()) / (1000 * 60)
      : (Date.now() - incident.startTime.getTime()) / (1000 * 60);

    // Calculate traffic loss
    const trafficLoss = (config.averageTraffic / 60) * downtimeMinutes;

    // Calculate revenue loss
    const revenueLoss = trafficLoss * config.averageRevenue;

    // Calculate SEO impact
    const seoRankingDrop = Math.min(10, Math.floor(downtimeMinutes / 60)); // Max 10 positions

    // Calculate customer churn
    const customerChurn = trafficLoss * (config.customerImpact.churnRate / 100);

    // Calculate support cost
    const supportCost = customerChurn * config.customerImpact.supportCost;

    // Calculate total impact
    const totalImpact = revenueLoss + supportCost + (seoRankingDrop * 1000); // SEO penalty

    return {
      trafficLoss,
      revenueLoss,
      seoRankingDrop,
      customerChurn,
      supportCost,
      totalImpact
    };
  }

  // ============================
  // 🧠 ROOT CAUSE ANALYSIS
  // ============================

  async analyzeRootCause(monitor: Monitor, incident: Incident, checkResults: RegionalCheckResult[]): Promise<RootCauseAnalysis> {
    // Analyze patterns in check results to determine root cause
    const failedRegions = checkResults.filter(r => r.status === 'down');
    const successfulRegions = checkResults.filter(r => r.status === 'up');
    
    let category: RootCauseAnalysis['category'] = 'unknown';
    let description = 'Unable to determine root cause';
    let confidence = 0.3;
    const evidence: string[] = [];

    // Regional analysis
    if (failedRegions.length === checkResults.length) {
      // All regions failed - likely application or server issue
      category = 'application';
      description = 'Complete service outage affecting all regions';
      confidence = 0.8;
      evidence.push('All monitoring regions report service down');
    } else if (failedRegions.length > 0 && successfulRegions.length > 0) {
      // Partial failure - likely regional network issue
      category = 'network';
      description = 'Regional network connectivity issues';
      confidence = 0.6;
      evidence.push(`${failedRegions.length} regions affected, ${successfulRegions.length} regions operational`);
    }

    // Response time analysis
    const avgResponseTime = checkResults.reduce((sum, r) => sum + r.responseTime, 0) / checkResults.length;
    if (avgResponseTime > 5000) {
      category = 'server';
      description = 'Server performance degradation';
      confidence = Math.max(confidence, 0.7);
      evidence.push(`Average response time: ${avgResponseTime}ms`);
    }

    // SSL analysis
    if (monitor.url.startsWith('https://')) {
      const sslIssues = checkResults.filter(r => r.error?.includes('SSL') || r.error?.includes('certificate'));
      if (sslIssues.length > 0) {
        category = 'ssl';
        description = 'SSL certificate or configuration issues';
        confidence = 0.9;
        evidence.push(`${sslIssues.length} regions report SSL issues`);
      }
    }

    return {
      category,
      description,
      confidence,
      evidence,
      aiGenerated: true
    };
  }

  // ============================
  // ⚡ ADAPTIVE FREQUENCY
  // ============================

  async adjustMonitoringFrequency(monitor: Monitor, anomalies: AnomalyRecord[]): Promise<number> {
    const config = monitor.adaptiveFrequency;
    
    if (!config?.enabled) {
      return monitor.interval;
    }

    const currentInterval = this.adaptiveIntervals.get(monitor.id) || config.baseInterval;
    
    // Check for escalation conditions
    for (const rule of config.escalationRules) {
      const shouldEscalate = this.checkEscalationCondition(rule, monitor, anomalies);
      
      if (shouldEscalate) {
        const newInterval = Math.max(config.minInterval, rule.newInterval);
        this.adaptiveIntervals.set(monitor.id, newInterval);
        
        console.log(`⚡ Escalating monitoring frequency for ${monitor.name}: ${currentInterval}s → ${newInterval}s`);
        return newInterval;
      }
    }

    // Gradual recovery
    const timeSinceLastAnomaly = this.getTimeSinceLastAnomaly(monitor.id);
    if (timeSinceLastAnomaly > config.recoveryTime * 60 * 1000) {
      const recoveredInterval = Math.min(config.maxInterval, currentInterval * 1.5);
      this.adaptiveIntervals.set(monitor.id, recoveredInterval);
      
      console.log(`🔄 Recovering monitoring frequency for ${monitor.name}: ${currentInterval}s → ${recoveredInterval}s`);
      return recoveredInterval;
    }

    return currentInterval;
  }

  private checkEscalationCondition(
    rule: any,
    monitor: Monitor,
    anomalies: AnomalyRecord[]
  ): boolean {
    switch (rule.condition) {
      case 'response_time_spike':
        return anomalies.some(a => a.type === 'response_time' && a.severity === 'high');
      case 'error_rate_increase':
        return anomalies.some(a => a.type === 'error_rate');
      case 'status_code_change':
        return anomalies.some(a => a.type === 'status_code');
      case 'content_mismatch':
        return anomalies.some(a => a.type === 'content_change');
      default:
        return false;
    }
  }

  private getTimeSinceLastAnomaly(monitorId: string): number {
    const history = this.getPerformanceHistory(monitorId);
    const lastAnomaly = history.find(h => h.statusCode >= 400);
    return lastAnomaly ? Date.now() - lastAnomaly.timestamp.getTime() : Infinity;
  }

  // ============================
  // 📈 PERFORMANCE TRACKING
  // ============================

  private async getAnomalyBaseline(monitorId: string): Promise<AnomalyBaseline> {
    if (!this.anomalyBaselines.has(monitorId)) {
      // Initialize baseline with default values
      this.anomalyBaselines.set(monitorId, {
        responseTime: { mean: 1000, stdDev: 200 },
        errorRate: { mean: 0.05, stdDev: 0.02 },
        statusCodes: { 200: 0.95, 404: 0.02, 500: 0.03 }
      });
    }
    
    return this.anomalyBaselines.get(monitorId)!;
  }

  private getPerformanceHistory(monitorId: string): PerformanceDataPoint[] {
    if (!this.performanceHistory.has(monitorId)) {
      this.performanceHistory.set(monitorId, []);
    }
    
    return this.performanceHistory.get(monitorId)!;
  }

  updatePerformanceHistory(monitorId: string, dataPoint: PerformanceDataPoint): void {
    const history = this.getPerformanceHistory(monitorId);
    history.push(dataPoint);
    
    // Keep only last 1000 data points
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    // Update baseline
    this.updateAnomalyBaseline(monitorId, history);
  }

  private updateAnomalyBaseline(monitorId: string, history: PerformanceDataPoint[]): void {
    if (history.length < 10) return;

    const responseTimes = history.map(h => h.responseTime);
    const mean = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / responseTimes.length;
    const stdDev = Math.sqrt(variance);

    const errorCount = history.filter(h => h.statusCode >= 400).length;
    const errorRate = errorCount / history.length;

    const statusCodeCounts: Record<number, number> = {};
    history.forEach(h => {
      statusCodeCounts[h.statusCode] = (statusCodeCounts[h.statusCode] || 0) + 1;
    });

    const statusCodes: Record<number, number> = {};
    Object.keys(statusCodeCounts).forEach(code => {
      statusCodes[Number(code)] = statusCodeCounts[Number(code)] / history.length;
    });

    this.anomalyBaselines.set(monitorId, {
      responseTime: { mean, stdDev },
      errorRate: { mean: errorRate, stdDev: Math.sqrt(errorRate * (1 - errorRate)) },
      statusCodes
    });
  }
}

// ============================
// 📊 SUPPORTING INTERFACES
// ============================

interface AnomalyBaseline {
  responseTime: { mean: number; stdDev: number };
  errorRate: { mean: number; stdDev: number };
  statusCodes: Record<number, number>;
}

// Export singleton instance
export const enhancedMonitoringEngine = new EnhancedMonitoringEngine(); 