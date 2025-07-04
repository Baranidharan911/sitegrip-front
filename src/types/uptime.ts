export interface SSLInfo {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: Date;
  validTo?: Date;
  daysUntilExpiry?: number;
  protocol?: string;
  cipher?: string;
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

export interface Monitor {
  id: string;
  url: string;
  name?: string;
  userId: string;
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
  lastChecked?: Date;
  status: 'up' | 'down' | 'unknown';
  responseTime?: number;
  httpStatus?: number;
  failedChecks?: number;
  uptimeStats: {
    '24h': number;
    '7d': number;
    '30d': number;
  };
  alerts?: AlertConfig;
  isPublic: boolean;
  sslMonitoringEnabled: boolean;
  sslInfo?: SSLInfo;
  type?: 'http' | 'https' | 'tcp' | 'ping';
  expectedStatus?: number;
  timeout?: number;
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

export interface Incident {
  id: string;
  monitorId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'resolved';
  errorMessage: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
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

export interface CreateMonitorRequest {
  url: string;
  name?: string;
  frequency: number;
  alerts?: AlertConfig;
  isPublic: boolean;
  sslMonitoringEnabled: boolean;
  type?: 'http' | 'https' | 'tcp' | 'ping';
  expectedStatus?: number;
  timeout?: number;
}

export interface UpdateMonitorRequest {
  name?: string;
  frequency?: number;
  alerts?: AlertConfig;
  isPublic?: boolean;
  sslMonitoringEnabled?: boolean;
} 
