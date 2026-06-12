'use client';
import { useState, useEffect } from 'react';
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

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'charts', label: 'Charts' },
  { id: 'ai', label: 'Insights' },
  { id: 'chat', label: 'Ask AI' },
];

export default function Dashboard({ dataset, subscribe }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [kpiData, setKpiData] = useState<any>(null);

  useEffect(() => {
    if (dataset?.fileId) getKPIs(dataset.fileId).then(setKpiData).catch(() => {});
  }, [dataset?.fileId]);

  if (!dataset) return null;

  const numericCols = dataset.columns?.filter((c: any) => c.type === 'number').length ?? 0;
  const catCols = dataset.columns?.filter((c: any) => c.type === 'string').length ?? 0;

  return (
    <div className="h-full flex flex-col">
      {/* Ticker strip — signature element */}
      <div className="flex-shrink-0 overflow-hidden h-8 flex items-center"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-8 px-6 whitespace-nowrap ticker-track" style={{ width: 'max-content' }}>
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center gap-8">
              <TickerItem label="ROWS" value={dataset.rowCount?.toLocaleString()} />
              <TickerItem label="COLS" value={dataset.columns?.length} />
              <TickerItem label="NUMERIC" value={numericCols} color="var(--blue)" />
              <TickerItem label="CATEGORICAL" value={catCols} color="var(--purple)" />
              <TickerItem label="COMPLETE" value={`${dataset.summary?.completeness}%`} color="var(--green)" />
              <TickerItem label="FILE" value={dataset.fileName} mono={false} />
            </div>
          ))}
        </div>
      </div>

      {/* Header + tabs */}
      <div className="flex-shrink-0 px-6 pt-5 pb-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight mb-0.5">{dataset.fileName}</h1>
            <p className="text-xs mono" style={{ color: 'var(--dim)' }}>
              dataset_id: {dataset.fileId?.slice(0, 18)}…
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="text-sm font-medium pb-2.5 transition-colors relative"
              style={{ color: tab === t.id ? 'var(--text)' : 'var(--dim)' }}>
              {t.label}
              {tab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'var(--blue)' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {tab === 'overview' && (
          <div className="space-y-6 fade-up">
            <KPICards kpiData={kpiData} summary={dataset.summary} />
            <CorrelationMatrix fileId={dataset.fileId} />
          </div>
        )}
        {tab === 'charts' && <div className="fade-up"><ChartGrid fileId={dataset.fileId} columns={dataset.columns} /></div>}
        {tab === 'ai' && <div className="fade-up"><AIInsights fileId={dataset.fileId} /></div>}
        {tab === 'chat' && <div className="fade-up"><AIChat fileId={dataset.fileId} fileName={dataset.fileName} /></div>}
      </div>
    </div>
  );
}

function TickerItem({ label, value, color, mono = true }: { label: string; value: any; color?: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs mono" style={{ color: 'var(--dim)' }}>{label}</span>
      <span className={`text-xs font-medium ${mono ? 'mono' : ''}`} style={{ color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}
