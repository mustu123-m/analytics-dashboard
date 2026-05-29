'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter,
  CartesianGrid, Legend,
} from 'recharts';
import { getChartData, getScatterData } from '@/lib/api';

interface Props {
  fileId: string;
  columns: any[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs shadow-xl"
      style={{ background: '#1a1a24', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function ChartGrid({ fileId, columns }: Props) {
  const [charts, setCharts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const numericCols = columns.filter(c => c.type === 'number');
  const catCols = columns.filter(c => c.type === 'string');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results: Record<string, any> = {};

      // First numeric column histogram
      if (numericCols[0]) {
        try { results['num0'] = await getChartData(fileId, numericCols[0].name); } catch {}
      }
      if (numericCols[1]) {
        try { results['num1'] = await getChartData(fileId, numericCols[1].name); } catch {}
      }
      // First categorical column
      if (catCols[0]) {
        try { results['cat0'] = await getChartData(fileId, catCols[0].name); } catch {}
      }
      // Scatter if 2+ numeric
      if (numericCols.length >= 2) {
        try { results['scatter'] = await getScatterData(fileId, numericCols[0].name, numericCols[1].name); } catch {}
      }

      setCharts(results);
      setLoading(false);
    };
    fetchAll();
  }, [fileId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-5 rounded-xl h-64 animate-pulse" style={{ background: 'var(--surface)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.num0 && (
        <ChartCard title={`${charts.num0.column} — Distribution`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.num0.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.cat0 && (
        <ChartCard title={`${charts.cat0.column} — Top Values`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.cat0.data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {charts.cat0.data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.num1 && (
        <ChartCard title={`${charts.num1.column} — Distribution`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.num1.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="var(--accent-2)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.scatter && (
        <ChartCard title={`${charts.scatter.xCol} vs ${charts.scatter.yCol}`}>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="x" type="number" name={charts.scatter.xCol} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="y" type="number" name={charts.scatter.yCol} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={charts.scatter.data} fill="var(--success)" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Pie of cat0 if available */}
      {charts.cat0 && charts.cat0.data.length <= 10 && (
        <ChartCard title={`${charts.cat0.column} — Share`}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={charts.cat0.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: { name?: string; percent?: number }) => `${(name ?? '').substring(0, 10)} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {charts.cat0.data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
