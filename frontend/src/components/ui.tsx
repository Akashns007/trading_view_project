import type { ReactNode } from 'react'
import type { DataQuality } from '../types'
import { AlertCircle, ArrowDown, ArrowUp, ChevronRight, Inbox, RefreshCw } from 'lucide-react'

export function DataBadge({ mode = 'mock', exact = false }: { mode?: string; exact?: boolean }) {
  const label = exact ? 'EXACT TRADE DATA' : mode === 'mock' ? 'MOCK DATA' : mode.toUpperCase()
  return <span className={`data-badge ${exact || mode === 'exact' ? 'exact' : 'mock'}`} title="Data provenance"><span className="badge-dot" />{label}</span>
}

export function QualityBadge({ value, detail }: { value?: string | DataQuality; detail?: string }) {
  const raw = typeof value === 'object' && value ? value.label || value.state || value.status : value
  const label = raw || 'PARTIAL'
  const normalized = label.toLowerCase()
  const tone = normalized.includes('exact') || normalized.includes('complete') || normalized.includes('ok') ? 'quality-exact' : normalized.includes('missing') || normalized.includes('unavailable') || normalized.includes('invalid') || normalized.includes('low liquidity') ? 'quality-missing' : 'quality-partial'
  return <span className={`quality-badge ${tone}`} title={detail || (typeof value === 'object' ? value.reason : undefined)}>{label.toUpperCase()}</span>
}

export function LiveBadge({ connected, polling }: { connected: boolean; polling?: boolean }) {
  return <span className={`live-badge ${connected ? 'is-live' : ''}`}><span className="live-dot" />{connected ? (polling ? 'POLLING' : 'LIVE') : 'OFFLINE'}</span>
}

export function LoadingState({ label = 'Loading market data' }: { label?: string }) {
  return <div className="state-card"><RefreshCw className="spin" size={20} /><span>{label}…</span></div>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="state-card error-state"><AlertCircle size={21} /><div><strong>Couldn’t load this view</strong><p>{message}</p>{retry && <button className="button subtle" onClick={retry}>Try again</button>}</div></div>
}

export function EmptyState({ title = 'No data found', detail = 'Try changing the filters or selected date.' }: { title?: string; detail?: string }) {
  return <div className="state-card empty-state"><Inbox size={22} /><div><strong>{title}</strong><p>{detail}</p></div></div>
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>
}

export function StatCard({ label, value, detail, tone = 'default', icon }: { label: string; value: string; detail?: string; tone?: 'default' | 'positive' | 'warning' | 'accent'; icon?: ReactNode }) {
  return <article className={`stat-card ${tone}`}><div className="stat-top"><span>{label}</span>{icon}</div><strong>{value}</strong>{detail && <small>{detail}</small>}</article>
}

export function DirectionValue({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  if (value === null || Number.isNaN(value)) return <span className="muted">—</span>
  const up = value >= 0
  return <span className={up ? 'positive' : 'negative'}>{up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(value).toFixed(2)}{suffix}</span>
}

export function Breadcrumb({ parent, current, onParent }: { parent: string; current: string; onParent: () => void }) {
  return <div className="breadcrumb"><button onClick={onParent}>{parent}</button><ChevronRight size={14} /><span>{current}</span></div>
}

export const formatNumber = (value: number | null | undefined, decimals = 0) => value === null || value === undefined || Number.isNaN(value) ? '—' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value)
export const formatPrice = (value: number | null | undefined) => value === null || value === undefined || Number.isNaN(value) ? '—' : `₹${formatNumber(value, 2)}`
export const compactNumber = (value: number | null | undefined) => value === null || value === undefined ? '—' : new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export function CircularProgress({
  value,
  max = 100,
  size = 130,
  strokeWidth = 10,
  label = 'available'
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const percentage = Math.min(Math.max(Math.round((value / (max || 1)) * 100), 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="circular-progress-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="circular-progress-svg">
        <circle
          className="progress-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-circle-bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="circular-progress-content">
        <strong>{percentage}%</strong>
        <small>{label}</small>
      </div>
    </div>
  )
}

