import { Monitor, CreateMonitorRequest, UpdateMonitorRequest, CheckResult, MonitorType } from '@/types/uptime';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getAuthToken(): Promise<string | null> {
  try {
    const { getAuthInstance } = await import('./firebase');
    const auth = getAuthInstance();
    if (auth && auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch {}
    }
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('Sitegrip-user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const user = parsed.user || parsed;
        return user.idToken || user.token || null;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  } as Record<string, string>;
  return fetch(url, { ...options, headers });
}

export async function listMonitors(): Promise<Monitor[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors`);
  if (!res.ok) throw new Error('Failed to fetch monitors');
  const json = await res.json();
  return json.data || [];
}

export async function listMonitorsWithChecks(params: { page?: number; limit?: number; types?: MonitorType[]; status?: boolean; isActive?: boolean } = {}): Promise<any> {
  const q = new URLSearchParams();
  if (params.page !== undefined) q.set('page', String(params.page));
  if (params.limit !== undefined) q.set('limit', String(params.limit));
  if (params.types && params.types.length) q.set('types', params.types.join(','));
  if (params.status !== undefined) q.set('status', String(params.status));
  if (params.isActive !== undefined) q.set('isActive', String(params.isActive));
  const url = `${API_BASE_URL}/api/monitoring/monitors/with-checks${q.toString() ? `?${q.toString()}` : ''}`;
  const res = await fetchWithAuth(url);
  if (!res.ok) throw new Error('Failed to fetch monitors with checks');
  const json = await res.json();
  return json.data || [];
}

export async function getSummary(): Promise<any> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  const json = await res.json();
  return json.data;
}

export async function createMonitor(data: CreateMonitorRequest): Promise<Monitor> {
  const body = {
    ...data,
    // Backend expects milliseconds for interval/timeouts in its service; keep values if caller passes ms
    interval: data.interval && data.interval < 1000 ? data.interval * 1000 : data.interval,
    timeout: data.timeout && data.timeout < 1000 ? data.timeout * 1000 : data.timeout,
  } as any;
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create monitor');
  // Fetch full list to return shape, or just return created id; caller usually refreshes afterwards
  const json = await res.json();
  return { id: json.data?.id, name: data.name, url: data.url, type: data.type as any, status: true, interval: data.interval || 300, timeout: data.timeout || 30, retries: data.retries || 3, userId: '', createdAt: new Date(), updatedAt: new Date(), isActive: true } as unknown as Monitor;
}

export async function updateMonitor(id: string, data: UpdateMonitorRequest): Promise<void> {
  const body = {
    ...data,
    interval: data.interval && data.interval < 1000 ? data.interval * 1000 : data.interval,
    timeout: data.timeout && data.timeout < 1000 ? data.timeout * 1000 : data.timeout,
  } as any;
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update monitor');
}

export async function deleteMonitor(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete monitor');
}

export async function triggerCheck(id: string): Promise<CheckResult> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/${id}/check`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to perform monitor check');
  const json = await res.json();
  return json.data as CheckResult;
}

export async function bulkUpdate(action: 'pause' | 'resume' | 'delete', monitorIds: string[]) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/bulk`, {
    method: 'POST',
    body: JSON.stringify({ action, monitorIds }),
  });
  if (!res.ok) throw new Error('Failed to perform bulk update');
  return res.json();
}

export async function testEndpoint(url: string, type: string = 'http', timeout?: number) {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/test`, {
    method: 'POST',
    body: JSON.stringify({ url, type, timeout }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Test failed');
  return json.data;
}

/**
 * Check SSL status for a monitor
 */
export async function checkSSLStatus(monitorId: string): Promise<{
  ssl_status: 'valid' | 'expired' | 'expiring_soon' | 'invalid';
  ssl_cert_expires_at?: string;
  ssl_cert_days_until_expiry?: number;
  ssl_cert_issuer?: string;
  ssl_last_checked: string;
}> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/${monitorId}/ssl`);
  if (!res.ok) throw new Error('Failed to check SSL status');
  const json = await res.json();
  return json.data;
}

/**
 * Get monitor diagnostics
 */
export async function getMonitorDiagnostics(monitorId: string): Promise<any> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/${monitorId}/diagnostics`);
  if (!res.ok) throw new Error('Failed to get diagnostics');
  const json = await res.json();
  return json.data;
}

/**
 * Get monitor incidents
 */
export async function getMonitorIncidents(monitorId: string, limit: number = 20): Promise<any[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/${monitorId}/incidents?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to get incidents');
  const json = await res.json();
  return json.data || [];
}

/**
 * Get monitor checks/history
 */
export async function getMonitorChecks(monitorId: string, limit: number = 50): Promise<CheckResult[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/monitors/${monitorId}/checks?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to get checks');
  const json = await res.json();
  return json.data || [];
}

