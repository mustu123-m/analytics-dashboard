'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL, getToken } from '@/lib/api';

export interface WSMessage { type: string; [key: string]: any; }

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const listeners = useRef<Set<(msg: WSMessage) => void>>(new Set());
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;

    const connect = () => {
      if (unmounted.current) return;
      try {
        // Pass token as query param for WS auth
        const token = getToken();
        const url = token ? `${WS_URL}?token=${token}` : WS_URL;
        const socket = new WebSocket(url);
        ws.current = socket;

        socket.onopen = () => {
          if (unmounted.current) { socket.close(); return; }
          setConnected(true);
          retryCount.current = 0;
        };

        socket.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data) as WSMessage;
            listeners.current.forEach(fn => fn(msg));
          } catch {}
        };

        socket.onclose = () => {
          if (unmounted.current) return;
          setConnected(false);
          ws.current = null;
          const delay = Math.min(2000 * Math.pow(2, retryCount.current), 30000);
          retryCount.current += 1;
          retryTimer.current = setTimeout(connect, delay);
        };

        socket.onerror = () => socket.close();
      } catch {
        if (!unmounted.current) {
          const delay = Math.min(2000 * Math.pow(2, retryCount.current), 30000);
          retryCount.current += 1;
          retryTimer.current = setTimeout(connect, delay);
        }
      }
    };

    connect();
    return () => {
      unmounted.current = true;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      ws.current?.close();
    };
  }, []);

  const subscribe = useCallback((fn: (msg: WSMessage) => void) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }, []);

  return { connected, subscribe };
}