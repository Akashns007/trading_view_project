import { ArrowLeft, ArrowUpRight, Calendar, CandlestickChart, Layers3, RefreshCw, Target, Waves } from 'lucide-react'
import { useState } from 'react'
import type { LiveState, ScannerFilters, VolumeLevel, VolumeProfile } from '../types'
import { IntradayChart, ProfileLegend, VolumeProfileChart, levelShare } from '../components/charts'
import { Breadcrumb, compactNumber, EmptyState, ErrorState, formatNumber, formatPrice, LoadingState, SectionHeading, StatCard } from '../components/ui'

function sideLevels(profile: VolumeProfile, side: 'ABOVE' | 'BELOW'): VolumeLevel[] {
  return (side === 'ABOVE' ? profile.aboveLevels : profile.belowLevels) || []
}

function backendGap(level: VolumeLevel) {
  return { signedGap: level.signedGap ?? null, pointGap: level.pointGap ?? null, gapPercent: level.gapPercent ?? null }
}

function LevelTable({ profile, side }: { profile: VolumeProfile; side: 'ABOVE' | 'BELOW' }) {
  const levels = sideLevels(profile, side)
  return (
    <div className={`direction-levels ${side === 'ABOVE' ? 'direction-above' : 'direction-below'}`}>
      <div className="direction-title">
        <span>{side === 'ABOVE' ? 'HIGH-VOLUME LEVELS ABOVE' : 'HIGH-VOLUME LEVELS BELOW'}</span>
        <small>Ranked by executed quantity · not a signal</small>
      </div>
      {levels.length ? (
        levels.map((level, index) => {
          const gap = backendGap(level)
          return (
            <div className="direction-level" key={`${side}-${level.price}`}>
              <span className="direction-rank">#{level.rank ?? index + 1}</span>
              <strong>{formatPrice(level.price)}</strong>
              <span>
                <b>{formatNumber(level.volume)} qty</b>
                <small>{formatNumber(level.tradeCount)} trades</small>
              </span>
              <span className={gap.signedGap !== null && gap.signedGap >= 0 ? 'positive' : 'negative'}>
                <b>{gap.signedGap === null ? '—' : `${gap.signedGap >= 0 ? '+' : ''}${formatNumber(gap.signedGap, 2)} pts`}</b>
                <small>{gap.gapPercent === null ? 'Gap % —' : `Gap % ${gap.gapPercent >= 0 ? '+' : ''}${formatNumber(gap.gapPercent, 2)}%`}</small>
              </span>
            </div>
          )
        })
      ) : (
        <div className="direction-empty">No qualifying {side.toLowerCase()} levels for this session.</div>
      )}
    </div>
  )
}

