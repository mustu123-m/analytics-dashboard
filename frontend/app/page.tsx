'use client';
import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';
import ActivityFeed from '@/components/ActivityFeed';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const [activeDataset, setActiveDataset] = useState<any>(null);
  const [view, setView] = useState<'upload' | 'dashboard'>('upload');
  const { connected, subscribe } = useWebSocket();

  const handleDatasetLoaded = (dataset: any) => {
    setActiveDataset(dataset);
    setView('dashboard');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar
        connected={connected}
        onUploadClick={() => setView('upload')}
        onDashboardClick={() => activeDataset && setView('dashboard')}
        hasDataset={!!activeDataset}
        activeView={view}
      />
      <main className="flex-1 overflow-y-auto">
        {view === 'upload' ? (
          <UploadZone onDatasetLoaded={handleDatasetLoaded} subscribe={subscribe} />
        ) : (
          <Dashboard dataset={activeDataset} subscribe={subscribe} />
        )}
      </main>
      <ActivityFeed subscribe={subscribe} connected={connected} />
    </div>
  );
}
