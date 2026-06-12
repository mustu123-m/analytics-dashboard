'use client';
import { useState } from 'react';
import { getAIInsights } from '@/lib/api';

interface Props { fileId: string; }

const TYPE_STYLE: Record<string, { color: string; label: string }> = {
  trend: { color: 'var(--green)', label: 'TREND' },
  anomaly: { color: 'var(--amber)', label: 'ANOMALY' },
  pattern: { color: 'var(--blue)', label: 'PATTERN' },
  recommendation: { color: 'var(--purple)', label: 'RECOMMENDATION' },
};

export default function AIInsights({ fileId }: Props) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAIInsights(fileId);
      setInsights(result.insights);
      setCached(!!result.fromCache);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!insights && !loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M5.5 2.5C4 2.5 3 3.5 3 5C2 5.3 1.5 6.2 1.5 7C1.5 8 2.3 8.8 3 9C3 10.5 4 11.5 5.5 11.5M5.5 2.5C6.5 2.5 7 3 7 4V10C7 11 6.5 11.5 5.5 11.5M5.5 2.5V11.5M10.5 2.5C12 2.5 13 3.5 13 5C14 5.3 14.5 6.2 14.5 7C14.5 8 13.7 8.8 13 9C13 10.5 12 11.5 10.5 11.5M10.5 2.5C9.5 2.5 9 3 9 4V10C9 11 9.5 11.5 10.5 11.5M10.5 2.5V11.5" stroke="var(--blue)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <h2 className="text-base font-semibold mb-1.5">Generate AI analysis</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Gemini will summarize this dataset, surface key insights, and recommend KPIs to track.
        </p>
        {error && (
          <div className="mb-4 px-3 py-2 rounded-md text-xs mono text-left" style={{ background: 'rgba(247,129,102,0.08)', border: '1px solid rgba(247,129,102,0.25)', color: 'var(--red)' }}>
            {error}
          </div>
        )}
        <button onClick={generate} className="px-5 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--blue)', color: '#08090d' }}>
          Run analysis
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="flex justify-center gap-1 mb-4">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--blue)', animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Analyzing dataset with Gemini…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Summary */}
      <div className="rounded-lg p-4" style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs mono uppercase tracking-wider" style={{ color: 'var(--blue)' }}>Executive summary</p>
          {cached && <span className="text-xs mono px-1.5 py-0.5 rounded" style={{ background: 'var(--surface)', color: 'var(--dim)' }}>cached</span>}
        </div>
        <p className="text-sm leading-relaxed">{insights.summary}</p>
      </div>

      {/* Key insights */}
      {insights.keyInsights?.length > 0 && (
        <div>
          <p className="text-xs mono uppercase tracking-wider mb-2.5" style={{ color: 'var(--dim)' }}>Key insights</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {insights.keyInsights.map((ins: any, i: number) => {
              const cfg = TYPE_STYLE[ins.type] || TYPE_STYLE.pattern;
              return (
                <div key={i} className="rounded-lg p-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span className="text-xs mono px-1.5 py-0.5 rounded mb-2 inline-block" style={{ background: 'var(--surface-2)', color: cfg.color }}>{cfg.label}</span>
                  <p className="text-sm font-medium mb-1">{ins.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{ins.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI recommendations */}
      {insights.kpiRecommendations?.length > 0 && (
        <div>
          <p className="text-xs mono uppercase tracking-wider mb-2.5" style={{ color: 'var(--dim)' }}>Recommended KPIs</p>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {insights.kpiRecommendations.map((kpi: any, i: number) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3" style={{ background: 'var(--surface)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span className="text-xs mono mt-0.5" style={{ color: 'var(--blue)' }}>→</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{kpi.metric}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{kpi.rationale}</p>
                </div>
                {kpi.suggestedTarget && (
                  <span className="text-xs mono px-2 py-1 rounded flex-shrink-0" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>{kpi.suggestedTarget}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality + ML */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {insights.dataQualityNotes?.length > 0 && (
          <div className="rounded-lg p-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs mono uppercase tracking-wider mb-2" style={{ color: 'var(--dim)' }}>Data quality</p>
            {insights.dataQualityNotes.map((note: string, i: number) => (
              <p key={i} className="text-xs leading-relaxed mb-1" style={{ color: 'var(--muted)' }}>· {note}</p>
            ))}
          </div>
        )}
        {insights.predictiveOpportunities && (
          <div className="rounded-lg p-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs mono uppercase tracking-wider mb-2" style={{ color: 'var(--dim)' }}>ML opportunities</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{insights.predictiveOpportunities}</p>
          </div>
        )}
      </div>

      <button onClick={generate} className="text-xs mono transition-opacity hover:opacity-70" style={{ color: 'var(--dim)' }}>
        ↻ regenerate
      </button>
    </div>
  );
}
