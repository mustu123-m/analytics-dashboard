'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, CartesianGrid,
} from 'recharts';
import { getChartData, getScatterData } from '@/lib/api';

interface Props { fileId: string; columns: any[]; }

const PALETTE = ['#58a6ff', '#bc8cff', '#3fb950', '#d29922', '#f78166', '#79c0ff', '#a5d6ff', '#7ee787'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-md text-xs mono"
      style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
      <p className="mb-1" style={{ color: 'var(--dim)' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

function ChartCard({ title, num, children }: { title: string; num: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs mono px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--dim)' }}>{num}</span>
        <p className="text-xs font-medium truncate" style={{ color: 'var(--muted)' }}>{title}</p>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

const axisProps = { tick: { fontSize: 10, fill: 'var(--dim)', fontFamily: 'var(--font-mono)' }, stroke: 'var(--border-2)' };

export default function ChartGrid({ fileId, columns }: Props) {
  const [charts, setCharts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const numericCols = columns.filter(c => c.type === 'number');
  const catCols = columns.filter(c => c.type === 'string');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results: Record<string, any> = {};
      if (numericCols[0]) try { results['num0'] = await getChartData(fileId, numericCols[0].name); } catch {}
      if (catCols[0]) try { results['cat0'] = await getChartData(fileId, catCols[0].name); } catch {}
      if (numericCols[1]) try { results['num1'] = await getChartData(fileId, numericCols[1].name); } catch {}
      if (numericCols.length >= 2) try { results['scatter'] = await getScatterData(fileId, numericCols[0].name, numericCols[1].name); } catch {}
      setCharts(results);
      setLoading(false);
    };
    fetchAll();
  }, [fileId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />)}
      </div>
    );
  }

  let n = 0;
  const next = () => String(++n).padStart(2, '0');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {charts.num0 && (
        <ChartCard num={next()} title={`${charts.num0.column} — distribution`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.num0.data}>
              <CartesianGrid strokeDasharray="2 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="range" {...axisProps} interval="preserveStartEnd" />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="count" fill="var(--blue)" radius={[2, 2, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.cat0 && (
        <ChartCard num={next()} title={`${charts.cat0.column} — top values`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.cat0.data} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="2 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" {...axisProps} />
              <YAxis dataKey="name" type="category" {...axisProps} width={90} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="value" radius={[0, 2, 2, 0]} maxBarSize={16}>
                {charts.cat0.data.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.num1 && (
        <ChartCard num={next()} title={`${charts.num1.column} — distribution`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.num1.data}>
              <CartesianGrid strokeDasharray="2 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="range" {...axisProps} interval="preserveStartEnd" />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="count" fill="var(--purple)" radius={[2, 2, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.scatter && (
        <ChartCard num={next()} title={`${charts.scatter.xCol} vs ${charts.scatter.yCol}`}>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="2 3" stroke="var(--border)" />
              <XAxis dataKey="x" type="number" name={charts.scatter.xCol} {...axisProps} />
              <YAxis dataKey="y" type="number" name={charts.scatter.yCol} {...axisProps} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '2 3', stroke: 'var(--border-2)' }} />
              <Scatter data={charts.scatter.data} fill="var(--green)" opacity={0.6} r={2.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.cat0 && charts.cat0.data.length <= 10 && (
        <ChartCard num={next()} title={`${charts.cat0.column} — share`}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={charts.cat0.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                paddingAngle={2}
                label={({ percent }: any) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--muted)' }}>
                {charts.cat0.data.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="var(--surface)" strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
