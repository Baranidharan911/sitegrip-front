// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_BASE_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Monitoring API Endpoints
export const MONITORING_ENDPOINTS = {
  MONITORS: '/monitoring/monitors',
  INCIDENTS: '/monitoring/incidents',
  PERFORMANCE: '/monitoring/performance',
  HEATMAP: '/monitoring/heatmap',
  STATS: '/monitoring/stats',
  ALERTS: '/monitoring/alerts',
  MAINTENANCE: '/monitoring/maintenance',
  TEAM: '/monitoring/team',
  STATUS_PAGE: '/monitoring/status-page',
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'WebWatch',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  DESCRIPTION: 'Advanced Website Monitoring & Uptime Tracking',
};

// Monitoring Configuration
export const MONITORING_CONFIG = {
  DEFAULT_INTERVAL: 5, // minutes
  DEFAULT_TIMEOUT: 30, // seconds
  DEFAULT_RETRIES: 3,
  MAX_MONITORS: 100,
  REFRESH_INTERVAL: 30000, // 30 seconds
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  TYPES: ['email', 'slack', 'discord', 'telegram', 'webhook'] as const,
  DEFAULT_CHANNELS: ['email'],
};

// Status Colors
export const STATUS_COLORS = {
  UP: '#10B981',
  DOWN: '#EF4444',
  PAUSED: '#F59E0B',
  MAINTENANCE: '#3B82F6',
  UNKNOWN: '#6B7280',
};

// Severity Colors
export const SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#D97706',
  LOW: '#2563EB',
}; 