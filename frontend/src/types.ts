export interface Stock {
  symbol: string
  name: string
  exchange: string
  sector: string
  instrumentType: string
  underlyingType?: 'STOCK' | 'INDEX'
  segment?: string
  lotSize: number
  tickSize?: number
  providerSymbol?: string
  activeFrom?: string | null
  activeTo?: string | null
  isFno: boolean
  previousOpen?: number | null
  isWishlist?: boolean
}

export interface WatchlistItem {
  symbol: string
  name: string
  sector?: string
  addedAt?: string
}

export interface VolumeLevel {
  price: number
  volume: number
  tradeCount?: number
  volumePercent?: number
  rank?: number
  side?: 'ABOVE' | 'BELOW'
  signedGap?: number | null
  pointGap?: number | null
  gapPercent?: number | null
}

export interface DataQuality {
  status?: string
  state?: 'COMPLETE' | 'PARTIAL' | 'ESTIMATED' | 'MISSING' | 'INVALID'
  label?: string
  reason?: string
  tradeCount?: number
  hasPreviousOpen?: boolean
  source?: string
  coverageStart?: string | null
  coverageEnd?: string | null
  expectedInstruments?: number
  receivedInstruments?: number
}

/** Optional fields accommodate partial provider responses and older local API versions. */
export interface ScannerRow {
  symbol: string
  name: string
  sector: string
  previousDayOpen: number | null
  previousOpen: number | null
  aboveLevels?: VolumeLevel[]
  belowLevels?: VolumeLevel[]
  currentPrice: number | null
  currentVsPreviousOpen?: number | null
  currentPriceTime?: string | null
  currentPriceTimestamp?: string | null
  totalVolume: number
  tradeCount: number
  bucket: number
  date: string
  previousSessionDate?: string
  status: string
  dataMode: string
  calculationMode: string
  dataQuality?: string | DataQuality
  quality?: string | DataQuality
  missingReason?: string
  /** Legacy fields are accepted but never substituted for ranked above/below levels. */
  hvtp: number | null
  hvtpVolume: number
  hvtpLevels: number[]
  signedGap: number | null
  pointGap: number | null
  gapPercent: number | null
  currentVsHvtp: number | null
  topLevels: VolumeLevel[]
}

export interface Overview {
  scanned?: number
  above?: number
  below?: number
  unchanged?: number
  largestGap?: number | null
  smallestGap?: number | null
  averageGap?: number | null
  withLevels?: number
  missing?: number
}

export interface ScannerResponse {
  rows: ScannerRow[]
  count?: number
  date?: string
  requestedDate?: string
  defaultDate?: string
  previousSessionDate?: string
  sessionStatus?: string
  dataMode?: string
  calculationMode?: string
  dataQuality?: string | DataQuality
  analysisVersion?: string
  overview?: Overview
  rankings?: Record<string, ScannerRow[]>
}

export interface CandleData {
  time: number
  date?: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SinglePrintZone {
  id: string
  bracket: string
  low: number
  high: number
  mid: number
  width: number
  type: 'BUYING' | 'SELLING'
  role: string
  status: string
  color: string
  borderColor: string
  date: string
  startTime?: number
  endTime?: number
  bracketTime: string
}

export interface VolumeProfile extends ScannerRow {
  levels: VolumeLevel[]
  previousSessionDate: string
  priceSeries: PricePoint[]
  candles?: CandleData[]
  singlePrints?: SinglePrintZone[]
  allSinglePrints?: SinglePrintZone[]
  availableDates?: string[]
  selectedDate?: string
}


export type SortField = 'pointGap' | 'gapPercent' | 'hvtpVolume' | 'symbol' | 'previousOpen' | 'hvtp' | 'signedGap' | 'currentPrice' | 'currentVsHvtp' | 'totalVolume' | 'aboveVolume' | 'belowVolume'
export interface ScannerFilters {
  date: string
  bucket: number
  topLevels: number
  sector: string
  query: string
  sort: SortField
  order: 'asc' | 'desc'
  direction: 'all' | 'above' | 'below'
  minVolume: number
  limit: '10' | '25' | '50' | 'all'
  liquidityThreshold: number
}

export interface PricePoint { time: string; price: number; volume?: number }
export interface LiveState { connected: boolean; updatedAt: Date | null; error: string | null }
export interface LiveUpdate extends ScannerResponse { profile?: VolumeProfile; sequence?: number; simulated?: boolean }
export interface Health { status?: string; defaultDate?: string; dataMode?: string; calculationMode?: string; provider?: string; lastUpdated?: string; sessionStatus?: string }
export interface CollectionRun { symbol: string | null; tradingDate: string; provider: string; status: string; tradeCount: number; error: string | null; startedAt: string; completedAt: string | null }
export interface MonitorResponse {
  status?: string
  dataMode?: string
  calculationMode?: string
  provider?: string
  lastUpdated?: string
  lastCollection?: string | null
  date?: string
  expectedInstruments?: number
  receivedInstruments?: number
  missingSymbols?: string[]
  tradeCount?: number
  lastReceivedTimestamp?: string | null
  connectionStatus?: string
  errorCount?: number
  sessions?: CollectionRun[]
  [key: string]: unknown
}
export interface HistoryEntry {
  date?: string
  sessionDate?: string
  previousSessionDate?: string
  symbol?: string
  previousOpen?: number | null
  previousDayOpen?: number | null
  aboveLevels?: VolumeLevel[]
  belowLevels?: VolumeLevel[]
  totalVolume?: number
  tradeCount?: number
  status?: string
  dataQuality?: string | DataQuality
  quality?: string | DataQuality
  dataMode?: string
  calculationMode?: string
  [key: string]: unknown
}
