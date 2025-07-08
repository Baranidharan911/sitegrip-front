// ============================
// 🔧 ENHANCED MONITOR INTERFACES
// ============================

export interface Monitor {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'https' | 'ping' | 'port' | 'ssl' | 'pagespeed' | 'hardware' | 'docker' | 'tcp' | 'udp' | 'dns' | 'websocket' | 'tls' | 'browser';
  status: boolean;
  interval: number; // in seconds
  timeout: number; // in seconds
  retries: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastCheck?: Date | null;
  lastResponseTime?: number | null;
  lastStatusCode?: number;
  uptime?: number;
  downtime?: number;
  tags?: string[];
  notifications?: NotificationConfig[];
  threshold?: {
    responseTime: number;
    statusCode: number;
  };
  
  // Enhanced monitoring features
  regions?: MonitoringRegion[];
  protocol?: 'http' | 'https' | 'tcp' | 'udp' | 'dns' | 'icmp' | 'websocket' | 'tls';
  port?: number;
  expectedContent?: string[];
  contentChecksum?: string;
  browserCheck?: BrowserCheckConfig;
  redirectTracing?: boolean;
  sslMonitoring?: SSLMonitoringConfig;
  adaptiveFrequency?: AdaptiveFrequencyConfig;
  slaTracking?: SLATrackingConfig;
  
  // Incident intelligence
  anomalyDetection?: AnomalyDetectionConfig;
  dependencyChain?: string[];
  impactCalculator?: ImpactCalculatorConfig;
  
  // Existing properties
  last_status?: 'up' | 'down';
  failures_in_a_row?: number;
  ssl_status?: 'valid' | 'expired' | 'expiring_soon' | 'invalid';
  ssl_monitoring_enabled?: boolean;
  ssl_cert_expires_at?: string;
  ssl_cert_issuer?: string;
  ssl_cert_days_until_expiry?: number | null;
  ssl_last_checked?: string;
  is_public?: boolean;
  frequency?: number;
  http_status?: number;
  uptime_stats?: {
    '24h': number;
    '7d': number;
    '30d': number;
  };
  lastDown?: string | Date;
  lastUp?: string | Date;
  isActive?: boolean;
  description?: string;
  expectedStatusCode?: number;
  retryInterval?: number;
}

// ============================
// 🌍 MULTI-REGION MONITORING
// ============================

export interface MonitoringRegion {
  id: string;
  name: string;
  location: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  rtt?: number; // Round trip time in ms
  lastCheck?: Date;
  status?: 'up' | 'down' | 'unknown';
}

export interface RegionalCheckResult {
  regionId: string;
  regionName: string;
  status: 'up' | 'down' | 'unknown';
  responseTime: number;
  rtt: number;
  timestamp: Date;
  error?: string;
}

// ============================
// 🌐 PROTOCOL COVERAGE
// ============================

export interface ProtocolCheckConfig {
  type: 'http' | 'https' | 'tcp' | 'udp' | 'dns' | 'icmp' | 'websocket' | 'tls';
  port?: number;
  method?: 'GET' | 'POST' | 'HEAD' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  expectedResponse?: string;
  timeout?: number;
}

// ============================
// 🖥️ REAL BROWSER CHECKS
// ============================

export interface BrowserCheckConfig {
  enabled: boolean;
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
  userAgent?: string;
  waitForSelector?: string;
  waitForTimeout?: number;
  screenshotOnFailure?: boolean;
  checkVisualErrors?: boolean;
  checkConsoleErrors?: boolean;
  checkNetworkErrors?: boolean;
  customScripts?: string[];
  expectedElements?: string[];
  forbiddenElements?: string[];
}

// ============================
// 🔄 REDIRECT & SSL TRACING
// ============================

export interface SSLMonitoringConfig {
  enabled: boolean;
  checkChain: boolean;
  alertOnSelfSigned: boolean;
  alertOnInvalid: boolean;
  alertDaysBeforeExpiry: number;
  checkRevocation: boolean;
  checkOCSP: boolean;
}

export interface RedirectChain {
  url: string;
  statusCode: number;
  location?: string;
  responseTime: number;
  timestamp: Date;
}

// ============================
// ⚡ ADAPTIVE FREQUENCY
// ============================

export interface AdaptiveFrequencyConfig {
  enabled: boolean;
  baseInterval: number; // seconds
  minInterval: number; // seconds
  maxInterval: number; // seconds
  anomalyThreshold: number; // percentage
  recoveryTime: number; // minutes
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: 'response_time_spike' | 'error_rate_increase' | 'status_code_change' | 'content_mismatch';
  threshold: number;
  newInterval: number;
  duration: number; // minutes
}

// ============================
// 📊 SLA TRACKING
// ============================

