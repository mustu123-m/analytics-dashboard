const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const C = { credentials: 'include' as RequestInit['credentials'] };
const J: RequestInit = { ...C, headers: { 'Content-Type': 'application/json' } };

const check = async (res: Response) => {
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Request failed'); }
  return res.json();
};

// Upload
export const uploadFile = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return check(await fetch(`${BASE}/api/upload`, { method: 'POST', ...C, body: form }));
};
export const listDatasets = async () => check(await fetch(`${BASE}/api/upload`, C));
export const getDataset = async (id: string) => check(await fetch(`${BASE}/api/upload/${id}`, C));
export const deleteDataset = async (id: string) => check(await fetch(`${BASE}/api/upload/${id}`, { method: 'DELETE', ...C }));

// Analytics
export const getKPIs = async (id: string) => check(await fetch(`${BASE}/api/analytics/${id}/kpis`, C));
export const getChartData = async (id: string, col: string) => check(await fetch(`${BASE}/api/analytics/${id}/chart/${encodeURIComponent(col)}`, C));
export const getScatterData = async (id: string, x: string, y: string) => check(await fetch(`${BASE}/api/analytics/${id}/scatter?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`, C));
export const getCorrelation = async (id: string) => check(await fetch(`${BASE}/api/analytics/${id}/correlation`, C));

// AI
export const getAIInsights = async (id: string) => check(await fetch(`${BASE}/api/ai/insights/${id}`, { method: 'POST', ...C }));
export const chatWithData = async (id: string, message: string, history: any[]) =>
  check(await fetch(`${BASE}/api/ai/chat/${id}`, { method: 'POST', ...J, body: JSON.stringify({ message, history }) }));

// Auth
export const login = async (email: string, password: string) =>
  check(await fetch(`${BASE}/api/auth/login`, { method: 'POST', ...J, body: JSON.stringify({ email, password }) }));
export const register = async (name: string, email: string, password: string) =>
  check(await fetch(`${BASE}/api/auth/register`, { method: 'POST', ...J, body: JSON.stringify({ name, email, password }) }));
export const logout = async () => fetch(`${BASE}/api/auth/logout`, { method: 'POST', ...C });
export const getMe = async () => check(await fetch(`${BASE}/api/auth/me`, C));

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';
