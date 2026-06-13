'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

interface Props {
  connected: boolean;
  onUploadClick: () => void;
  onDashboardClick: () => void;
  hasDataset: boolean;
  activeView: string;
  user: { name: string; email: string; role: string };
}

const Icon = {
  upload: <path d="M8 11V3M8 3L5 6M8 3L11 6M3 13H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  grid: (
    <g stroke="currentColor" strokeWidth="1.8" fill="none">
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2"/>
      <rect x="9" y="2.5" width="4.5" height="7" rx="1.2"/>
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2"/>
      <rect x="9" y="11.5" width="4.5" height="2" rx="1"/>
    </g>
  ),
};

// Top navbar (desktop + mobile) + bottom tab bar (mobile only)
export default function Sidebar({ connected, onUploadClick, onDashboardClick, hasDataset, activeView, user }: Props) {
  const { signOut } = useAuth();
  const initial = user.name?.[0]?.toUpperCase() || '?';

  return (
    <>
      {/* Top navbar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 glass relative z-30"
        style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', minHeight: '64px', background: 'rgba(10,11,18,0.7)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative flex-shrink-0" style={{ background: 'var(--grad-1)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L5.5 6L9 9L14 2" stroke="#05060A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight hidden sm:block">DataPulse</span>
        </div>

        {/* Desktop nav pills */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl" style={{ background: 'var(--glass-2)' }}>
          <NavPill icon={Icon.upload} label="Upload" active={activeView === 'upload'} onClick={onUploadClick} />
          <NavPill icon={Icon.grid} label="Dashboard" active={activeView === 'dashboard'} onClick={onDashboardClick} disabled={!hasDataset} />
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'var(--glass-2)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: connected ? 'var(--lime)' : 'var(--coral)', boxShadow: connected ? '0 0 8px var(--lime)' : '0 0 8px var(--coral)' }} />
            <span className="text-xs font-medium mono" style={{ color: 'var(--muted)' }}>{connected ? 'Live' : 'Offline'}</span>
          </div>
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={signOut}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--grad-2)', color: '#05060A' }}>
            {initial}
          </motion.button>
        </div>
      </header>

      {/* Bottom mobile tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-6 py-3 glass"
        style={{ borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none', background: 'rgba(10,11,18,0.85)' }}>
        <TabBtn icon={Icon.upload} label="Upload" active={activeView === 'upload'} onClick={onUploadClick} />
        <TabBtn icon={Icon.grid} label="Dashboard" active={activeView === 'dashboard'} onClick={onDashboardClick} disabled={!hasDataset} />
      </nav>
    </>
  );
}

function NavPill({ icon, label, active, onClick, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="relative px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
      style={{ color: active ? '#05060A' : disabled ? 'var(--dim)' : 'var(--muted)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {active && <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl -z-10" style={{ background: 'var(--grad-1)' }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />}
      <svg width="15" height="15" viewBox="0 0 16 16" className="relative z-10">{icon}</svg>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function TabBtn({ icon, label, active, onClick, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1 px-6 py-1"
      style={{ color: active ? 'var(--cyan)' : disabled ? 'var(--dim)' : 'var(--muted)' }}>
      <svg width="20" height="20" viewBox="0 0 16 16">{icon}</svg>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
