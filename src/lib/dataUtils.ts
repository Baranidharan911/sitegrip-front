// ============================
// 🔧 DATA NORMALIZATION UTILITIES
// ============================

import { QuotaInfo, IndexingStats } from '@/types/indexing';

/**
 * Normalizes quota info from backend to ensure consistent property access
 * Handles both snake_case (backend) and camelCase (frontend) property names
 */
export function normalizeQuotaInfo(backendQuota: any): QuotaInfo {
  if (!backendQuota) {
    return {
      id: '',
      domain: '',
      user_id: '',
      date: new Date().toISOString(),
      daily_limit: 10, // Default to free tier
      priority_reserve: 5,
      total_used: 0,
      low_priority_used: 0,
      medium_priority_used: 0,
      high_priority_used: 0,
      critical_priority_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      remaining_quota: 10,
      priority_remaining: 5,
      can_submit_priority: true,
      can_submit_regular: true,
      // Legacy camelCase fields
      dailyLimit: 10,
      priorityReserve: 5,
      totalUsed: 0,
      highPriorityUsed: 0,
      criticalPriorityUsed: 0,
      remainingQuota: 10,
      priorityRemaining: 5,
      canSubmitPriority: true,
      canSubmitRegular: true,
      dailyUsed: 0,
      dailyRemaining: 10,
    };
  }

  // Extract values, preferring snake_case (backend) over camelCase
  const dailyLimit = backendQuota.daily_limit ?? backendQuota.dailyLimit ?? backendQuota.limit ?? 10;
  const totalUsed = backendQuota.total_used ?? backendQuota.totalUsed ?? backendQuota.used ?? 0;
  const dailyUsed = backendQuota.daily_used ?? backendQuota.dailyUsed ?? totalUsed;
  const priorityReserve = backendQuota.priority_reserve ?? backendQuota.priorityReserve ?? Math.floor(dailyLimit * 0.1);
  const remainingQuota = Math.max(0, dailyLimit - totalUsed);
  const priorityRemaining = Math.max(0, priorityReserve - (backendQuota.high_priority_used ?? backendQuota.highPriorityUsed ?? 0));

  return {
    id: backendQuota.id ?? '',
    domain: backendQuota.domain ?? '',
    user_id: backendQuota.user_id ?? backendQuota.userId ?? '',
    date: backendQuota.date ?? new Date().toISOString(),
    
    // Core quota fields - snake_case
    daily_limit: dailyLimit,
    priority_reserve: priorityReserve,
    total_used: totalUsed,
    low_priority_used: backendQuota.low_priority_used ?? backendQuota.lowPriorityUsed ?? 0,
    medium_priority_used: backendQuota.medium_priority_used ?? backendQuota.mediumPriorityUsed ?? 0,
    high_priority_used: backendQuota.high_priority_used ?? backendQuota.highPriorityUsed ?? 0,
    critical_priority_used: backendQuota.critical_priority_used ?? backendQuota.criticalPriorityUsed ?? 0,
    
    created_at: backendQuota.created_at ?? backendQuota.createdAt ?? new Date().toISOString(),
    updated_at: backendQuota.updated_at ?? backendQuota.updatedAt ?? new Date().toISOString(),
    
    // Computed fields - snake_case
    remaining_quota: remainingQuota,
    priority_remaining: priorityRemaining,
    can_submit_priority: priorityRemaining > 0,
    can_submit_regular: remainingQuota > 0,
    
    // Legacy camelCase fields for backward compatibility
    dailyLimit,
    priorityReserve,
    totalUsed,
    highPriorityUsed: backendQuota.high_priority_used ?? backendQuota.highPriorityUsed ?? 0,
    criticalPriorityUsed: backendQuota.critical_priority_used ?? backendQuota.criticalPriorityUsed ?? 0,
    remainingQuota,
    priorityRemaining,
    canSubmitPriority: priorityRemaining > 0,
    canSubmitRegular: remainingQuota > 0,
    dailyUsed,
    dailyRemaining: remainingQuota,
    monthlyLimit: backendQuota.monthly_limit ?? backendQuota.monthlyLimit,
    monthlyUsed: backendQuota.monthly_used ?? backendQuota.monthlyUsed,
    monthlyRemaining: backendQuota.monthly_remaining ?? backendQuota.monthlyRemaining,
    resetTime: backendQuota.reset_time ?? backendQuota.resetTime ?? backendQuota.resetAt,
    isPremium: dailyLimit > 10, // Free tier is 10, anything higher is premium
  };
}

/**
 * Normalizes indexing statistics from backend
 */