export function Profile({
  profile,
  loading,
  error,
  retry,
  live,
  liveState,
  filters,
  setFilters,
  onBack,
  onToggleLive,
  onSelectAnother
}: {
  profile: VolumeProfile | null
  loading: boolean
  error: string | null
  retry: () => void
  live: boolean
  liveState: LiveState
  filters: ScannerFilters
  setFilters: (filters: ScannerFilters) => void
  onBack: () => void
  onToggleLive: () => void
  onSelectAnother: () => void
}) {
  // Turn off Above/Below levels by default to keep the chart clean and prevent label clutter
  const [showOpen, setShowOpen] = useState(true)
  const [showAbove, setShowAbove] = useState(false)
  const [showBelow, setShowBelow] = useState(false)
  const [showCurrent, setShowCurrent] = useState(true)
  const [showSinglePrints, setShowSinglePrints] = useState(true)

  if (loading) return <div className="profile-page"><Breadcrumb parent="Scanner" current="Loading profile" onParent={onBack} /><LoadingState label="Loading previous-open levels" /></div>
  if (error) return <div className="profile-page"><Breadcrumb parent="Scanner" current="Profile" onParent={onBack} /><ErrorState message={error} retry={retry} /></div>
  if (!profile) return <div className="profile-page"><Breadcrumb parent="Scanner" current="Profile" onParent={onBack} /><EmptyState title="Select an instrument" detail="Choose a row in the scanner to inspect its previous-open levels." /></div>

  const open = profile.previousDayOpen ?? profile.previousOpen
  const highest = profile.topLevels || profile.levels || []
  const activeDate = profile.selectedDate || profile.previousSessionDate || profile.date
  const singlePrints = profile.singlePrints || []
  const availableDates = profile.availableDates || [activeDate]

  return (
    <div className="profile-page">
      <Breadcrumb parent="Scanner" current={profile.symbol} onParent={onBack} />

      <div className="profile-title">
        <div>
          <div className="eyebrow">INSTRUMENT DETAIL / {profile.sector || 'NSE F&O'}</div>
          <h1>{profile.symbol}<span className="accent">.</span></h1>
          <p>{profile.name || 'Previous-open volume levels'} · Reference Session: {activeDate}</p>
        </div>
        <div className="profile-actions">
          {/* Date / Calendar Selector */}
          <div className="date-selector-group">
            <Calendar size={15} className="date-icon" />
            <span className="date-label">Session:</span>
            <select
              className="session-date-dropdown"
              value={activeDate}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            >
              {availableDates.map((d, i) => (
                <option key={d} value={d}>
                  {d} {i === 0 ? '(Yesterday / Latest)' : `(${i}d ago)`}
                </option>
              ))}
            </select>
          </div>

          <label className="select-field profile-bucket">
            <span>Bucket</span>
            <select
              value={filters.bucket}
              onChange={(event) => setFilters({ ...filters, bucket: Number(event.target.value) })}
            >
              <option value={0.05}>Exact tick / ₹0.05</option>
              <option value={1}>₹1</option>
              <option value={5}>₹5</option>
              <option value={10}>₹10</option>
            </select>
          </label>
          <button className="button subtle" onClick={onSelectAnother}>
            <RefreshCw size={15} />Change symbol
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <StatCard
          label="Reference Day Open"
          value={formatPrice(open)}
          detail={`Session ${activeDate}`}
          icon={<CandlestickChart size={16} />}
        />
        <StatCard
          label="Single Prints (TPO)"
          value={`${singlePrints.length} Zones`}
          detail={singlePrints.length > 0 ? `${singlePrints.filter(s => s.type === 'BUYING').length} Buy / ${singlePrints.filter(s => s.type === 'SELLING').length} Sell` : 'No single prints'}
          tone={singlePrints.length > 0 ? 'accent' : 'default'}
          icon={<Target size={16} />}
        />
        <StatCard
          label="Current price"
          value={formatPrice(profile.currentPrice)}
          detail={`${formatNumber(profile.tradeCount)} trades · ${formatNumber(profile.totalVolume)} qty`}
          icon={<Layers3 size={16} />}
        />
        <StatCard
          label="Data quality"
          value="Real Exchange Data"
          detail="Traceable session result"
          tone="positive"
          icon={<ArrowUpRight size={16} />}
        />
      </div>

      {/* Main TradingView Candlestick Chart Section */}
      <section className="panel gap-panel">
        <SectionHeading
          eyebrow={`TRADINGVIEW CHART / REFERENCE SESSION ${activeDate}`}
          title="Price Action with Clean Single Prints Overlays"
          detail="Interactive candlestick chart. Choose visible overlays below (clean single print levels enabled by default)."
          action={liveState.updatedAt && <span className="updated-at"><Waves size={14} />Updated {liveState.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        />

        {/* Clean Chart Toggles */}
        <div className="chart-toggles">
          <label className="toggle-highlight">
            <input type="checkbox" checked={showSinglePrints} onChange={(event) => setShowSinglePrints(event.target.checked)} />
            Single Prints (TPO) ({singlePrints.length})
          </label>
          <label>
            <input type="checkbox" checked={showOpen} onChange={(event) => setShowOpen(event.target.checked)} />
            Previous open
          </label>
          <label>
            <input type="checkbox" checked={showCurrent} onChange={(event) => setShowCurrent(event.target.checked)} />
            Current price
          </label>
          <label className="toggle-dimmed">
            <input type="checkbox" checked={showAbove} onChange={(event) => setShowAbove(event.target.checked)} />
            Above volume levels
          </label>
          <label className="toggle-dimmed">
            <input type="checkbox" checked={showBelow} onChange={(event) => setShowBelow(event.target.checked)} />
            Below volume levels
          </label>
        </div>

        <div className="intraday-layout">
          <IntradayChart
            series={profile.priceSeries}
            profile={profile}
            showOpen={showOpen}
            showAbove={showAbove}
            showBelow={showBelow}
            showCurrent={showCurrent}
            showSinglePrints={showSinglePrints}
          />
          <div className="gap-analysis">
            <div className="gap-card">
              <span>Reference Open</span>
              <strong>{formatPrice(open)}</strong>
              <small>Session {activeDate}</small>
            </div>
            <div className="gap-card emphasis">
              <span>Current Price</span>
              <strong>{formatPrice(profile.currentPrice)}</strong>
              <small>Latest Trade Print</small>
            </div>
            <div className="gap-footnote">
              <span className="legend-prev" />
              <span>Signed gap {profile.signedGap === null || profile.signedGap === undefined ? '—' : `${profile.signedGap >= 0 ? '+' : ''}${formatNumber(profile.signedGap, 2)} pts`}</span>
              <span>Single prints mark unfair price zones from session {activeDate}.</span>
            </div>
          </div>
        </div>

        {/* Single Prints Inspection Card */}
        {singlePrints.length > 0 && (
          <div className="sp-breakdown-card">
            <div className="sp-card-header">
              <strong>Single Prints Detected for {activeDate}:</strong>
              <small>30-minute TPO brackets where price moved with extreme momentum</small>
            </div>
            <div className="sp-chips-grid">
              {singlePrints.map((sp) => (
                <div key={sp.id} className={`sp-chip-item ${sp.type === 'BUYING' ? 'sp-chip-buy' : 'sp-chip-sell'}`}>
                  <span className="sp-chip-bracket">Bracket {sp.bracket}</span>
                  <span className="sp-chip-range">₹{sp.low.toFixed(2)} - ₹{sp.high.toFixed(2)}</span>
                  <span className="sp-chip-type">{sp.type === 'BUYING' ? 'Buying Support' : 'Selling Resistance'}</span>
                  <span className="sp-chip-status">{sp.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* High-Volume Directional Levels Section */}
      <section className="panel levels-panel primary-levels">
        <SectionHeading
          eyebrow="PREVIOUS-OPEN OUTPUT"
          title="High-volume price levels"
          detail="Up to three levels per side. The reference itself is excluded; distance is derived per level."
        />
        <div className="direction-grid">
          <LevelTable profile={profile} side="ABOVE" />
          <LevelTable profile={profile} side="BELOW" />
        </div>
      </section>

      {/* Volume by Price Audit Grid */}
      <div className="profile-grid">
        <section className="panel volume-panel">
          <SectionHeading eyebrow="AUDIT VIEW" title="Volume by price" detail="Complete executed-quantity profile for the selected bucket." />
          <ProfileLegend />
          <VolumeProfileChart profile={{ ...profile, levels: profile.levels || highest }} />
        </section>
        <section className="panel levels-panel">
          <SectionHeading eyebrow="CALCULATION TRACE" title="Selected level rows" detail={`Top ${filters.topLevels} levels, ranked by the backend.`} />
          <div className="levels-table">
            <div className="levels-header"><span>PRICE</span><span>VOLUME</span><span>SHARE</span></div>
            {highest.length ? (
              highest.map((level) => (
                <div className="level-row" key={level.price}>
                  <span><b>{formatPrice(level.price)}</b>{level.price === open && <em>OPEN</em>}</span>
                  <span><strong>{compactNumber(level.volume)}</strong><small>{formatNumber(level.tradeCount)} trades</small></span>
                  <span className="level-bar-wrap">
                    <i style={{ width: `${Math.max((level.volume / Math.max(highest[0].volume, 1)) * 100, 4)}%` }} />
                    <small>{levelShare(level)}</small>
                  </span>
                </div>
              ))
            ) : (
              <EmptyState title="No price levels" detail="There are no trades for this profile." />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
