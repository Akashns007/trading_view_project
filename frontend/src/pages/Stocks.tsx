import { Building2, ChevronRight, FileText, Plus, Search, Star, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import type { Stock, WatchlistItem } from '../types'
import { EmptyState, ErrorState, formatPrice, LoadingState, SectionHeading } from '../components/ui'

export function Stocks({
  stocks,
  loading,
  error,
  retry,
  onSelect
}: {
  stocks: Stock[]
  loading: boolean
  error: string | null
  retry: () => void
  onSelect: (symbol: string) => void
  dataMode?: string
}) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'wishlist'>('all')
  const [selectedSector, setSelectedSector] = useState('All')
  const [customSymbol, setCustomSymbol] = useState('')
  const [addingCustom, setAddingCustom] = useState(false)
  const [wishlistSymbols, setWishlistSymbols] = useState<Set<string>>(() => {
    return new Set(stocks.filter((s) => s.isWishlist).map((s) => s.symbol))
  })

  // Synchronize initial wishlist status
  useEffect(() => {
    if (stocks.length) {
      setWishlistSymbols(new Set(stocks.filter((s) => s.isWishlist).map((s) => s.symbol)))
    }
  }, [stocks])

  // Extract sectors
  const sectors = ['All', ...Array.from(new Set(stocks.map((s) => s.sector).filter(Boolean))).sort()]

  const toggleWishlist = async (e: React.MouseEvent, stock: Stock) => {
    e.stopPropagation()
    const sym = stock.symbol
    const isSaved = wishlistSymbols.has(sym)

    // Optimistic UI update
    setWishlistSymbols((prev) => {
      const next = new Set(prev)
      if (isSaved) next.delete(sym)
      else next.add(sym)
      return next
    })

    try {
      if (isSaved) {
        await api.removeFromWatchlist(sym)
      } else {
        await api.addToWatchlist(sym, stock.name, stock.sector)
      }
    } catch (err) {
      // Revert if error
      setWishlistSymbols((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(sym)
        else next.delete(sym)
        return next
      })
    }
  }

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    const sym = customSymbol.trim().toUpperCase().replace(/^(NSE|BSE):/, '')
    if (!sym) return
    setAddingCustom(true)
    try {
      await api.addCustomStock(sym, `${sym} Equities`, 'Custom Universe')
      setWishlistSymbols((prev) => new Set([...prev, sym]))
      setCustomSymbol('')
      retry()
    } catch {
      // Ignore
    } finally {
      setAddingCustom(false)
    }
  }

  const visible = stocks.filter((stock) => {
    const matchesQuery = `${stock.symbol} ${stock.name} ${stock.sector}`.toLowerCase().includes(query.toLowerCase())
    const matchesSector = selectedSector === 'All' || stock.sector.toLowerCase() === selectedSector.toLowerCase()
    const matchesTab = activeTab === 'all' || wishlistSymbols.has(stock.symbol)
    return matchesQuery && matchesSector && matchesTab
  })

  const wishlistCount = stocks.filter((s) => wishlistSymbols.has(s.symbol)).length

  return (
    <div className="stocks-page">
      <div className="page-intro compact">
        <div>
          <div className="eyebrow">UNIVERSE / NSE EQUITIES &amp; F&amp;O</div>
          <h1>Instrument Universe<span className="accent">.</span></h1>
          <p>Explore all available NSE instruments, manage your wishlist, or add any stock to track.</p>
        </div>
      </div>

      <section className="panel">
        <div className="universe-toolbar">
          {/* Tabs */}
          <div className="universe-tabs">
            <button
              className={`univ-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Instruments ({stocks.length})
            </button>
            <button
              className={`univ-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Star size={13} className={activeTab === 'wishlist' ? 'star-filled' : ''} />
              Wishlist ({wishlistCount})
            </button>
          </div>

          {/* Quick Add Custom Stock Input */}
          <form className="quick-add-form" onSubmit={handleAddCustom}>
            <input
              type="text"
              placeholder="Add stock (e.g. SUZLON, TRENT)…"
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
            />
            <button type="submit" className="button primary compact-btn" disabled={addingCustom || !customSymbol.trim()}>
              <Plus size={14} /> Add
            </button>
          </form>
        </div>

        <SectionHeading
          eyebrow="NSE UNIVERSE EXPLORER"
          title={activeTab === 'all' ? 'All Tracked Stocks' : 'Wishlist Stocks'}
          detail="Click any stock to view its levels & TradingView chart, or click the star to save to your wishlist."
          action={
            <div className="universe-filters-action">
              <select
                className="sector-select"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Sectors' : s}
                  </option>
                ))}
              </select>
              <label className="search-field compact-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter stocks…"
                />
              </label>
            </div>
          }
        />

        {loading ? (
          <LoadingState label="Loading comprehensive stock universe" />
        ) : error ? (
          <ErrorState message={error} retry={retry} />
        ) : !visible.length ? (
          <EmptyState
            title={activeTab === 'wishlist' ? 'Wishlist is empty' : 'No stocks found'}
            detail={
              activeTab === 'wishlist'
                ? 'Click the star icon on any stock or import a TradingView watchlist in Settings.'
                : 'Try clearing the search query or sector filter.'
            }
          />
        ) : (
          <div className="stock-grid">
            {visible.map((stock) => {
              const isSaved = wishlistSymbols.has(stock.symbol)
              return (
                <div
                  className="stock-card"
                  key={stock.symbol}
                  onClick={() => onSelect(stock.symbol)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="stock-avatar large">{stock.symbol.slice(0, 2)}</span>
                  <span>
                    <strong>{stock.symbol}</strong>
                    <small>{stock.name}</small>
                    <em>{stock.sector}</em>
                  </span>
                  <span className="stock-open">
                    <small>PREV OPEN</small>
                    <b>{formatPrice(stock.previousOpen)}</b>
                  </span>
                  <button
                    className={`wishlist-toggle-btn ${isSaved ? 'saved' : ''}`}
                    title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    onClick={(e) => toggleWishlist(e, stock)}
                    type="button"
                  >
                    <Star size={16} fill={isSaved ? '#e8b863' : 'none'} color={isSaved ? '#e8b863' : '#6b7a90'} />
                  </button>
                  <ChevronRight size={16} className="stock-chevron" />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export function Settings({ health }: { health?: import('../types').Health | null }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('flowstate-theme') || 'dark')
  const [rawWatchlistText, setRawWatchlistText] = useState('')
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [savedWatchlist, setSavedWatchlist] = useState<WatchlistItem[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('flowstate-theme', theme)
  }, [theme])

  // Load saved watchlist items from SQLite
  const loadSavedWatchlist = async () => {
    try {
      const items = await api.watchlist()
      setSavedWatchlist(items)
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    loadSavedWatchlist()
  }, [])

  const handleImportText = async (textToImport: string) => {
    if (!textToImport.trim()) return
    setIsImporting(true)
    setImportStatus(null)
    try {
      const res = await api.importWatchlist(textToImport)
      const count = res.imported?.length || res.count || 0
      setImportStatus(`Successfully imported ${count} stocks to SQLite database!`)
      setRawWatchlistText('')
      loadSavedWatchlist()
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message || 'Unknown error'}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        handleImportText(content)
      }
    }
    reader.readAsText(file)
  }

  const handleDeleteWatchlistSymbol = async (symbol: string) => {
    try {
      await api.removeFromWatchlist(symbol)
      setSavedWatchlist((prev) => prev.filter((item) => item.symbol !== symbol))
    } catch {
      // Ignore
    }
  }

  return (
    <div className="settings-page">
      <div className="page-intro compact">
        <div>
          <div className="eyebrow">SYSTEM / CONFIGURATION &amp; WATCHLIST</div>
          <h1>Settings &amp; Watchlist<span className="accent">.</span></h1>
          <p>Import TradingView watchlists (.txt), manage your saved stocks, and configure terminal preferences.</p>
        </div>
      </div>

      {/* TradingView Watchlist Import Panel */}
      <section className="panel tv-import-panel">
        <SectionHeading
          eyebrow="TRADINGVIEW INTEGRATION"
          title="Import TradingView Watchlist"
          detail="Upload the .txt export file downloaded from TradingView or paste comma-separated tickers. All stocks are stored in the SQLite database."
        />

        <div className="import-grid">
          {/* File Upload Box */}
          <div
            className="file-drop-area"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              type="file"
              accept=".txt,.csv"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Upload size={28} className="upload-icon" />
            <strong>Upload TradingView .txt file</strong>
            <small>Click to browse and upload exported watchlist</small>
          </div>

          {/* Paste Tickers Box */}
          <div className="paste-area">
            <textarea
              placeholder="Or paste tickers directly (e.g. NSE:RELIANCE, NSE:TCS, INFY, TATAMOTORS, HDFCBANK)..."
              value={rawWatchlistText}
              onChange={(e) => setRawWatchlistText(e.target.value)}
              rows={4}
            />
            <button
              className="button primary"
              onClick={() => handleImportText(rawWatchlistText)}
              disabled={isImporting || !rawWatchlistText.trim()}
            >
              <FileText size={15} />
              {isImporting ? 'Importing to SQLite…' : 'Import Watchlist'}
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="import-status-banner">
            <span>{importStatus}</span>
          </div>
        )}

        {/* Current SQLite Saved Watchlist */}
        <div className="saved-watchlist-section">
          <div className="saved-watchlist-header">
            <strong>Active Saved Wishlist in SQLite Database ({savedWatchlist.length} stocks):</strong>
            <small>Synchronized across your workspace</small>
          </div>
          <div className="saved-chips-grid">
            {savedWatchlist.length ? (
              savedWatchlist.map((item) => (
                <div key={item.symbol} className="saved-chip">
                  <span>{item.symbol}</span>
                  <button
                    onClick={() => handleDeleteWatchlistSymbol(item.symbol)}
                    title={`Remove ${item.symbol}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            ) : (
              <span className="no-watchlist-text">No custom wishlist items saved yet in SQLite.</span>
            )}
          </div>
        </div>
      </section>

      {/* Terminal Preferences Grid */}
      <div className="settings-grid">
        <section className="panel">
          <SectionHeading eyebrow="DATA CONNECTION" title="Market feed" detail="Exchange analytics engine configuration." />
          <div className="setting-list">
            <div className="setting-row">
              <span>
                <strong>Market exchange</strong>
                <small>Primary source</small>
              </span>
              <b className="setting-value">National Stock Exchange (NSE)</b>
            </div>
            <div className="setting-row">
              <span>
                <strong>Feed status</strong>
                <small>Intraday &amp; historical pipeline</small>
              </span>
              <b className="setting-value exact-text">Active</b>
            </div>
            <div className="setting-row">
              <span>
                <strong>SQLite Database</strong>
                <small>Wishlist &amp; Historical Storage</small>
              </span>
              <b className="setting-value">backend/market_data.db</b>
            </div>
          </div>
        </section>

        <section className="panel">
          <SectionHeading eyebrow="DISPLAY" title="Terminal preferences" detail="Choose a palette for desk, browser, or system settings." />
          <div className="setting-list">
            <div className="setting-row">
              <span>
                <strong>Theme</strong>
                <small>Interface color palette</small>
              </span>
              <select className="theme-select" value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="setting-row">
              <span>
                <strong>Price bucket</strong>
                <small>Default scanner granularity</small>
              </span>
              <span className="theme-chip">₹1.00 default</span>
            </div>
            <div className="setting-row">
              <span>
                <strong>Live updates</strong>
                <small>Uses SSE with automatic reconnection</small>
              </span>
              <span className="status-pill"><i />Available</span>
            </div>
          </div>
        </section>
      </div>

      <div className="settings-disclaimer">
        <Building2 size={17} />
        <span><strong>Market Research Terminal.</strong> National Stock Exchange volume profile &amp; single prints analytics engine.</span>
      </div>
    </div>
  )
}
