'use client';

interface Props { kpiData: any; summary: any; }

export default function KPICards({ kpiData, summary }: Props) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />)}
      </div>
    );
  }

  const topMetrics = kpiData?.kpis?.slice(0, 4) || [];

  const cards = [
    { label: 'Total rows', value: summary.totalRows?.toLocaleString() ?? '–' },
    { label: 'Columns', value: summary.totalColumns ?? '–' },
    { label: 'Numeric fields', value: summary.numericColumns ?? '–' },
    { label: 'Completeness', value: `${summary.completeness ?? '–'}%`, color: summary.completeness >= 90 ? 'var(--green)' : 'var(--amber)' },
  ];

  return (
    <div className="space-y-5">
      {/* Top summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-lg p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs mono mb-2" style={{ color: 'var(--dim)' }}>{c.label.toUpperCase()}</p>
            <p className="text-2xl font-semibold mono" style={{ color: c.color || 'var(--text)' }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Per-column stats */}
      {topMetrics.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="px-4 py-2.5" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs mono uppercase tracking-wider" style={{ color: 'var(--dim)' }}>Column statistics</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  {['Column', 'Min', 'Median', 'Mean', 'Max'].map((h, i) => (
                    <th key={h} className={`px-4 py-2 text-xs mono font-medium ${i === 0 ? 'text-left' : 'text-right'}`} style={{ color: 'var(--dim)' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topMetrics.map((kpi: any, idx: number) => (
                  <tr key={kpi.name} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-4 py-2.5 text-sm font-medium truncate max-w-[160px]">{kpi.name}</td>
                    {[kpi.min, kpi.median, kpi.mean, kpi.max].map((v, i) => (
                      <td key={i} className="px-4 py-2.5 text-sm mono text-right" style={{ color: 'var(--muted)' }}>
                        {typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '–'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