export interface SLATrackingConfig {
  enabled: boolean;
  targetUptime: number; // percentage
  measurementPeriod: 'month' | 'quarter' | 'year';
  businessHours?: {
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
    daysOfWeek: number[]; // 0-6, Sunday-Saturday
  };
  penalties?: {
    downtimeThreshold: number; // minutes
    penaltyAmount: number;
  };
}

// ============================
// 🧠 INCIDENT INTELLIGENCE
// ============================

export interface AnomalyDetectionConfig {
  enabled: boolean;
  baselinePeriod: number; // days
  sensitivity: 'low' | 'medium' | 'high';
  metrics: ('response_time' | 'error_rate' | 'status_codes' | 'content_changes')[];
  alertThreshold: number; // standard deviations
}

export interface ImpactCalculatorConfig {
  enabled: boolean;
  averageTraffic: number; // requests per hour
  averageRevenue: number; // revenue per request
  seoImpact: {
    rankingDrop: number;
    recoveryTime: number; // days
  };
  customerImpact: {
    churnRate: number; // percentage
    supportCost: number; // cost per support ticket
  };
}

// ============================
// 🔍 ENHANCED CHECK RESULT
// ============================

export interface CheckResult {
  id: string;
  monitorId: string;
  status: boolean;
  statusCode?: number;
  responseTime: number;
  message: string;
  createdAt: Date;
  error?: string;
  timestamp?: Date;
  
  // Enhanced properties
  regionId?: string;
  regionName?: string;
  rtt?: number;
  protocol?: string;
  redirectChain?: RedirectChain[];
  sslInfo?: SSLInfo;
  browserCheck?: BrowserCheckResult;
  contentIntegrity?: ContentIntegrityCheck;
  anomalyScore?: number;
  impact?: ImpactAssessment;
}

export interface BrowserCheckResult {
  success: boolean;
  loadTime: number;
  domReadyTime: number;
  screenshot?: string; // base64
  consoleErrors: string[];
  networkErrors: string[];
  visualErrors: string[];
  customScriptResults: Record<string, any>;
  elementChecks: {
    expected: string[];
    found: string[];
    missing: string[];
    forbidden: string[];
  };
  timestamp?: Date;
  id?: string;
}

export interface ContentIntegrityCheck {
  checksum: string;
  expectedChecksum?: string;
  checksumMatch: boolean;
  keywordChecks: {
    expected: string[];
    found: string[];
    missing: string[];
  };
  domChanges: {
    addedElements: string[];
    removedElements: string[];
    modifiedElements: string[];
  };
}

export interface ImpactAssessment {
  trafficLoss: number;
  revenueLoss: number;
  seoRankingDrop: number;
  customerChurn: number;
  supportCost: number;
  totalImpact: number;
}

// ============================
// ⚠️ ENHANCED INCIDENT INTERFACES
// ============================

export interface Incident {
  id: string;
  monitorId: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'acknowledged' | 'investigating';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  resolvedBy?: string;
  notes?: string[];
  updatedAt?: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  
  // Enhanced incident intelligence
  rootCause?: RootCauseAnalysis;
  blastRadius?: BlastRadiusAssessment;
  groupedIncidents?: string[];
  falsePositive?: boolean;
  consensus?: RegionalConsensus;
  dependencies?: DependencyImpact[];
  impact?: ImpactAssessment;
  recoverySuggestions?: RecoverySuggestion[];
  autoRemediation?: AutoRemediationAttempt;
}

export interface RootCauseAnalysis {
  category: 'network' | 'server' | 'application' | 'dns' | 'ssl' | 'cdn' | 'database' | 'external' | 'unknown';
  description: string;
  confidence: number; // 0-1
  evidence: string[];
  aiGenerated: boolean;
}

export interface BlastRadiusAssessment {
  affectedRegions: string[];
  affectedServices: string[];
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  estimatedUsers: number;
}

export interface RegionalConsensus {
  totalRegions: number;
  failedRegions: number;
  consensusPercentage: number;
  regions: {
    regionId: string;
    regionName: string;
    status: 'up' | 'down' | 'unknown';
    lastCheck: Date;
  }[];
}

export interface DependencyImpact {
  service: string;
  status: 'up' | 'down' | 'degraded';
  impact: 'none' | 'partial' | 'full';
  description: string;
}

export interface RecoverySuggestion {
  type: 'immediate' | 'short_term' | 'long_term';
  description: string;
  confidence: number;
  estimatedTime: number; // minutes
  steps: string[];
  automationScript?: string;
}

export interface AutoRemediationAttempt {
  attempted: boolean;
  success: boolean;
  action: string;
  timestamp: Date;
  result: string;
  error?: string;
}

