'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIInsights } from '@/lib/api';

interface Props { fileId: string; }

const TYPE_STYLE: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  trend: { color: 'var(--green)', bg: 'rgba(45,212,167,0.1)', label: 'Trend', emoji: '📈' },
  anomaly: { color: 'var(--amber)', bg: 'rgba(255,181,71,0.1)', label: 'Anomaly', emoji: '⚡' },
  pattern: { color: 'var(--indigo)', bg: 'rgba(109,94,245,0.1)', label: 'Pattern', emoji: '🔍' },
  recommendation: { color: 'var(--pink)', bg: 'rgba(255,111,168,0.1)', label: 'Recommendation', emoji: '💡' },
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
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5 text-2xl" style={{ background: 'var(--grad)', boxShadow: 'var(--shadow-glow)' }}>
          ✨
        </motion.div>
        <h2 className="text-xl font-extrabold mb-2">Unlock AI insights</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Gemini will analyze your dataset and surface trends, anomalies, KPI suggestions, and more.
        </p>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-left" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#E64545' }}>
            {error}
          </div>
        )}
        <motion.button whileTap={{ scale: 0.97 }} onClick={generate}
          className="px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: 'var(--grad)', color: 'white', boxShadow: 'var(--shadow-glow)' }}>
          Generate insights
        </motion.button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="flex justify-center gap-2 mb-5">
          {[0,1,2].map(i => (
            <motion.span key={i} className="w-3 h-3 rounded-full" style={{ background: i === 0 ? 'var(--indigo)' : i === 1 ? 'var(--pink)' : 'var(--amber)' }}
              animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Gemini is analyzing your dataset…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5" style={{ background: 'var(--grad)', color: 'white' }}>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">✨ Executive summary</p>
          {cached && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>cached</span>}
        </div>
        <p className="text-sm leading-relaxed font-medium">{insights.summary}</p>
      </motion.div>

      {/* Key insights */}
      {insights.keyInsights?.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-3">Key insights</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.keyInsights.map((ins: any, i: number) => {
              const cfg = TYPE_STYLE[ins.type] || TYPE_STYLE.pattern;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-4 lift" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="text-sm font-bold px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>
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
          <p className="text-sm font-bold mb-3">Recommended KPIs to track</p>
          <div className="space-y-2">
            {insights.kpiRecommendations.map((kpi: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl px-4 py-3.5 flex items-start gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: 'var(--grad-soft)', color: 'var(--indigo)' }}>{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{kpi.metric}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{kpi.rationale}</p>
                </div>
                {kpi.suggestedTarget && (
                  <span className="text-xs font-bold mono px-2.5 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(45,212,167,0.1)', color: 'var(--green)' }}>{kpi.suggestedTarget}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quality + ML */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.dataQualityNotes?.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-bold mb-2 flex items-center gap-1.5">🧪 Data quality</p>
            {insights.dataQualityNotes.map((note: string, i: number) => (
              <p key={i} className="text-sm leading-relaxed mb-1" style={{ color: 'var(--muted)' }}>· {note}</p>
            ))}
          </div>
        )}
        {insights.predictiveOpportunities && (
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-bold mb-2 flex items-center gap-1.5">🤖 ML opportunities</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{insights.predictiveOpportunities}</p>
          </div>
        )}
      </div>

      <button onClick={generate} className="text-sm font-bold grad-text transition-opacity hover:opacity-70">
        ↻ Regenerate
      </button>
    </div>
  );
}
