import { API_CONFIG, MONITORING_CONFIG, STATUS_COLORS, SEVERITY_COLORS } from '../lib/config';

// Retry mechanism for API calls
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry on client errors (4xx)
      if (error.message?.includes('4')) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Format response time for display
export const formatResponseTime = (time: number): string => {
  if (time < 1000) return `${time}ms`;
  if (time < 60000) return `${(time / 1000).toFixed(1)}s`;
  return `${(time / 60000).toFixed(1)}m`;
};

// Format uptime percentage
export const formatUptime = (uptime: number): string => {
  return `${uptime.toFixed(2)}%`;
};

// Format last check time
export const formatLastCheck = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

// Get status color
export const getStatusColor = (status: string): string => {
  const statusKey = status.toLowerCase() as keyof typeof STATUS_COLORS;
  return STATUS_COLORS[statusKey]?.bg || STATUS_COLORS.unknown.bg;
};

// Get severity color
export const getSeverityColor = (severity: string): string => {
  const severityKey = severity.toLowerCase() as keyof typeof SEVERITY_COLORS;
  return SEVERITY_COLORS[severityKey]?.bg || SEVERITY_COLORS.low.bg;
};

// Validate monitor configuration
export const validateMonitorConfig = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.name?.trim()) {
    errors.push('Monitor name is required');
  }
  
  if (!config.url?.trim()) {
    errors.push('URL is required');
  }
  
  if (config.type === 'http' || config.type === 'ssl') {
    try {
      new URL(config.url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }
  
  if (config.interval && (config.interval < 1 || config.interval > 1440)) {
    errors.push('Check interval must be between 1 minute and 24 hours');
  }
  
  if (config.timeout && (config.timeout < 1 || config.timeout > 300)) {
    errors.push('Timeout must be between 1 and 300 seconds');
  }
  
  if (config.retries && (config.retries < 0 || config.retries > 10)) {
    errors.push('Retries must be between 0 and 10');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Calculate monitor health score
export const calculateHealthScore = (monitor: any): number => {
  let score = 100;
  
  // Deduct points for downtime
  if (monitor.uptime < 99.9) score -= 20;
  if (monitor.uptime < 99) score -= 40;
  if (monitor.uptime < 95) score -= 60;
  
  // Deduct points for slow response time
  if (monitor.responseTime > MONITORING_CONFIG.MAX_RESPONSE_TIME) {
    score -= 30;
  } else if (monitor.responseTime > 5000) {
    score -= 15;
  }
  
  // Deduct points for SSL issues
  if (monitor.sslInfo && !monitor.sslInfo.valid) {
    score -= 50;
  } else if (monitor.sslInfo && monitor.sslInfo.daysUntilExpiry < MONITORING_CONFIG.SSL_WARNING_DAYS) {
    score -= 10;
  }
  
  return Math.max(0, score);
};

// Get health status based on score
export const getHealthStatus = (score: number): { status: string; color: string; label: string } => {
  if (score >= 90) {
    return { status: 'excellent', color: STATUS_COLORS.up.bg, label: 'Excellent' };
  } else if (score >= 75) {
    return { status: 'good', color: STATUS_COLORS.up.bg, label: 'Good' };
  } else if (score >= 50) {
    return { status: 'fair', color: STATUS_COLORS.unknown.bg, label: 'Fair' };
  } else {
    return { status: 'poor', color: STATUS_COLORS.down.bg, label: 'Poor' };
  }
};

// Generate monitor tags suggestions
export const getTagSuggestions = (): string[] => {
  return [
    'production',
    'staging',
    'development',
    'critical',
    'important',
    'low-priority',
    'api',
    'website',
    'database',
    'cdn',
    'load-balancer',
    'backup',
    'monitoring',
    'ssl',
    'dns'
  ];
};

// Copy text to clipboard with fallback
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}; 