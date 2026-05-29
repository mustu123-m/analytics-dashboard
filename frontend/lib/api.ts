const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function uploadFile(file: File, onProgress?: (p: number) => void) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
  return res.json();
}

export async function listDatasets() {
  const res = await fetch(`${BASE}/api/upload`);
  if (!res.ok) throw new Error('Failed to list datasets');
  return res.json();
}

export async function getDataset(fileId: string) {
  const res = await fetch(`${BASE}/api/upload/${fileId}`);
  if (!res.ok) throw new Error('Dataset not found');
  return res.json();
}

export async function deleteDataset(fileId: string) {
  const res = await fetch(`${BASE}/api/upload/${fileId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

export async function getKPIs(fileId: string) {
  const res = await fetch(`${BASE}/api/analytics/${fileId}/kpis`);
  if (!res.ok) throw new Error('Failed to get KPIs');
  return res.json();
}

export async function getChartData(fileId: string, columnName: string) {
  const res = await fetch(`${BASE}/api/analytics/${fileId}/chart/${encodeURIComponent(columnName)}`);
  if (!res.ok) throw new Error('Failed to get chart data');
  return res.json();
}

export async function getScatterData(fileId: string, x: string, y: string) {
  const res = await fetch(`${BASE}/api/analytics/${fileId}/scatter?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`);
  if (!res.ok) throw new Error('Failed to get scatter data');
  return res.json();
}

export async function getCorrelation(fileId: string) {
  const res = await fetch(`${BASE}/api/analytics/${fileId}/correlation`);
  if (!res.ok) throw new Error('Failed to get correlation');
  return res.json();
}

export async function getAIInsights(fileId: string) {
  const res = await fetch(`${BASE}/api/ai/insights/${fileId}`, { method: 'POST' });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
  return res.json();
}

export async function chatWithData(fileId: string, message: string, history: any[]) {
  const res = await fetch(`${BASE}/api/ai/chat/${fileId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
  return res.json();
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';
