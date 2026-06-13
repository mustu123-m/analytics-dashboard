'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCorrelation } from '@/lib/api';

interface Props { fileId: string; }

function cellStyle(value: number) {
  const abs = Math.abs(value);
  if (value === 1) return { background: 'var(--grad-1)', color: '#05060A' };
  if (value > 0) return { background: `rgba(46,230,214,${0.06 + abs * 0.45})`, color: abs > 0.5 ? '#05060A' : 'var(--text)' };
  if (value < 0) return { background: `rgba(255,111,156,${0.06 + abs * 0.45})`, color: abs > 0.5 ? '#05060A' : 'var(--text)' };
  return { background: 'var(--glass-2)', color: 'var(--dim)' };
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
  const short = (s: string) => s.length > 9 ? s.slice(0, 9) + '…' : s;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 sm:p-5 glass">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-bold">Correlation matrix</p>
        <span className="text-xs px-2 py-0.5 rounded-full mono" style={{ background: 'var(--glass-2)', color: 'var(--dim)' }}>pearson</span>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <td />
              {columns.map((c: string) => (
                <th key={c} className="px-1 pb-2 text-xs font-medium mono" style={{ color: 'var(--dim)' }}>
                  <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 65 }}>{short(c)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row: number[], ri: number) => (
              <tr key={ri}>
                <td className="pr-3 text-xs font-medium mono text-right whitespace-nowrap" style={{ color: 'var(--dim)' }}>{short(columns[ri])}</td>
                {row.map((val, ci) => (
                  <td key={ci} className="p-0.5">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold mono transition-smooth hover:scale-110" style={cellStyle(val)} title={`${columns[ri]} × ${columns[ci]}`}>
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
