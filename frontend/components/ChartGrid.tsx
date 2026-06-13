'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, CartesianGrid,
} from 'recharts';
import { getChartData, getScatterData } from '@/lib/api';

interface Props { fileId: string; columns: any[]; }

const PALETTE = ['#6D5EF5', '#FF6FA8', '#2DD4A7', '#FFB547', '#8B7CFF', '#FF8FBF', '#5EEAD4', '#FFD166'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background: 'var(--text)', color: 'white', boxShadow: 'var(--shadow-md)' }}>
      <p className="mb-1 opacity-60 mono">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="mono">{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

function ChartCard({ title, emoji, children, delay = 0 }: { title: string; emoji: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-5 lift" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{emoji}</span>
        <p className="text-sm font-bold">{title}</p>
      </div>
      {children}
    </motion.div>
  );
}

const axisProps = { tick: { fontSize: 10, fill: 'var(--dim)', fontFamily: 'var(--font-mono)' }, stroke: 'var(--border)' };

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
        {[1,2,3,4].map(i => <div key={i} className="h-72 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {charts.num0 && (
        <ChartCard emoji="📊" title={`${charts.num0.column} distribution`} delay={0}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.num0.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="range" {...axisProps} interval="preserveStartEnd" />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="count" fill="var(--indigo)" radius={[8, 8, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.cat0 && (
        <ChartCard emoji="🏷️" title={`${charts.cat0.column} top values`} delay={0.05}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.cat0.data} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" {...axisProps} />
              <YAxis dataKey="name" type="category" {...axisProps} width={90} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={18}>
                {charts.cat0.data.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.num1 && (
        <ChartCard emoji="📈" title={`${charts.num1.column} distribution`} delay={0.1}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.num1.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="range" {...axisProps} interval="preserveStartEnd" />
              <YAxis {...axisProps} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="count" fill="var(--pink)" radius={[8, 8, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.scatter && (
        <ChartCard emoji="✨" title={`${charts.scatter.xCol} vs ${charts.scatter.yCol}`} delay={0.15}>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="x" type="number" name={charts.scatter.xCol} {...axisProps} />
              <YAxis dataKey="y" type="number" name={charts.scatter.yCol} {...axisProps} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--border-2)' }} />
              <Scatter data={charts.scatter.data} fill="var(--green)" opacity={0.7} r={3} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {charts.cat0 && charts.cat0.data.length <= 10 && (
        <ChartCard emoji="🍕" title={`${charts.cat0.column} share`} delay={0.2}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={charts.cat0.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78}
                paddingAngle={3} cornerRadius={6}
                label={({ percent }: any) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', fill: 'var(--muted)' }}>
                {charts.cat0.data.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="var(--surface)" strokeWidth={3} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