// ============================
// 🔔 ENHANCED NOTIFICATIONS
// ============================

export interface NotificationConfig {
  type: 'email' | 'webhook' | 'slack' | 'discord' | 'telegram' | 'sms' | 'teams' | 'whatsapp' | 'pagerduty' | 'opsgenie';
  enabled: boolean;
  config: {
    email?: {
      addresses: string[];
      template?: string;
    };
    webhook?: {
      url: string;
      headers?: Record<string, string>;
      method?: 'GET' | 'POST' | 'PUT';
      body?: string;
    };
    slack?: {
      webhookUrl: string;
      channel?: string;
      username?: string;
      icon?: string;
    };
    discord?: {
      webhookUrl: string;
      username?: string;
      avatar?: string;
    };
    telegram?: {
      botToken: string;
      chatId: string;
    };
    sms?: {
      phoneNumbers: string[];
      provider?: 'twilio' | 'aws_sns' | 'custom';
    };
    teams?: {
      webhookUrl: string;
      title?: string;
    };
    whatsapp?: {
      phoneNumbers: string[];
      apiKey?: string;
    };
    pagerduty?: {
      apiKey: string;
      serviceId: string;
    };
    opsgenie?: {
      apiKey: string;
      teamId?: string;
    };
  };
  
  // Enhanced notification features
  escalationPolicy?: EscalationPolicy;
  quietHours?: QuietHoursConfig;
  maintenanceWindows?: MaintenanceWindow[];
  autoRemediation?: AutoRemediationConfig;
}

export interface EscalationPolicy {
  enabled: boolean;
  levels: EscalationLevel[];
  maxEscalations: number;
}

export interface EscalationLevel {
  level: number;
  delay: number; // minutes
  notifications: NotificationConfig[];
  actions: string[];
}

export interface QuietHoursConfig {
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
  daysOfWeek: number[]; // 0-6
  exceptions: string[]; // incident IDs that should alert anyway
}

export interface MaintenanceWindow {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  affectedMonitors: string[];
  notifications: boolean;
}

export interface AutoRemediationConfig {
  enabled: boolean;
  actions: AutoRemediationAction[];
  maxAttempts: number;
  cooldownPeriod: number; // minutes
}

export interface AutoRemediationAction {
  type: 'webhook' | 'restart_service' | 'rollback_deployment' | 'scale_up' | 'failover' | 'custom_script';
  name: string;
  description: string;
  config: Record<string, any>;
  conditions: {
    incidentSeverity: ('low' | 'medium' | 'high' | 'critical')[];
    timeOfDay?: {
      start: string;
      end: string;
    };
    maxAttempts: number;
  };
}

// ============================
// 📊 ENHANCED REPORTING
// ============================

export interface LiveIncidentMap {
  regions: {
    regionId: string;
    regionName: string;
    coordinates: { lat: number; lng: number };
    status: 'up' | 'down' | 'degraded';
    incidents: Incident[];
    lastCheck: Date;
  }[];
  globalStatus: 'operational' | 'degraded' | 'outage';
  totalIncidents: number;
  lastUpdated: Date;
}

export interface DetailedUptimeReport {
  monitorId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  uptime: {
    total: number;
    '24h': number;
    '7d': number;
    '30d': number;
  };
  downtime: {
    total: number;
    incidents: number;
    scheduled: number;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    timeSeries: PerformanceDataPoint[];
  };
  incidents: Incident[];
  mttr: number; // Mean Time To Recovery in minutes
  mtbf: number; // Mean Time Between Failures in minutes
}

export interface PerformanceDataPoint {
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  regionId?: string;
  protocol?: string;
}

