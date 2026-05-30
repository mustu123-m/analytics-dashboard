const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('dp_token') : null;

const authHeaders = (): HeadersInit => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const check = async (res: Response) => {
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Request failed'); }
  return res.json();
};

// Upload
export const uploadFile = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return check(await fetch(`${BASE}/api/upload`, { method: 'POST', headers: authHeaders(), body: form }));
};
export const listDatasets = async () => check(await fetch(`${BASE}/api/upload`, { headers: authHeaders() }));
export const getDataset = async (id: string) => check(await fetch(`${BASE}/api/upload/${id}`, { headers: authHeaders() }));
export const deleteDataset = async (id: string) => check(await fetch(`${BASE}/api/upload/${id}`, { method: 'DELETE', headers: authHeaders() }));

// Analytics
export const getKPIs = async (id: string) => check(await fetch(`${BASE}/api/analytics/${id}/kpis`, { headers: authHeaders() }));
export const getChartData = async (id: string, col: string) => check(await fetch(`${BASE}/api/analytics/${id}/chart/${encodeURIComponent(col)}`, { headers: authHeaders() }));
export const getScatterData = async (id: string, x: string, y: string) => check(await fetch(`${BASE}/api/analytics/${id}/scatter?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`, { headers: authHeaders() }));
export const getCorrelation = async (id: string) => check(await fetch(`${BASE}/api/analytics/${id}/correlation`, { headers: authHeaders() }));

// AI
export const getAIInsights = async (id: string) => check(await fetch(`${BASE}/api/ai/insights/${id}`, { method: 'POST', headers: authHeaders() }));
export const chatWithData = async (id: string, message: string, history: any[]) =>
  check(await fetch(`${BASE}/api/ai/chat/${id}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  }));

// Auth — store/clear token in localStorage
export const login = async (email: string, password: string) => {
  const data = await check(await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));
  localStorage.setItem('dp_token', data.token);
  return data;
};

export const register = async (name: string, email: string, password: string) => {
  const data = await check(await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }));
  localStorage.setItem('dp_token', data.token);
  return data;
};

export const logout = async () => {
  localStorage.removeItem('dp_token');
  await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: authHeaders() });
};

export const getMe = async () => {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  return check(await fetch(`${BASE}/api/auth/me`, { headers: authHeaders() }));
};

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';
export { getToken };