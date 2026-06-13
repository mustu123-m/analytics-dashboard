'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blob"
        style={{ background: 'radial-gradient(circle, var(--indigo) 0%, transparent 70%)', opacity: 0.35 }} />
      <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full blob blob-2"
        style={{ background: 'radial-gradient(circle, var(--pink) 0%, transparent 70%)', opacity: 0.3 }} />
      <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full blob blob-3"
        style={{ background: 'radial-gradient(circle, var(--amber) 0%, transparent 70%)', opacity: 0.2 }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10"
        style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--grad)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L5.5 6L9 9L14 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight">DataPulse</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">
              {mode === 'login' ? 'Welcome back' : 'Get started free'}
            </h1>
            <p className="text-sm mb-7" style={{ color: 'var(--muted)' }}>
              {mode === 'login' ? 'Sign in to access your dashboards' : 'Upload data, get AI insights in seconds'}
            </p>
          </motion.div>
        </AnimatePresence>

        <form onSubmit={submit} className="space-y-3.5">
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                <Field label="Full name" type="text" placeholder="Jane Doe" value={form.name} onChange={set('name')} />
              </motion.div>
            )}
          </AnimatePresence>
          <Field label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} />
          <Field label="Password" type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} />

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="px-3.5 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#E64545' }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-60 mt-1"
            style={{ background: 'var(--grad)', color: 'white', boxShadow: 'var(--shadow-glow)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-1.5">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white pulse-dot" style={{ animationDelay: `${i*0.15}s` }} />)}
              </span>
            ) : mode === 'login' ? 'Sign in' : 'Create account'}
          </motion.button>
        </form>

        <div className="mt-7 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            {mode === 'login' ? "New here? " : 'Already have an account? '}
            <span className="grad-text font-bold">{mode === 'login' ? 'Create an account' : 'Sign in'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>{label}</label>
      <input {...props} />
    </div>
  );
}
