// ============================
// 🔧 MONITOR INTERFACES
// ============================

export interface Monitor {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'ping' | 'port' | 'ssl' | 'pagespeed' | 'hardware' | 'docker';
  status: boolean;
  interval: number; // in seconds
  timeout: number; // in seconds
  retries: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastCheck?: Date;
  lastResponseTime?: number;
  lastStatusCode?: number;
  uptime?: number;
  downtime?: number;
  tags?: string[];
  notifications?: NotificationConfig[];
  threshold?: {
    responseTime: number;
    statusCode: number;
  };
  // Additional properties for incident management
  last_status?: 'up' | 'down';
  failures_in_a_row?: number;
  ssl_status?: 'valid' | 'expired' | 'expiring_soon' | 'invalid';
  ssl_monitoring_enabled?: boolean;
  ssl_cert_expires_at?: string;
  ssl_cert_issuer?: string;
  ssl_cert_days_until_expiry?: number;
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
// 🔍 CHECK RESULT INTERFACES
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
}

// ============================
// ⚠️ INCIDENT INTERFACES
// ============================

export interface Incident {
  id: string;
  monitorId: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'acknowledged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  resolvedBy?: string;
  notes?: string[];
}

// ============================
// 📊 SUMMARY & STATS INTERFACES
// ============================

export interface MonitorSummary {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  avgResponseTime: number;
  activeIncidents: number;
  uptime: string;
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
  };
}

// ============================
// 🔔 NOTIFICATION INTERFACES
// ============================

export interface NotificationConfig {
  type: 'email' | 'webhook' | 'slack' | 'discord' | 'telegram' | 'sms';
  enabled: boolean;
  config: {
    email?: {
      addresses: string[];
    };
    webhook?: {
      url: string;
      headers?: Record<string, string>;
    };
    slack?: {
      webhookUrl: string;
      channel?: string;
    };
    discord?: {
      webhookUrl: string;
    };
    telegram?: {
      botToken: string;
      chatId: string;
    };
    sms?: {
      phoneNumbers: string[];
    };
  };
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
