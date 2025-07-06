// ============================
// 🔧 API CONFIGURATION
// ============================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ============================
// 📊 MONITORING CONFIGURATION
// ============================

export const MONITORING_CONFIG = {
  DEFAULT_INTERVAL: 60, // seconds
  DEFAULT_TIMEOUT: 10, // seconds
  DEFAULT_RETRIES: 3,
  MAX_RESPONSE_TIME: 5000, // ms
  SSL_WARNING_DAYS: 30,
  UPTIME_THRESHOLD: 99.9, // percentage
  MAX_FAILURES_IN_A_ROW: 3,
};

// ============================
// 🎨 STATUS COLORS
// ============================

export const STATUS_COLORS = {
  up: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    dark: {
      bg: 'dark:bg-green-900',
      text: 'dark:text-green-200',
      border: 'dark:border-green-700',
    },
  },
  down: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dark: {
      bg: 'dark:bg-red-900',
      text: 'dark:text-red-200',
      border: 'dark:border-red-700',
    },
  },
  unknown: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    dark: {
      bg: 'dark:bg-gray-900',
      text: 'dark:text-gray-200',
      border: 'dark:border-gray-700',
    },
  },
  paused: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dark: {
      bg: 'dark:bg-yellow-900',
      text: 'dark:text-yellow-200',
      border: 'dark:border-yellow-700',
    },
  },
};

// ============================
// ⚠️ SEVERITY COLORS
// ============================

export const SEVERITY_COLORS = {
  low: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dark: {
      bg: 'dark:bg-blue-900',
      text: 'dark:text-blue-200',
      border: 'dark:border-blue-700',
    },
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dark: {
      bg: 'dark:bg-yellow-900',
      text: 'dark:text-yellow-200',
      border: 'dark:border-yellow-700',
    },
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dark: {
      bg: 'dark:bg-orange-900',
      text: 'dark:text-orange-200',
      border: 'dark:border-orange-700',
    },
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dark: {
      bg: 'dark:bg-red-900',
      text: 'dark:text-red-200',
      border: 'dark:border-red-700',
    },
  },
}; 