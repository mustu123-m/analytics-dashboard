'use client';
import { TrendingUp, Hash, Table, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  kpiData: any;
  summary: any;
}

export default function KPICards({ kpiData, summary }: Props) {
  if (!summary) return <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>;

  const topMetrics = kpiData?.kpis?.slice(0, 3) || [];

  const cards = [
    { label: 'Total Rows', value: summary.totalRows?.toLocaleString() ?? '-', icon: <Table size={16} />, color: 'var(--accent)' },
    { label: 'Columns', value: summary.totalColumns ?? '-', icon: <BarChart2 size={16} />, color: 'var(--accent-2)' },
    { label: 'Numeric Fields', value: summary.numericColumns ?? '-', icon: <Hash size={16} />, color: 'var(--success)' },
    { label: 'Completeness', value: `${summary.completeness ?? '-'}%`, icon: summary.completeness >= 90 ? <CheckCircle size={16} /> : <AlertCircle size={16} />, color: summary.completeness >= 90 ? 'var(--success)' : 'var(--warning)' },
  ];

  return (
    <div>
      <h2 className="text-xs font-semibold mb-3 tracking-widest" style={{ color: 'var(--text-muted)' }}>DATASET OVERVIEW</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map(c => (
          <div key={c.label} className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: c.color }}>{c.icon}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
            </div>
            <p className="text-2xl font-bold mono" style={{ color: 'var(--text)' }}>{c.value}</p>
          </div>
        ))}
      </div>

      {topMetrics.length > 0 && (
        <>
          <h2 className="text-xs font-semibold mb-3 tracking-widest" style={{ color: 'var(--text-muted)' }}>KEY METRICS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topMetrics.map((kpi: any) => (
              <div key={kpi.name} className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-3 truncate" style={{ color: 'var(--text-muted)' }}>{kpi.name}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['Min', kpi.min], ['Mean', kpi.mean], ['Max', kpi.max]].map(([l, v]) => (
                    <div key={l as string}>
                      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{l}</p>
                      <p className="text-sm font-semibold mono" style={{ color: 'var(--text)' }}>
                        {typeof v === 'number' ? (v > 1000 ? v.toLocaleString() : v) : '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
