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

  const stats = [
    { label: 'Rows', value: dataset.rowCount?.toLocaleString(), grad: 'var(--grad-1)' },
    { label: 'Columns', value: dataset.columns?.length, grad: 'var(--grad-2)' },
    { label: 'Numeric', value: numericCols, grad: 'var(--grad-3)' },
    { label: 'Complete', value: `${dataset.summary?.completeness}%`, grad: 'var(--grad-1)' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="text-xs font-bold mono mb-1" style={{ color: 'var(--dim)' }}>DATASET</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{dataset.fileName}</h1>
        </motion.div>

        {/* Bento stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-3.5 glass relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20" style={{ background: s.grad, filter: 'blur(20px)' }} />
              <p className="text-xs font-semibold mb-1 relative z-10" style={{ color: 'var(--muted)' }}>{s.label}</p>
              <p className="text-xl sm:text-2xl font-bold mono relative z-10">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-px">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="relative px-4 py-2.5 text-sm font-bold rounded-2xl transition-colors flex-shrink-0"
              style={{ color: tab === t.id ? '#05060A' : 'var(--muted)' }}>
              {tab === t.id && (
                <motion.div layoutId="tab-bg-2" className="absolute inset-0 rounded-2xl -z-10" style={{ background: 'var(--grad-1)' }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px flex-shrink-0 mx-4 sm:mx-6 my-3" style={{ background: 'var(--glass-br)' }} />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {tab === 'overview' && (
              <div className="space-y-4">
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
