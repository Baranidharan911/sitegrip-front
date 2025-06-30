export interface SSLInfo {
  is_valid: boolean;
  expires_at?: string;
  issued_at?: string;
  days_until_expiry?: number;
  issuer?: string;
  subject?: string;
  serial_number?: string;
  signature_algorithm?: string;
  version?: number;
  san_domains?: string[];
  is_self_signed: boolean;
  is_expired: boolean;
  is_expiring_soon: boolean;
  chain_valid: boolean;
  error_message?: string;
}

export interface SSLAlert {
  days_before_expiry: number;
  check_chain: boolean;
  alert_on_self_signed: boolean;
  alert_on_invalid: boolean;
}

export interface AlertConfig {
  email?: string;
  webhook?: string;
  threshold: number;
  ssl_alerts?: SSLAlert;
}

export interface Monitor {
  id: string;
  url: string;
  name?: string;
  frequency: number;
  created_at: string;
  last_checked?: string;
  last_status?: 'up' | 'down';
  last_response_time?: number;
  http_status?: number;
  failures_in_a_row: number;
  uptime_stats: {
    '24h': number;
    '7d': number;
    '30d': number;
  };
  alerts?: AlertConfig;
  is_public: boolean;
  ssl_monitoring_enabled: boolean;
  ssl_cert_expires_at?: string;
  ssl_cert_issuer?: string;
  ssl_cert_days_until_expiry?: number;
  ssl_status?: 'valid' | 'expired' | 'expiring_soon' | 'invalid';
  ssl_last_checked?: string;
}

export interface UptimeLog {
  timestamp: string;
  status: 'up' | 'down';
  response_time?: number;
  http_status?: number;
  error?: string;
  ssl_info?: SSLInfo;
}

export interface Incident {
  monitor_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  reason?: string;
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
  is_public: boolean;
  ssl_monitoring_enabled: boolean;
}

export interface UpdateMonitorRequest {
  name?: string;
  frequency?: number;
  alerts?: AlertConfig;
  is_public?: boolean;
  ssl_monitoring_enabled?: boolean;
} 
