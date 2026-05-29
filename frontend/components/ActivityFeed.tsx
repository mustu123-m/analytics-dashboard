'use client';
import { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, Loader2, Wifi } from 'lucide-react';

interface Props {
  subscribe: (fn: (msg: any) => void) => () => void;
  connected: boolean;
}

interface ActivityItem {
  id: number;
  type: string;
  message: string;
  time: string;
  progress?: number;
  status?: string;
}

export default function ActivityFeed({ subscribe, connected }: Props) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (msg.type === 'upload_status' || msg.type === 'connected') {
        const item: ActivityItem = {
          id: Date.now(),
          type: msg.type,
          message: msg.type === 'connected'
            ? 'Connected to server'
            : msg.fileName
              ? `${msg.fileName} — ${msg.status}`
              : `Status: ${msg.status}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          progress: msg.progress,
          status: msg.status,
        };
        setItems(prev => [item, ...prev].slice(0, 20));
        setOpen(true);
      }
    });
    return unsub;
  }, [subscribe]);

  return (
    <>
      {/* Mobile/compact toggle */}
      <div className="hidden xl:flex flex-col w-64 border-l flex-shrink-0"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Activity size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>ACTIVITY</span>
          <div className="ml-auto w-2 h-2 rounded-full" style={{ background: connected ? 'var(--success)' : 'var(--danger)' }} />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: 'var(--text-dim)' }}>No activity yet</p>
          )}
          {items.map(item => (
            <div key={item.id} className="p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-start gap-2">
                {item.status === 'complete' ? <CheckCircle size={12} style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }} />
                  : item.status === 'error' ? <AlertCircle size={12} style={{ color: 'var(--danger)', marginTop: 2, flexShrink: 0 }} />
                  : item.type === 'connected' ? <Wifi size={12} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                  : <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />}
                <div className="min-w-0">
                  <p className="text-xs truncate" style={{ color: 'var(--text)' }}>{item.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{item.time}</p>
                  {item.progress !== undefined && item.status !== 'complete' && (
                    <div className="mt-1 w-full rounded-full h-1" style={{ background: 'var(--border)' }}>
                      <div className="h-1 rounded-full transition-all" style={{ width: `${item.progress}%`, background: 'var(--accent)' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
