'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AuthPage from '@/components/AuthPage';
import UploadZone from '@/components/UploadZone';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';
import ActivityFeed from '@/components/ActivityFeed';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeDataset, setActiveDataset] = useState<any>(null);
  const [view, setView] = useState<'upload' | 'dashboard'>('upload');
  const { connected, subscribe } = useWebSocket();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
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
      <main className="flex-1 overflow-y-auto">
        {view === 'upload'
          ? <UploadZone onDatasetLoaded={(ds) => { setActiveDataset(ds); setView('dashboard'); }} subscribe={subscribe} />
          : <Dashboard dataset={activeDataset} subscribe={subscribe} />
        }
      </main>
      <ActivityFeed subscribe={subscribe} connected={connected} />
    </div>
  );
}