export function normalizeIndexingStats(backendStats: any): IndexingStats {
  if (!backendStats) {
    return {
      total_submitted: 0,
      pending: 0,
      success: 0,
      failed: 0,
      quota_used: 0,
      quota_remaining: 0,
      success_rate: 0,
      // Legacy fields
      totalUrlsSubmitted: 0,
      totalUrlsIndexed: 0,
      totalUrlsNotIndexed: 0,
      totalUrlsPending: 0,
      totalUrlsError: 0,
      indexingSuccessRate: 0,
      averageIndexingTime: 0,
      quotaUsed: 0,
      quotaLimit: 0,
      remainingQuota: 0,
      lastUpdated: new Date().toISOString(),
      dailySubmissions: 0,
      weeklySubmissions: 0,
      monthlySubmissions: 0,
    };
  }

  const totalSubmitted = backendStats.total_submitted ?? backendStats.totalUrlsSubmitted ?? 0;
  const success = backendStats.success ?? backendStats.totalUrlsIndexed ?? 0;
  const failed = backendStats.failed ?? backendStats.totalUrlsError ?? 0;
  const pending = backendStats.pending ?? backendStats.totalUrlsPending ?? 0;
  const successRate = backendStats.success_rate ?? backendStats.indexingSuccessRate ?? 0;

  return {
    // Snake case (primary)
    total_submitted: totalSubmitted,
    pending,
    success,
    failed,
    quota_used: backendStats.quota_used ?? backendStats.quotaUsed ?? 0,
    quota_remaining: backendStats.quota_remaining ?? backendStats.remainingQuota ?? 0,
    success_rate: successRate,
    
    // Legacy camelCase fields for backward compatibility
    totalUrlsSubmitted: totalSubmitted,
    totalUrlsIndexed: success,
    totalUrlsNotIndexed: backendStats.totalUrlsNotIndexed ?? 0,
    totalUrlsPending: pending,
    totalUrlsError: failed,
    indexingSuccessRate: successRate,
    averageIndexingTime: backendStats.averageIndexingTime ?? 0,
    quotaUsed: backendStats.quota_used ?? backendStats.quotaUsed ?? 0,
    quotaLimit: backendStats.quota_limit ?? backendStats.quotaLimit ?? 0,
    remainingQuota: backendStats.quota_remaining ?? backendStats.remainingQuota ?? 0,
    lastUpdated: backendStats.last_updated ?? backendStats.lastUpdated ?? new Date().toISOString(),
    dailySubmissions: backendStats.daily_submissions ?? backendStats.dailySubmissions ?? totalSubmitted,
    weeklySubmissions: backendStats.weekly_submissions ?? backendStats.weeklySubmissions ?? totalSubmitted,
    monthlySubmissions: backendStats.monthly_submissions ?? backendStats.monthlySubmissions ?? totalSubmitted,
    totalSuccess: success,
    totalFailed: failed,
    totalRetrying: backendStats.total_retrying ?? backendStats.totalRetrying ?? 0,
    quotaExceeded: backendStats.quota_exceeded ?? backendStats.quotaExceeded ?? 0,
  };
}

/**
 * Get tier display name and limits based on quota
 */
export function getTierInfo(dailyLimit: number): { tierName: string; tierLevel: string; features: string[] } {
  if (dailyLimit <= 10) {
    return {
      tierName: 'Free',
      tierLevel: 'free',
      features: ['10 URLs/day', 'Basic crawling', 'Testing only']
    };
  } else if (dailyLimit <= 50) {
    return {
      tierName: 'Basic',
      tierLevel: 'basic',
      features: ['50 URLs/day', 'Basic crawling', 'Email support']
    };
  } else if (dailyLimit <= 100) {
    return {
      tierName: 'Professional',
      tierLevel: 'professional',
      features: ['100 URLs/day', 'Advanced crawling', 'Priority support']
    };
  } else if (dailyLimit <= 150) {
    return {
      tierName: 'Advanced',
      tierLevel: 'advanced',
      features: ['150 URLs/day', 'Unlimited crawling', 'Priority support']
    };
  } else if (dailyLimit <= 200) {
    return {
      tierName: 'Premium',
      tierLevel: 'premium',
      features: ['200 URLs/day', 'Unlimited crawling', 'Premium support']
    };
  } else if (dailyLimit <= 500) {
    return {
      tierName: 'Custom 500',
      tierLevel: 'custom_500',
      features: ['500 URLs/day', 'Unlimited crawling', 'Dedicated support']
    };
  } else if (dailyLimit <= 1000) {
    return {
      tierName: 'Custom 1000',
      tierLevel: 'custom_1000',
      features: ['1000 URLs/day', 'Unlimited crawling', 'Dedicated support']
    };
  } else if (dailyLimit <= 2000) {
    return {
      tierName: 'Custom 2000',
      tierLevel: 'custom_2000',
      features: ['2000 URLs/day', 'Unlimited crawling', 'Dedicated support']
    };
  } else {
    return {
      tierName: 'Enterprise',
      tierLevel: 'enterprise',
      features: ['2000+ URLs/day', 'Custom solutions', 'Dedicated support team']
    };
  }
}

/**
 * Validate quota data integrity
 */
export function validateQuotaInfo(quota: QuotaInfo): boolean {
  return (
    quota.daily_limit > 0 &&
    quota.total_used >= 0 &&
    quota.total_used <= quota.daily_limit &&
    quota.remaining_quota >= 0
  );
}

/**
 * Calculate quota usage percentage
 */
export function getQuotaUsagePercentage(quota: QuotaInfo): number {
  if (quota.daily_limit <= 0) return 0;
  return Math.round((quota.total_used / quota.daily_limit) * 100);
}

/**
 * Get quota status color based on usage
 */
export function getQuotaStatusColor(quota: QuotaInfo): string {
  const percentage = getQuotaUsagePercentage(quota);
  if (percentage >= 90) return 'text-red-600 dark:text-red-400';
  if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

/**
 * Format quota display text
 */
export function formatQuotaDisplay(quota: QuotaInfo): string {
  const tierInfo = getTierInfo(quota.daily_limit);
  return `${quota.total_used}/${quota.daily_limit} URLs used (${tierInfo.tierName} tier)`;
} 