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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg)' }}>
      {/* Aurora mesh */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full aurora" style={{ background: 'var(--cyan)', opacity: 0.18 }} />
        <div className="absolute top-[20%] right-[-15%] w-[550px] h-[550px] rounded-full aurora aurora-2" style={{ background: 'var(--violet)', opacity: 0.16 }} />
        <div className="absolute bottom-[-25%] left-[20%] w-[500px] h-[500px] rounded-full aurora aurora-3" style={{ background: 'var(--coral)', opacity: 0.14 }} />
      </div>
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E")' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-[28px] p-8 sm:p-10 glass"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-9">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center relative" style={{ background: 'var(--grad-1)' }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L5.5 6L9 9L14 2" stroke="#05060A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--grad-1)', filter: 'blur(16px)', opacity: 0.6, zIndex: -1 }} />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">DataPulse</p>
            <p className="text-xs mono" style={{ color: 'var(--dim)' }}>analytics OS</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              {mode === 'login' ? 'Sign in to continue to your dashboards' : 'Start exploring your data with AI'}
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
                className="px-4 py-3 rounded-2xl text-sm" style={{ background: 'rgba(255,111,156,0.08)', border: '1px solid rgba(255,111,156,0.2)', color: 'var(--coral)' }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity disabled:opacity-60 mt-1 relative overflow-hidden"
            style={{ background: 'var(--grad-1)', color: '#05060A' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-1.5">
                {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" style={{ animationDelay: `${i*0.15}s` }} />)}
              </span>
            ) : mode === 'login' ? 'Sign in' : 'Create account'}
          </motion.button>
        </form>

        <div className="mt-7 pt-6 text-center" style={{ borderTop: '1px solid var(--glass-br)' }}>
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            {mode === 'login' ? "New here? " : 'Already have an account? '}
            <span className="grad-text-1 font-bold">{mode === 'login' ? 'Create an account' : 'Sign in'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>{label}</label>
      <input {...props} />
    </div>
  );
}
