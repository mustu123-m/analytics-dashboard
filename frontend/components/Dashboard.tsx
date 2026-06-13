'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'overview', label: 'Overview', emoji: '📊' },
  { id: 'charts', label: 'Charts', emoji: '📈' },
  { id: 'ai', label: 'Insights', emoji: '✨' },
  { id: 'chat', label: 'Ask AI', emoji: '💬' },
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

  const stats = [
    { label: 'Rows', value: dataset.rowCount?.toLocaleString(), color: 'var(--indigo)' },
    { label: 'Columns', value: dataset.columns?.length, color: 'var(--pink)' },
    { label: 'Numeric', value: numericCols, color: 'var(--green)' },
    { label: 'Categorical', value: catCols, color: 'var(--amber)' },
    { label: 'Complete', value: `${dataset.summary?.completeness}%`, color: 'var(--green)' },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 sm:px-8 pt-6 pb-0">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <p className="text-xs font-bold mono mb-1" style={{ color: 'var(--dim)' }}>DATASET</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{dataset.fileName}</h1>
        </motion.div>

        {/* Stat pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-5 -mx-1 px-1">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 rounded-2xl px-4 py-3 min-w-[110px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
              <p className="text-xl font-extrabold mono" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 -mx-1 px-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="relative px-4 py-2.5 text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
              style={{ color: tab === t.id ? 'var(--indigo)' : 'var(--muted)' }}>
              <span>{t.emoji}</span>{t.label}
              {tab === t.id && (
                <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl -z-10" style={{ background: 'var(--grad-soft)' }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px flex-shrink-0" style={{ background: 'var(--border)' }} />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {tab === 'overview' && (
              <div className="space-y-6">
                <KPICards kpiData={kpiData} summary={dataset.summary} />
                <CorrelationMatrix fileId={dataset.fileId} />
              </div>
            )}
            {tab === 'charts' && <ChartGrid fileId={dataset.fileId} columns={dataset.columns} />}
            {tab === 'ai' && <AIInsights fileId={dataset.fileId} />}
            {tab === 'chat' && <AIChat fileId={dataset.fileId} fileName={dataset.fileName} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
