'use client';
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
  upload: (
    <path d="M8 11V3M8 3L5 6M8 3L11 6M3 13H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  grid: (
    <g stroke="currentColor" strokeWidth="1.4" fill="none">
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1"/>
      <rect x="9" y="2.5" width="4.5" height="7" rx="1"/>
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/>
      <rect x="9" y="11.5" width="4.5" height="2" rx="1"/>
    </g>
  ),
  brain: (
    <path d="M5.5 2.5C4 2.5 3 3.5 3 5C2 5.3 1.5 6.2 1.5 7C1.5 8 2.3 8.8 3 9C3 10.5 4 11.5 5.5 11.5M5.5 2.5C6.5 2.5 7 3 7 4V10C7 11 6.5 11.5 5.5 11.5M5.5 2.5V11.5M10.5 2.5C12 2.5 13 3.5 13 5C14 5.3 14.5 6.2 14.5 7C14.5 8 13.7 8.8 13 9C13 10.5 12 11.5 10.5 11.5M10.5 2.5C9.5 2.5 9 3 9 4V10C9 11 9.5 11.5 10.5 11.5M10.5 2.5V11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  ),
};

export default function Sidebar({ connected, onUploadClick, onDashboardClick, hasDataset, activeView, user }: Props) {
  const { signOut } = useAuth();
  const initial = user.name?.[0]?.toUpperCase() || '?';

  return (
    <aside className="w-[60px] flex flex-col items-center py-4 flex-shrink-0"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="w-8 h-8 rounded-md flex items-center justify-center mb-6" style={{ background: 'var(--blue)' }}>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path d="M2 9L4.5 5L7 7L10 2" stroke="#08090d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5">
        <NavBtn icon={Icon.upload} label="Upload" active={activeView === 'upload'} onClick={onUploadClick} />
        <NavBtn icon={Icon.grid} label="Dashboard" active={activeView === 'dashboard'} onClick={onDashboardClick} disabled={!hasDataset} />
      </nav>

      <div className="flex-1" />

      {/* Connection status */}
      <div className="mb-4 group relative">
        <div className="w-8 h-8 rounded-md flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: connected ? 'var(--green)' : 'var(--red)' }} />
        </div>
        <Tooltip text={connected ? 'Live connection' : 'Reconnecting…'} />
      </div>

      {/* User avatar + signout */}
      <div className="group relative">
        <button onClick={signOut}
          className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold transition-colors mono"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
          {initial}
        </button>
        <Tooltip text={`${user.name} — sign out`} />
      </div>
    </aside>
  );
}

function NavBtn({ icon, label, active, onClick, disabled }: any) {
  return (
    <div className="group relative">
      <button onClick={onClick} disabled={disabled}
        className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
        style={{
          background: active ? 'var(--blue-bg)' : 'transparent',
          color: active ? 'var(--blue)' : disabled ? 'var(--dim)' : 'var(--muted)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: active ? '1px solid var(--blue-border)' : '1px solid transparent',
        }}>
        <svg width="16" height="16" viewBox="0 0 16 16">{icon}</svg>
      </button>
      <Tooltip text={label} />
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
      style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
      {text}
    </div>
  );
}
