'use client';
import { useState, useEffect } from 'react';
import { BarChart2, Brain, MessageSquare, TrendingUp, Table, RefreshCw } from 'lucide-react';
import KPICards from './KPICards';
import ChartGrid from './ChartGrid';
import AIInsights from './AIInsights';
import AIChat from './AIChat';
import CorrelationMatrix from './CorrelationMatrix';
import { getKPIs } from '@/lib/api';

interface Props {
  dataset: any;
  subscribe: (fn: (msg: any) => void) => () => void;
}

type Tab = 'overview' | 'charts' | 'ai' | 'chat';

export default function Dashboard({ dataset, subscribe }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [kpiData, setKpiData] = useState<any>(null);

  useEffect(() => {
    if (dataset?.fileId) {
      getKPIs(dataset.fileId).then(setKpiData).catch(() => {});
    }
  }, [dataset?.fileId]);

  if (!dataset) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
    { id: 'charts', label: 'Charts', icon: <BarChart2 size={14} /> },
    { id: 'ai', label: 'AI Insights', icon: <Brain size={14} /> },
    { id: 'chat', label: 'Ask AI', icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{dataset.fileName}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {dataset.rowCount?.toLocaleString()} rows · {dataset.columns?.length} columns · {dataset.summary?.completeness}% complete
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
          Live
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--surface)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? 'var(--surface-2)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <KPICards kpiData={kpiData} summary={dataset.summary} />
          <CorrelationMatrix fileId={dataset.fileId} />
        </div>
      )}

      {tab === 'charts' && (
        <ChartGrid fileId={dataset.fileId} columns={dataset.columns} />
      )}

      {tab === 'ai' && (
        <AIInsights fileId={dataset.fileId} />
      )}

      {tab === 'chat' && (
        <AIChat fileId={dataset.fileId} fileName={dataset.fileName} />
      )}
    </div>
  );
}
