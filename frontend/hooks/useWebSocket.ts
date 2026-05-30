'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL } from '@/lib/api';

export interface WSMessage { type: string; [key: string]: any; }

export function useWebSocket(token?: string) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const listeners = useRef<Set<(msg: WSMessage) => void>>(new Set());

  useEffect(() => {
    const connect = () => {
      try {
        // Pass token as query param for WS auth
        const url = token ? `${WS_URL}?token=${token}` : WS_URL;
        ws.current = new WebSocket(url);
        ws.current.onopen = () => setConnected(true);
        ws.current.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data) as WSMessage;
            setLastMessage(msg);
            listeners.current.forEach(fn => fn(msg));
          } catch {}
        };
        ws.current.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
        ws.current.onerror = () => ws.current?.close();
      } catch { setTimeout(connect, 3000); }
    };
    connect();
    return () => ws.current?.close();
  }, [token]);

  const subscribe = useCallback((fn: (msg: WSMessage) => void) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  return { connected, lastMessage, subscribe };
}
