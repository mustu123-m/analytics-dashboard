'use client';
import { useState, useEffect } from 'react';
import { getCorrelation } from '@/lib/api';

interface Props { fileId: string; }

function getColor(value: number) {
  if (value === 1) return '#6366f1';
  if (value > 0.7) return 'rgba(99,102,241,0.7)';
  if (value > 0.4) return 'rgba(99,102,241,0.4)';
  if (value > 0) return 'rgba(99,102,241,0.15)';
  if (value < -0.7) return 'rgba(239,68,68,0.7)';
  if (value < -0.4) return 'rgba(239,68,68,0.4)';
  if (value < 0) return 'rgba(239,68,68,0.15)';
  return 'var(--surface-2)';
}

export default function CorrelationMatrix({ fileId }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCorrelation(fileId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fileId]);

  if (loading) return <div className="h-32 animate-pulse rounded-xl" style={{ background: 'var(--surface)' }} />;
  if (error || !data) return null;

  const { columns, matrix } = data;

  return (
    <div className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Correlation Matrix
      </h3>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-1" />
              {columns.map((c: string) => (
                <th key={c} className="p-1 font-normal" style={{ color: 'var(--text-muted)' }}>
                  <span className="block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 80, overflow: 'hidden' }}>
                    {c.length > 12 ? c.substring(0, 12) + '…' : c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row: number[], ri: number) => (
              <tr key={ri}>
                <td className="p-1 pr-3 text-right" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {columns[ri].length > 12 ? columns[ri].substring(0, 12) + '…' : columns[ri]}
                </td>
                {row.map((val, ci) => (
                  <td key={ci} className="p-0.5">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded text-xs font-mono cursor-default"
                      style={{ background: getColor(val), color: Math.abs(val) > 0.5 ? 'white' : 'var(--text-muted)' }}
                      title={`${columns[ri]} vs ${columns[ci]}: ${val}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
