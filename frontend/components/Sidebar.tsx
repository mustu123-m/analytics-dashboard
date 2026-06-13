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
  upload: <path d="M8 11V3M8 3L5 6M8 3L11 6M3 13H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  grid: (
    <g stroke="currentColor" strokeWidth="1.6" fill="none">
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2"/>
      <rect x="9" y="2.5" width="4.5" height="7" rx="1.2"/>
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2"/>
      <rect x="9" y="11.5" width="4.5" height="2" rx="1"/>
    </g>
  ),
};

export default function Sidebar({ connected, onUploadClick, onDashboardClick, hasDataset, activeView, user }: Props) {
  const { signOut } = useAuth();
  const initial = user.name?.[0]?.toUpperCase() || '?';

  return (
    <aside className="w-[76px] flex flex-col items-center py-5 flex-shrink-0 relative z-20"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

      <motion.div whileHover={{ rotate: 8, scale: 1.05 }} className="w-10 h-10 rounded-2xl flex items-center justify-center mb-8 cursor-pointer"
        style={{ background: 'var(--grad)', boxShadow: 'var(--shadow-glow)' }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M2 12L5.5 6L9 9L14 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <nav className="flex flex-col gap-2">
        <NavBtn icon={Icon.upload} label="Upload" active={activeView === 'upload'} onClick={onUploadClick} />
        <NavBtn icon={Icon.grid} label="Dashboard" active={activeView === 'dashboard'} onClick={onDashboardClick} disabled={!hasDataset} />
      </nav>

      <div className="flex-1" />

      <div className="mb-3 group relative">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
          <span className="w-2 h-2 rounded-full" style={{ background: connected ? 'var(--green)' : 'var(--red)', boxShadow: connected ? '0 0 0 4px rgba(45,212,167,0.15)' : '0 0 0 4px rgba(255,107,107,0.15)' }} />
        </div>
        <Tooltip text={connected ? 'Live' : 'Reconnecting…'} />
      </div>

      <div className="group relative">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={signOut}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'var(--grad)' }}>
          {initial}
        </motion.button>
        <Tooltip text={`${user.name} — sign out`} />
      </div>
    </aside>
  );
}

function NavBtn({ icon, label, active, onClick, disabled }: any) {
  return (
    <div className="group relative">
      <motion.button whileHover={!disabled ? { scale: 1.06 } : {}} whileTap={!disabled ? { scale: 0.94 } : {}}
        onClick={onClick} disabled={disabled}
        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors relative"
        style={{
          background: active ? 'var(--grad-soft)' : 'transparent',
          color: active ? 'var(--indigo)' : disabled ? 'var(--dim)' : 'var(--muted)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
        <svg width="18" height="18" viewBox="0 0 16 16">{icon}</svg>
        {active && <motion.div layoutId="nav-indicator" className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-full" style={{ background: 'var(--grad)' }} />}
      </motion.button>
      <Tooltip text={label} />
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
      style={{ background: 'var(--text)', color: 'white', boxShadow: 'var(--shadow-md)' }}>
      {text}
    </div>
  );
}
