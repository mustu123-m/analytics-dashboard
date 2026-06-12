'use client';
import { useState } from 'react';
import { login, register } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AuthPage() {
  const { setUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
      setUser(result.user);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{ borderRight: '1px solid var(--border)' }}>

        {/* grid texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(var(--border-2) 1px, transparent 1px), linear-gradient(90deg, var(--border-2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--blue)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 9L4.5 5L7 7L10 2" stroke="#08090d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">DataPulse</span>
          </div>
          <p className="text-xs mono" style={{ color: 'var(--dim)' }}>v2.1.0 — analytics runtime</p>
        </div>

        {/* Centerpiece — a mock data readout */}
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <p className="text-3xl font-semibold leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
              Upload data.<br />Ship insight.
            </p>
            <p className="text-sm mt-3 max-w-xs" style={{ color: 'var(--muted)' }}>
              Drop a CSV or spreadsheet, get a live dashboard, correlations, and an AI analyst in the same view.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 max-w-sm">
            {[
              { label: 'Parse time', value: '0.4s', color: 'var(--green)' },
              { label: 'Chart types', value: '04', color: 'var(--blue)' },
              { label: 'AI model', value: 'gemini-2.0', color: 'var(--purple)' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--dim)' }}>{s.label}</p>
                <p className="text-sm font-semibold mono" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs" style={{ color: 'var(--dim)' }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
          <span className="mono">system operational</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--blue)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 9L4.5 5L7 7L10 2" stroke="#08090d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">DataPulse</span>
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-semibold tracking-tight mb-1.5">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {mode === 'login' ? 'Access your datasets and dashboards' : 'Start analyzing your data with AI'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <Field label="Name" type="text" placeholder="Jane Doe" value={form.name} onChange={set('name')} />
            )}
            <Field label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} />
            <Field label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />

            {error && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md text-xs"
                style={{ background: 'rgba(247,129,102,0.08)', border: '1px solid rgba(247,129,102,0.25)', color: 'var(--red)' }}>
                <span className="mono">!</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 mt-2"
              style={{ background: 'var(--blue)', color: '#08090d' }}>
              {loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-xs transition-colors" style={{ color: 'var(--muted)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span style={{ color: 'var(--blue)' }}>{mode === 'login' ? 'Sign up' : 'Sign in'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>{label}</label>
      <input {...props} />
    </div>
  );
}
