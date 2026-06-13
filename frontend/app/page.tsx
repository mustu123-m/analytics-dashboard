'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import AuthPage from '@/components/AuthPage';
import UploadZone from '@/components/UploadZone';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeDataset, setActiveDataset] = useState<any>(null);
  const [view, setView] = useState<'upload' | 'dashboard'>('upload');
  const { connected, subscribe } = useWebSocket();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <motion.span key={i} className="w-3 h-3 rounded-full" style={{ background: i === 0 ? 'var(--indigo)' : i === 1 ? 'var(--pink)' : 'var(--amber)' }}
              animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar
        connected={connected}
        onUploadClick={() => setView('upload')}
        onDashboardClick={() => activeDataset && setView('dashboard')}
        hasDataset={!!activeDataset}
        activeView={view}
        user={user}
      />
      <main className="flex-1 min-w-0">
        {view === 'upload'
          ? <UploadZone onDatasetLoaded={(ds) => { setActiveDataset(ds); setView('dashboard'); }} subscribe={subscribe} />
          : <Dashboard dataset={activeDataset} subscribe={subscribe} />
        }
      </main>
    </div>
  );
}
