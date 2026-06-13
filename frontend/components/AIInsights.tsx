'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIInsights } from '@/lib/api';

interface Props { fileId: string; }

const TYPE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  trend: { color: 'var(--lime)', bg: 'rgba(196,240,66,0.1)', label: 'Trend' },
  anomaly: { color: 'var(--amber)', bg: 'rgba(255,180,84,0.1)', label: 'Anomaly' },
  pattern: { color: 'var(--cyan)', bg: 'rgba(46,230,214,0.1)', label: 'Pattern' },
  recommendation: { color: 'var(--violet)', bg: 'rgba(167,139,250,0.1)', label: 'Recommendation' },
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
      <div className="max-w-md mx-auto py-12 sm:py-16 text-center">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5 relative" style={{ background: 'var(--grad-1)' }}>
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
            <path d="M5.5 2.5C4 2.5 3 3.5 3 5C2 5.3 1.5 6.2 1.5 7C1.5 8 2.3 8.8 3 9C3 10.5 4 11.5 5.5 11.5M5.5 2.5C6.5 2.5 7 3 7 4V10C7 11 6.5 11.5 5.5 11.5M5.5 2.5V11.5M10.5 2.5C12 2.5 13 3.5 13 5C14 5.3 14.5 6.2 14.5 7C14.5 8 13.7 8.8 13 9C13 10.5 12 11.5 10.5 11.5M10.5 2.5C9.5 2.5 9 3 9 4V10C9 11 9.5 11.5 10.5 11.5M10.5 2.5V11.5" stroke="#05060A" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </svg>
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'var(--grad-1)', filter: 'blur(24px)', opacity: 0.5, zIndex: -1 }} />
        </motion.div>
        <h2 className="text-xl font-bold mb-2">Unlock AI insights</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Gemini will analyze your dataset and surface trends, anomalies, and KPI recommendations.
        </p>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-left" style={{ background: 'rgba(255,111,156,0.08)', border: '1px solid rgba(255,111,156,0.2)', color: 'var(--coral)' }}>
            {error}
          </div>
        )}
        <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={generate}
          className="px-6 py-3 rounded-2xl text-sm font-bold transition-opacity"
          style={{ background: 'var(--grad-1)', color: '#05060A' }}>
          Generate insights
        </motion.button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 sm:py-20 text-center">
        <div className="flex justify-center gap-2 mb-5">
          {[0,1,2].map(i => (
            <motion.span key={i} className="w-3 h-3 rounded-full" style={{ background: i === 0 ? 'var(--cyan)' : i === 1 ? 'var(--violet)' : 'var(--coral)' }}
              animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Gemini is analyzing your dataset…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5" style={{ background: 'var(--grad-1)', color: '#05060A' }}>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">Executive summary</p>
          {cached && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(5,6,10,0.15)' }}>cached</span>}
        </div>
        <p className="text-sm leading-relaxed font-medium">{insights.summary}</p>
      </motion.div>

      {/* Key insights */}
      {insights.keyInsights?.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-3">Key insights</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.keyInsights.map((ins: any, i: number) => {
              const cfg = TYPE_STYLE[ins.type] || TYPE_STYLE.pattern;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-4 glass">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block mb-2.5" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <p className="text-sm font-bold mb-1">{ins.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{ins.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI recommendations */}
      {insights.kpiRecommendations?.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-3">Recommended KPIs</p>
          <div className="space-y-2">
            {insights.kpiRecommendations.map((kpi: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl px-4 py-3.5 flex items-start gap-3 glass">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold mono" style={{ background: 'var(--glass-2)', color: 'var(--cyan)' }}>{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{kpi.metric}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{kpi.rationale}</p>
                </div>
                {kpi.suggestedTarget && (
                  <span className="text-xs font-bold mono px-2.5 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(196,240,66,0.1)', color: 'var(--lime)' }}>{kpi.suggestedTarget}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quality + ML */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.dataQualityNotes?.length > 0 && (
          <div className="rounded-2xl p-4 glass">
            <p className="text-sm font-bold mb-2">Data quality</p>
            {insights.dataQualityNotes.map((note: string, i: number) => (
              <p key={i} className="text-sm leading-relaxed mb-1" style={{ color: 'var(--muted)' }}>· {note}</p>
            ))}
          </div>
        )}
        {insights.predictiveOpportunities && (
          <div className="rounded-2xl p-4 glass">
            <p className="text-sm font-bold mb-2">ML opportunities</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{insights.predictiveOpportunities}</p>
          </div>
        )}
      </div>

      <button onClick={generate} className="text-sm font-bold grad-text-1 transition-opacity hover:opacity-70">
        ↻ Regenerate
      </button>
    </div>
  );
}
