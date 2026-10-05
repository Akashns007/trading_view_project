import { Activity, BarChart3, Bolt, LayoutDashboard, ListFilter, Settings, Wifi } from 'lucide-react'
import type { ReactNode } from 'react'

export type AppView = 'dashboard' | 'scanner' | 'profile' | 'stocks' | 'monitor' | 'history' | 'settings'

const nav: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scanner', label: 'Scanner', icon: ListFilter },
  { id: 'profile', label: 'Levels & charts', icon: BarChart3 },
  { id: 'stocks', label: 'Instrument universe', icon: Activity },
  { id: 'settings', label: 'Settings & Watchlist', icon: Settings },
  { id: 'monitor', label: 'Data monitor', icon: Wifi },
  { id: 'history', label: 'History', icon: Activity },
]

export function Layout({ view, onNavigate, children }: { view: AppView; onNavigate: (view: AppView) => void; children: ReactNode; live?: boolean; liveState?: { connected: boolean }; onToggleLive?: () => void; dataMode?: string }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Bolt size={19} fill="currentColor" /></div><div><strong>flowstate</strong><span>NSE MARKET INTEL</span></div></div>
      <nav className="main-nav" aria-label="Primary navigation">
        <div className="nav-label">WORKSPACE</div>
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'active' : ''} aria-label={label} onClick={() => onNavigate(id)}><Icon size={17} /><span>{label}</span></button>)}
      </nav>
      <div className="sidebar-bottom"><div className="connection"><Wifi size={15} /><span>NSE Real-Time</span><i /></div><small>Market Analytics Platform</small></div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div className="mobile-brand">
          <div className="brand-mark"><Bolt size={17} fill="currentColor" /></div>
          <strong>flowstate</strong>
        </div>
        <div className="topbar-right">
          <div className="status-pill">
            <i />
            <span>NSE Active Feed</span>
          </div>
        </div>
      </header>
      <div className="page-content">{children}</div>
    </main>
  </div>
}
