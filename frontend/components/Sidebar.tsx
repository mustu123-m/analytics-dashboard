'use client';
import { BarChart2, Upload, Activity, Brain, Wifi, WifiOff } from 'lucide-react';

interface Props {
  connected: boolean;
  onUploadClick: () => void;
  onDashboardClick: () => void;
  hasDataset: boolean;
  activeView: string;
}

export default function Sidebar({ connected, onUploadClick, onDashboardClick, hasDataset, activeView }: Props) {
  return (
    <aside className="w-16 md:w-56 flex flex-col border-r py-4 px-2 md:px-4 gap-1 flex-shrink-0"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
          <BarChart2 size={16} color="white" />
        </div>
        <span className="hidden md:block font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>
          DataPulse
        </span>
      </div>

      {/* Nav items */}
      <NavItem icon={<Upload size={16} />} label="Upload" active={activeView === 'upload'} onClick={onUploadClick} />
      <NavItem icon={<BarChart2 size={16} />} label="Dashboard" active={activeView === 'dashboard'} onClick={onDashboardClick} disabled={!hasDataset} />
      <NavItem icon={<Brain size={16} />} label="AI Insights" active={false} onClick={onDashboardClick} disabled={!hasDataset} />

      {/* Footer */}
      <div className="mt-auto px-2 py-2 flex items-center gap-2">
        {connected
          ? <Wifi size={12} style={{ color: 'var(--success)' }} />
          : <WifiOff size={12} style={{ color: 'var(--danger)' }} />}
        <span className="hidden md:block text-xs" style={{ color: connected ? 'var(--success)' : 'var(--danger)' }}>
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 px-2 py-2.5 rounded-lg w-full text-left transition-all"
      style={{
        background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
        color: active ? 'var(--accent)' : disabled ? 'var(--text-dim)' : 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon}
      <span className="hidden md:block text-sm font-medium">{label}</span>
    </button>
  );
}
