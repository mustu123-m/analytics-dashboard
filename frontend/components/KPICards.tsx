'use client';
import { motion } from 'framer-motion';

interface Props { kpiData: any; summary: any; }

const COLORS = ['var(--indigo)', 'var(--pink)', 'var(--green)', 'var(--amber)'];

export default function KPICards({ kpiData, summary }: Props) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
      </div>
    );
  }

  const topMetrics = kpiData?.kpis?.slice(0, 4) || [];

  if (topMetrics.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--dim)' }}>No numeric columns found to summarize.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-bold mb-3">Key metrics</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topMetrics.map((kpi: any, i: number) => {
          const color = COLORS[i % COLORS.length];
          const range = (kpi.max ?? 0) - (kpi.min ?? 0);
          const meanPct = range > 0 ? ((kpi.mean - kpi.min) / range) * 100 : 50;
          return (
            <motion.div key={kpi.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 lift" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold truncate pr-2">{kpi.name}</p>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              </div>

              <div className="flex items-end gap-4 mb-3">
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--dim)' }}>Mean</p>
                  <p className="text-2xl font-extrabold mono" style={{ color }}>
                    {typeof kpi.mean === 'number' ? kpi.mean.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '–'}
                  </p>
                </div>
              </div>

              {/* Range bar */}
              <div className="relative h-1.5 rounded-full mb-2" style={{ background: 'var(--surface-2)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${meanPct}%` }} transition={{ duration: 0.6, delay: i * 0.06 }}
                  className="absolute top-0 left-0 h-full rounded-full" style={{ background: color }} />
                <motion.div initial={{ left: 0 }} animate={{ left: `${meanPct}%` }} transition={{ duration: 0.6, delay: i * 0.06 }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white" style={{ background: color, boxShadow: 'var(--shadow-sm)' }} />
              </div>

              <div className="flex justify-between text-xs mono" style={{ color: 'var(--dim)' }}>
                <span>min {typeof kpi.min === 'number' ? kpi.min.toLocaleString() : '–'}</span>
                <span>median {typeof kpi.median === 'number' ? kpi.median.toLocaleString() : '–'}</span>
                <span>max {typeof kpi.max === 'number' ? kpi.max.toLocaleString() : '–'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
