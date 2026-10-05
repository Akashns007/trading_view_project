import { ArrowDownAZ, ChevronDown, Search, Star } from 'lucide-react'
import { useState } from 'react'
import { api } from '../api'
import type { ScannerFilters, ScannerResponse, ScannerRow, SortField, Stock, VolumeLevel } from '../types'
import { EmptyState, ErrorState, formatNumber, formatPrice, LoadingState, SectionHeading } from '../components/ui'

function levelsFor(row: ScannerRow, side: 'above' | 'below', max?: number): VolumeLevel[] {
  const list = row[`${side}Levels`] || []
  return max ? list.slice(0, max) : list
}
function levelText(levels: VolumeLevel[]) {
  if (!levels.length) return <span className="muted">—</span>
  return <span className="level-stack">{levels.map((level) => <span key={`${level.price}-${level.volume}`}><b>{formatPrice(level.price)}</b><small>{formatNumber(level.volume)} qty · {level.signedGap == null ? 'gap —' : `${level.signedGap >= 0 ? '+' : ''}${formatNumber(level.signedGap, 2)} pts`}</small></span>)}</span>
}

export function Scanner({ filters, setFilters, response, stocks, loading, error, retry, onSelect }: { filters: ScannerFilters; setFilters: (next: ScannerFilters) => void; response: ScannerResponse | null; stocks: Stock[]; loading: boolean; error: string | null; retry: () => void; onSelect: (symbol: string) => void }) {
  const rows = response?.rows || []
  const sectors = ['All sectors', ...Array.from(new Set((stocks.length ? stocks.map((stock) => stock.sector) : rows.map((row) => row.sector)).filter(Boolean))).sort()]
  const update = <K extends keyof ScannerFilters>(key: K, value: ScannerFilters[K]) => setFilters({ ...filters, [key]: value })
  const [wishlist, setWishlist] = useState<Set<string>>(() => new Set(stocks.filter(s => s.isWishlist).map(s => s.symbol)))

  const toggleWishlist = async (e: React.MouseEvent, sym: string, name?: string, sec?: string) => {
    e.stopPropagation()
    const isSaved = wishlist.has(sym)
    setWishlist(prev => {
      const next = new Set(prev)
      if (isSaved) next.delete(sym)
      else next.add(sym)
      return next
    })
    try {
      if (isSaved) await api.removeFromWatchlist(sym)
      else await api.addToWatchlist(sym, name || sym, sec || 'NSE Equities')
    } catch {
      // Revert on error
      setWishlist(prev => {
        const next = new Set(prev)
        if (isSaved) next.add(sym)
        else next.delete(sym)
        return next
      })
    }
  }

  return <div className="scanner-page"><div className="page-intro compact"><div><div className="eyebrow">NSE F&amp;O / PREVIOUS-OPEN ANALYTICS</div><h1>Market scanner<span className="accent">.</span></h1><p>Compare the previous session open with the three highest-volume levels above and below it.</p></div></div>
    <section className="panel scanner-panel"><SectionHeading eyebrow="SCAN PARAMETERS" title="Reference-level scan" detail="Rows and provenance come from the data service; click any star to save to wishlist." action={<span className="result-count">{loading ? '—' : `${response?.count || 0} instruments`}</span>} />
      <div className="filter-bar"><label className="search-field"><Search size={16} /><input value={filters.query} onChange={(event) => update('query', event.target.value)} placeholder="Search symbol or name…" /></label><label className="select-field"><span>Session</span><input type="date" value={filters.date} onChange={(event) => update('date', event.target.value)} /></label><label className="select-field"><span>Bucket</span><select value={filters.bucket} onChange={(event) => update('bucket', Number(event.target.value))}><option value={0.05}>₹0.05</option><option value={1}>₹1</option><option value={5}>₹5</option><option value={10}>₹10</option></select></label><label className="select-field"><span>Levels</span><select value={filters.topLevels} onChange={(event) => update('topLevels', Number(event.target.value))}><option value={1}>Top 1</option><option value={3}>Top 3</option><option value={5}>Top 5</option><option value={10}>Top 10</option></select></label><label className="select-field"><span>Side</span><select value={filters.direction} onChange={(event) => update('direction', event.target.value as ScannerFilters['direction'])}><option value="all">Both sides</option><option value="above">Above open</option><option value="below">Below open</option></select></label><label className="select-field"><span>Rows</span><select value={filters.limit} onChange={(event) => update('limit', event.target.value as ScannerFilters['limit'])}><option value="10">Top 10</option><option value="25">Top 25</option><option value="50">Top 50</option><option value="all">All</option></select></label></div>
      <div className="scanner-subfilters"><label className="select-field"><span>Sector</span><select value={filters.sector} onChange={(event) => update('sector', event.target.value)}>{sectors.map((sector) => <option key={sector}>{sector}</option>)}</select></label><label className="select-field"><span>Sort by</span><select value={filters.sort} onChange={(event) => update('sort', event.target.value as SortField)}><option value="symbol">Symbol</option><option value="previousOpen">Previous open</option><option value="currentPrice">Current price</option></select></label><label className="select-field"><span>Order</span><select value={filters.order} onChange={(event) => update('order', event.target.value as ScannerFilters['order'])}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label><label className="select-field"><span>Minimum quantity</span><input type="number" min="0" step="1000" value={filters.minVolume} onChange={(event) => update('minVolume', Number(event.target.value) || 0)} /></label><span>Session: {response?.date || '—'} · Active NSE Feed</span></div>
      {loading ? <LoadingState label="Loading reference-level observations" /> : error ? <ErrorState message={error} retry={retry} /> : !rows.length ? <EmptyState title="No instruments match" detail="Try another date or broaden the filters." /> : <div className="table-scroll"><table className="data-table scanner-table"><thead><tr><th>#</th><th>Instrument</th><th>Previous open</th><th>Above reference</th><th>Below reference</th><th>Current price</th><th>Quantity</th><th>Sector</th><th /></tr></thead><tbody>{rows.map((row, index) => { const above = levelsFor(row, 'above', filters.topLevels); const below = levelsFor(row, 'below', filters.topLevels); const isSaved = wishlist.has(row.symbol); return <tr key={row.symbol} onClick={() => onSelect(row.symbol)}><td className="td-rank">{String(index + 1).padStart(2, '0')}</td><td><div className="instrument"><button className={`wishlist-toggle-btn ${isSaved ? 'saved' : ''}`} onClick={(e) => toggleWishlist(e, row.symbol, row.name, row.sector)} title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} type="button"><Star size={14} fill={isSaved ? '#e8b863' : 'none'} color={isSaved ? '#e8b863' : '#6b7a90'} /></button><span className="stock-avatar">{row.symbol.slice(0, 2)}</span><span><strong>{row.symbol}</strong><small>{row.name}</small></span></div></td><td><strong>{formatPrice(row.previousOpen ?? row.previousDayOpen)}</strong><small className="table-sub">Previous session {row.previousSessionDate || response?.previousSessionDate || '—'}</small></td><td>{levelText(above)}</td><td>{levelText(below)}</td><td><strong>{formatPrice(row.currentPrice)}</strong><small className="table-sub">{row.currentPriceTime || row.currentPriceTimestamp || 'current snapshot'}</small></td><td><strong>{formatNumber(row.totalVolume)}</strong><small className="table-sub">{formatNumber(row.tradeCount)} observations</small></td><td><span className="sector-pill">{row.sector || 'NSE'}</span></td><td><ChevronDown className="table-chevron" size={16} /></td></tr> })}</tbody></table></div>}
      <div className="table-footer"><span><ArrowDownAZ size={14} /> Service sorted by <strong>{filters.sort === 'symbol' ? 'instrument' : filters.sort}</strong> {filters.order}</span><span>Bucket ₹{filters.bucket.toFixed(2)}</span></div>
    </section>
  </div>
}
