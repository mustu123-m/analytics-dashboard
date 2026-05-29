'use client';
import { useState } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Target, Loader2, ChevronRight } from 'lucide-react';
import { getAIInsights } from '@/lib/api';

interface Props {
  fileId: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  trend: { icon: <TrendingUp size={14} />, color: 'var(--success)' },
  anomaly: { icon: <AlertTriangle size={14} />, color: 'var(--warning)' },
  pattern: { icon: <Sparkles size={14} />, color: 'var(--accent)' },
  recommendation: { icon: <Target size={14} />, color: 'var(--accent-2)' },
};

export default function AIInsights({ fileId }: Props) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAIInsights(fileId);
      setInsights(result.insights);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!insights && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.15)' }}>
          <Brain size={32} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>AI-Powered Analysis</h2>
          <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
            Get instant insights, KPI recommendations, and data quality notes powered by GPT-4o.
          </p>
        </div>
        {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
        <button
          onClick={generate}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white' }}
        >
          <Sparkles size={16} />
          Generate Insights
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Analyzing your dataset with AI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Summary */}
      <div className="p-6 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Executive Summary</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{insights.summary}</p>
      </div>

      {/* Key Insights */}
      {insights.keyInsights?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.keyInsights.map((ins: any, i: number) => {
              const cfg = typeConfig[ins.type] || typeConfig.pattern;
              return (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{ins.type?.toUpperCase()}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{ins.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{ins.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Recommendations */}
      {insights.kpiRecommendations?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>KPI Recommendations</h3>
          <div className="flex flex-col gap-2">
            {insights.kpiRecommendations.map((kpi: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <ChevronRight size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{kpi.metric}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{kpi.rationale}</p>
                  {kpi.suggestedTarget && <p className="text-xs mt-1" style={{ color: 'var(--success)' }}>Target: {kpi.suggestedTarget}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data quality & ML */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.dataQualityNotes?.length > 0 && (
          <div className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>DATA QUALITY NOTES</h4>
            {insights.dataQualityNotes.map((note: string, i: number) => (
              <p key={i} className="text-xs mb-1" style={{ color: 'var(--text)' }}>• {note}</p>
            ))}
          </div>
        )}
        {insights.predictiveOpportunities && (
          <div className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>PREDICTIVE OPPORTUNITIES</h4>
            <p className="text-xs" style={{ color: 'var(--text)' }}>{insights.predictiveOpportunities}</p>
          </div>
        )}
      </div>

      <button onClick={generate}
        className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-muted)' }}>
        <Sparkles size={12} /> Regenerate insights
      </button>
    </div>
  );
}
