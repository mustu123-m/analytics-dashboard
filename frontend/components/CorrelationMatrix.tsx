'use client';
import { useState, useEffect } from 'react';
import { getCorrelation } from '@/lib/api';

interface Props { fileId: string; }

function cellStyle(value: number) {
  const abs = Math.abs(value);
  if (value === 1) return { background: 'var(--blue)', color: '#08090d' };
  if (value > 0) return { background: `rgba(88,166,255,${0.08 + abs * 0.5})`, color: abs > 0.5 ? '#08090d' : 'var(--text)' };
  if (value < 0) return { background: `rgba(247,129,102,${0.08 + abs * 0.5})`, color: abs > 0.5 ? '#08090d' : 'var(--text)' };
  return { background: 'var(--surface-2)', color: 'var(--dim)' };
}

export default function CorrelationMatrix({ fileId }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCorrelation(fileId).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [fileId]);

  if (loading) return <div className="h-40 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />;
  if (error || !data) return null;

  const { columns, matrix } = data;
  const short = (s: string) => s.length > 10 ? s.slice(0, 10) + '…' : s;

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-xs mono uppercase tracking-wider" style={{ color: 'var(--dim)' }}>Correlation matrix · pearson</p>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <td />
              {columns.map((c: string) => (
                <th key={c} className="px-1 pb-2 text-xs font-normal mono" style={{ color: 'var(--dim)' }}>
                  <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 70 }}>{short(c)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row: number[], ri: number) => (
              <tr key={ri}>
                <td className="pr-3 text-xs mono text-right whitespace-nowrap" style={{ color: 'var(--dim)' }}>{short(columns[ri])}</td>
                {row.map((val, ci) => (
                  <td key={ci} className="p-0.5">
                    <div className="w-9 h-9 flex items-center justify-center rounded text-xs mono" style={cellStyle(val)} title={`${columns[ri]} × ${columns[ci]}`}>
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
