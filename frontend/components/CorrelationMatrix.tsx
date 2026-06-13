'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCorrelation } from '@/lib/api';

interface Props { fileId: string; }

function cellStyle(value: number) {
  const abs = Math.abs(value);
  if (value === 1) return { background: 'var(--grad)', color: 'white' };
  if (value > 0) return { background: `rgba(109,94,245,${0.08 + abs * 0.5})`, color: abs > 0.5 ? 'white' : 'var(--text)' };
  if (value < 0) return { background: `rgba(255,107,107,${0.08 + abs * 0.5})`, color: abs > 0.5 ? 'white' : 'var(--text)' };
  return { background: 'var(--surface-2)', color: 'var(--dim)' };
}

export default function CorrelationMatrix({ fileId }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCorrelation(fileId).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [fileId]);

  if (loading) return <div className="h-48 rounded-2xl skeleton" />;
  if (error || !data) return null;

  const { columns, matrix } = data;
  const short = (s: string) => s.length > 10 ? s.slice(0, 10) + '…' : s;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🔗</span>
        <p className="text-sm font-bold">Correlation matrix</p>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--dim)' }}>Pearson</span>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <td />
              {columns.map((c: string) => (
                <th key={c} className="px-1 pb-2 text-xs font-semibold mono" style={{ color: 'var(--dim)' }}>
                  <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 70 }}>{short(c)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row: number[], ri: number) => (
              <tr key={ri}>
                <td className="pr-3 text-xs font-semibold mono text-right whitespace-nowrap" style={{ color: 'var(--dim)' }}>{short(columns[ri])}</td>
                {row.map((val, ci) => (
                  <td key={ci} className="p-0.5">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold mono transition-transform hover:scale-110" style={cellStyle(val)} title={`${columns[ri]} × ${columns[ci]}`}>
                      {val.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
