'use client';
import { useState } from 'react';
import { BarChart2, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
            <BarChart2 size={20} color="white" />
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>DataPulse</span>
        </div>

        <div className="p-8 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Sign in to your analytics dashboard' : 'Start analyzing your data with AI'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <Field icon={<User size={15} />} type="text" placeholder="Full name" value={form.name} onChange={set('name')} />
            )}
            <Field icon={<Mail size={15} />} type="email" placeholder="Email address" value={form.email} onChange={set('email')} />
            <Field icon={<Lock size={15} />} type="password" placeholder="Password" value={form.password} onChange={set('password')} />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-dim)' }}>
          Demo: register any email & password to get started
        </p>
      </div>
    </div>
  );
}

function Field({ icon, ...props }: any) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <input className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text)' }} {...props} />
    </div>
  );
}
