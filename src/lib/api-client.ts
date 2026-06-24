const API_BASE = '/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ── Employees ──
  getEmployees: () => fetchAPI<any[]>('/employees'),
  getEmployee: (id: string) => fetchAPI<any>(`/employees/${id}`),
  createEmployee: (data: any) => fetchAPI<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id: string, data: any) => fetchAPI<any>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (id: string) => fetchAPI<void>(`/employees/${id}`, { method: 'DELETE' }),

  // ── Leave Requests ──
  getLeaveRequests: () => fetchAPI<any[]>('/leave-requests'),
  getLeaveRequest: (id: string) => fetchAPI<any>(`/leave-requests/${id}`),
  createLeaveRequest: (data: any) => fetchAPI<any>('/leave-requests', { method: 'POST', body: JSON.stringify(data) }),
  updateLeaveRequestStatus: (id: string, data: { status: string; approvedBy?: string; reviewNote?: string }) =>
    fetchAPI<any>(`/leave-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Users ──
  getUsers: () => fetchAPI<any[]>('/users'),
  getUser: (id: string) => fetchAPI<any>(`/users/${id}`),
  createUser: (data: any) => fetchAPI<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => fetchAPI<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => fetchAPI<void>(`/users/${id}`, { method: 'DELETE' }),

  // ── Holidays ──
  getHolidays: () => fetchAPI<any[]>('/holidays'),
  createHoliday: (data: any) => fetchAPI<any>('/holidays', { method: 'POST', body: JSON.stringify(data) }),
  deleteHoliday: (id: string) => fetchAPI<void>(`/holidays/${id}`, { method: 'DELETE' }),

  // ── Leave Quotas ──
  getLeaveQuotas: (employeeId?: string) => fetchAPI<any[]>(`/leave-quotas${employeeId ? `?employeeId=${employeeId}` : ''}`),

  // ── Audit Logs ──
  getAuditLogs: () => fetchAPI<any[]>('/audit-logs'),
  createAuditLog: (data: any) => fetchAPI<any>('/audit-logs', { method: 'POST', body: JSON.stringify(data) }),

  // ── Auth ──
  login: (username: string, password: string) =>
    fetchAPI<any>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // ── Dashboard ──
  getDashboardStats: () => fetchAPI<any>('/dashboard'),

  // ── DB Setup ──
  setupDatabase: () => fetchAPI<any>('/db/setup', { method: 'POST' }),
};