export interface PublicStatusPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isPublic: boolean;
  customDomain?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
  };
  monitors: string[];
  incidents: Incident[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  userId?: string;
  monitorId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================
// 📈 ENHANCED SUMMARY & STATS
// ============================

export interface MonitorSummary {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  avgResponseTime: number;
  activeIncidents: number;
  uptime: string;
  
  // Enhanced metrics
  regionalStats: RegionalStats[];
  protocolStats: ProtocolStats[];
  slaCompliance: SLACompliance;
  anomalyAlerts: number;
  autoRemediations: number;
}

export interface RegionalStats {
  regionId: string;
  regionName: string;
  monitors: number;
  upMonitors: number;
  downMonitors: number;
  avgResponseTime: number;
  uptime: number;
}

export interface ProtocolStats {
  protocol: string;
  monitors: number;
  upMonitors: number;
  downMonitors: number;
  avgResponseTime: number;
  uptime: number;
}

export interface SLACompliance {
  target: number;
  actual: number;
  compliance: number;
  violations: number;
  penalties: number;
}

export interface MonitorStats {
  monitor: Monitor;
  stats: {
    uptime: {
      '24h': number;
      '7d': number;
      '30d': number;
    };
    average_response_time: number;
    total_checks: number;
    current_incident?: Incident;
    
    // Enhanced stats
    regional_performance: RegionalPerformance[];
    protocol_performance: ProtocolPerformance[];
    anomaly_history: AnomalyRecord[];
    sla_metrics: SLAMetrics;
  };
}

export interface RegionalPerformance {
  regionId: string;
  regionName: string;
  uptime: number;
  avgResponseTime: number;
  totalChecks: number;
  lastCheck: Date;
}

export interface ProtocolPerformance {
  protocol: string;
  uptime: number;
  avgResponseTime: number;
  totalChecks: number;
  lastCheck: Date;
}

export interface AnomalyRecord {
  timestamp: Date;
  type: 'response_time' | 'error_rate' | 'status_code' | 'content_change';
  severity: 'low' | 'medium' | 'high';
  score: number;
  description: string;
  resolved: boolean;
}

export interface SLAMetrics {
  targetUptime: number;
  actualUptime: number;
  compliance: number;
  violations: number;
  lastViolation?: Date;
}

// ============================
// 📄 STATUS PAGE INTERFACES
// ============================

export interface StatusPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isPublic: boolean;
  monitors: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================
// 🧪 TESTING INTERFACES
// ============================

export interface TestResult {
  id: string;
  monitorId: string;
  status: boolean;
  responseTime: number;
  message: string;
  createdAt: Date;
  statusCode?: number;
  error?: string;
}

// ============================
// 📝 REQUEST/RESPONSE INTERFACES
// ============================

export interface CreateMonitorRequest {
  name: string;
  url: string;
  type: 'http' | 'ping' | 'port' | 'ssl' | 'pagespeed' | 'hardware' | 'docker';
  interval?: number;
  timeout?: number;
  retries?: number;
  tags?: string[];
  notifications?: NotificationConfig[];
  threshold?: {
    responseTime: number;
    statusCode: number;
  };
  description?: string;
  isActive?: boolean;
  expectedStatusCode?: number;
  retryInterval?: number;
}

export interface UpdateMonitorRequest {
  name?: string;
  url?: string;
  type?: 'http' | 'ping' | 'port' | 'ssl' | 'pagespeed' | 'hardware' | 'docker';
  status?: boolean;
  interval?: number;
  timeout?: number;
  retries?: number;
  tags?: string[];
  notifications?: NotificationConfig[];
  threshold?: {
    responseTime: number;
    statusCode: number;
  };
}

export interface BulkUpdateRequest {
  action: 'pause' | 'resume' | 'delete';
  monitorIds: string[];
}

export interface BulkUpdateResponse {
  action: string;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// ============================
// 🔍 MONITOR TYPES & NOTIFICATION TYPES
// ============================

export interface MonitorType {
  type: 'http' | 'ping' | 'port' | 'ssl' | 'pagespeed' | 'hardware' | 'docker';
  label: string;
  description: string;
}

export interface NotificationType {
  type: 'email' | 'webhook' | 'slack' | 'discord' | 'telegram' | 'sms';
  label: string;
  description: string;
}

// ============================
// 📊 LEGACY INTERFACES (for backward compatibility)
// ============================

export interface SSLInfo {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: Date;
  validTo?: Date;
  daysUntilExpiry?: number;
  protocol?: string;
  cipher?: string;
  serial_number?: string;
  signature_algorithm?: string;
  san_domains?: string[];
  is_valid?: boolean;
  expires_at?: string;
  days_until_expiry?: number;
  is_self_signed?: boolean;
}

export interface SSLAlert {
  days_before_expiry: number;
  check_chain: boolean;
  alert_on_self_signed: boolean;
  alert_on_invalid: boolean;
}

export interface AlertConfig {
  email?: {
    enabled: boolean;
    addresses: string[];
  };
  webhook?: {
    enabled: boolean;
    url: string;
    headers?: Record<string, string>;
  };
  threshold?: {
    responseTime: number; // ms
    uptime: number; // percentage
  };
  ssl_alerts?: SSLAlert;
}

export interface UptimeLog {
  id: string;
  monitorId: string;
  timestamp: Date;
  status: 'up' | 'down' | 'unknown';
  responseTime?: number;
  httpStatus?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSLInfoResponse {
  ssl_monitoring_enabled: boolean;
  ssl_info?: SSLInfo;
  last_checked?: string;
  monitor_ssl_status?: string;
  ssl_cert_expires_at?: string;
  ssl_cert_days_until_expiry?: number;
  ssl_cert_issuer?: string;
  message?: string;
} 
