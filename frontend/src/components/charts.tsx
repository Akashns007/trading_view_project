import { useEffect, useRef } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  createChart,
  ColorType,
  LineStyle,
  CrosshairMode,
  IChartApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries
} from 'lightweight-charts'
import type { PricePoint, VolumeLevel, VolumeProfile } from '../types'
import { compactNumber, formatNumber, formatPrice } from './ui'

function chartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean
  payload?: Array<{ value?: number; name?: string }>
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <strong>{typeof label === 'number' ? formatPrice(label) : label}</strong>
      {payload.map((entry, index) => (
        <span key={`${entry.name || 'value'}-${index}`}>
          <i />
          {entry.name}: {entry.name === 'volume' ? compactNumber(entry.value) : formatPrice(entry.value)}
        </span>
      ))}
    </div>
  )
}

export function VolumeProfileChart({ profile }: { profile: VolumeProfile }) {
  const levels = [
    ...(profile.levels || profile.topLevels || [...(profile.aboveLevels || []), ...(profile.belowLevels || [])])
  ].sort((a, b) => a.price - b.price)
  const max = Math.max(...levels.map((level) => level.volume), 1)
  const previousOpen = profile.previousOpen ?? undefined

  return (
    <div className="volume-profile-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={levels} layout="vertical" margin={{ top: 8, right: 22, bottom: 8, left: 8 }} barCategoryGap="18%">
          <CartesianGrid horizontal={false} stroke="#202838" />
          <XAxis type="number" hide domain={[0, max * 1.1]} />
          <YAxis
            type="category"
            dataKey="price"
            orientation="right"
            width={66}
            tickFormatter={(value) => formatPrice(Number(value))}
            tick={{ fill: '#8a96aa', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: '#1b2433' }} content={chartTooltip} />
          <Bar dataKey="volume" radius={[2, 3, 3, 2]}>
            {levels.map((level) => (
              <Cell
                key={level.price}
                fill={level.price === previousOpen ? '#6c86f5' : level.side === 'ABOVE' ? '#3d8f70' : level.side === 'BELOW' ? '#a45058' : '#37517c'}
                fillOpacity={level.price === previousOpen ? 1 : 0.78}
              />
            ))}
          </Bar>
          {previousOpen !== undefined && (
            <ReferenceLine
              y={previousOpen}
              stroke="#6c86f5"
              strokeDasharray="4 4"
              label={{ value: 'PREV OPEN', fill: '#829afc', fontSize: 9, position: 'insideTopLeft' }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Interactive TradingView Candlestick + Volume + Single Prints & Volume Level overlays
 * Defaults to 1 Day (Single Session) with bounded single print overlays.
 */
export function IntradayChart({
  series = [],
  profile,
  timeRange = '1D',
  showOpen = true,
  showAbove = true,
  showBelow = true,
  showCurrent = true,
  showSinglePrints = true
}: {
  series?: PricePoint[]
  profile: VolumeProfile
  timeRange?: '1D' | '5D'
  showOpen?: boolean
  showAbove?: boolean
  showBelow?: boolean
  showCurrent?: boolean
  showSinglePrints?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up previous instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove()
      chartInstanceRef.current = null
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0e131d' },
        textColor: '#8a96aa',
        fontFamily: "'Inter', sans-serif"
      },
      grid: {
        vertLines: { color: 'rgba(32, 40, 56, 0.6)' },
        horzLines: { color: 'rgba(32, 40, 56, 0.6)' }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#5d6b82',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#2962ff'
        },
        horzLine: {
          color: '#5d6b82',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#2962ff'
        }
      },
      rightPriceScale: {
        borderColor: '#202838',
        autoScale: true
      },
      timeScale: {
        borderColor: '#202838',
        timeVisible: true,
        secondsVisible: false
      }
    })

    chartInstanceRef.current = chart

    // Prepare candles
    let rawCandles = profile.candles || []
    if (!rawCandles.length && series.length > 0) {
      const nowTs = Math.floor(Date.now() / 1000) - series.length * 300
      rawCandles = series.map((pt, i) => {
        const p = pt.price
        return {
          time: (nowTs + i * 300) as any,
          open: p,
          high: Math.round(p * 1.002 * 100) / 100,
          low: Math.round(p * 0.998 * 100) / 100,
          close: p,
          volume: pt.volume || 1000
        }
      })
    }

    const activeDate = profile.selectedDate || profile.previousSessionDate || profile.date

    // Filter candle data if 1D mode is active (default)
    let candleData = rawCandles
    if (timeRange === '1D' && rawCandles.length > 0) {
      const dayFiltered = rawCandles.filter((c) => c.date === activeDate)
      if (dayFiltered.length > 0) {
        candleData = dayFiltered
      } else {
        const lastDate = rawCandles[rawCandles.length - 1].date
        candleData = rawCandles.filter((c) => c.date === lastDate)
      }
    }

    if (candleData.length > 0) {
      // Add Candlestick Series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#089981',
        downColor: '#f23645',
        borderVisible: false,
        wickUpColor: '#089981',
        wickDownColor: '#f23645'
      })
      candleSeries.setData(
        candleData.map((c) => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }))
      )

      // Add Volume Histogram Series
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: ''
      })
      chart.priceScale('').applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 }
      })
      volumeSeries.setData(
        candleData.map((c) => ({
          time: c.time as any,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(8, 153, 129, 0.45)' : 'rgba(242, 54, 69, 0.45)'
        }))
      )

      // Overlays: Previous Day Open
      const open = profile.previousDayOpen ?? profile.previousOpen
      if (showOpen && open !== null && open !== undefined) {
        candleSeries.createPriceLine({
          price: open,
          color: '#6c86f5',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Prev Open ₹${open.toFixed(2)}`
        })
      }

      // Overlays: Above Volume Levels
      if (showAbove && profile.aboveLevels) {
        profile.aboveLevels.forEach((lvl, idx) => {
          candleSeries.createPriceLine({
            price: lvl.price,
            color: '#3d8f70',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `A${lvl.rank ?? idx + 1} ₹${lvl.price.toFixed(2)} (${compactNumber(lvl.volume)})`
          })
        })
      }

      // Overlays: Below Volume Levels
      if (showBelow && profile.belowLevels) {
        profile.belowLevels.forEach((lvl, idx) => {
          candleSeries.createPriceLine({
            price: lvl.price,
            color: '#ef5350',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `B${lvl.rank ?? idx + 1} ₹${lvl.price.toFixed(2)} (${compactNumber(lvl.volume)})`
          })
        })
      }

      // Overlays: Current Price
      if (showCurrent && profile.currentPrice !== null && profile.currentPrice !== undefined) {
        candleSeries.createPriceLine({
          price: profile.currentPrice,
          color: '#e8b863',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `Current ₹${profile.currentPrice.toFixed(2)}`
        })
      }

      // Overlays: Single Prints (Bounded strictly to the session day so lines cut cleanly!)
      if (showSinglePrints) {
        const zonesToDraw = timeRange === '5D' && profile.allSinglePrints?.length
          ? profile.allSinglePrints
          : (profile.singlePrints || [])

        zonesToDraw.forEach((sp) => {
          const isBuying = sp.type === 'BUYING'
          const spColor = isBuying ? '#26a69a' : '#ef5350'
          const roleShort = isBuying ? 'Supp' : 'Res'

          const dayCandles = rawCandles.filter((c) => c.date === sp.date)
          const startTs = sp.startTime || (dayCandles.length ? dayCandles[0].time : candleData[0].time)
          const endTs = sp.endTime || (dayCandles.length ? dayCandles[dayCandles.length - 1].time : candleData[candleData.length - 1].time)

          if (timeRange === '1D') {
            candleSeries.createPriceLine({
              price: sp.high,
              color: spColor,
              lineWidth: 1,
              lineStyle: LineStyle.Dashed,
              axisLabelVisible: true,
              title: `SP [${sp.bracket}] ${roleShort} ₹${sp.low.toFixed(1)}-${sp.high.toFixed(1)}`
            })

            candleSeries.createPriceLine({
              price: sp.low,
              color: spColor,
              lineWidth: 1,
              lineStyle: LineStyle.Dotted,
              axisLabelVisible: false,
              title: ''
            })
          } else {
            // In 5D mode, draw day-bounded LineSeries so lines cut cleanly at the end of each session!
            if (startTs && endTs && dayCandles.length > 0) {
              const lineHigh = chart.addSeries(LineSeries, {
                color: spColor,
                lineWidth: 2,
                lineStyle: LineStyle.Dashed,
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
                title: `SP [${sp.bracket}]`
              })
              lineHigh.setData([
                { time: startTs as any, value: sp.high },
                { time: endTs as any, value: sp.high }
              ])

              const lineLow = chart.addSeries(LineSeries, {
                color: spColor,
                lineWidth: 1,
                lineStyle: LineStyle.Dotted,
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false
              })
              lineLow.setData([
                { time: startTs as any, value: sp.low },
                { time: endTs as any, value: sp.low }
              ])
            }
          }
        })
      }

      chart.timeScale().fitContent()
    }

    // Resize observer
    const handleResize = () => {
      if (containerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove()
        chartInstanceRef.current = null
      }
    }
  }, [profile, series, timeRange, showOpen, showAbove, showBelow, showCurrent, showSinglePrints])

  return (
    <div
      ref={containerRef}
      className="intraday-chart"
      style={{ width: '100%', height: '360px', position: 'relative' }}
    />
  )
}


export function MiniSparkline({ series = [] }: { series?: PricePoint[] }) {
  if (series.length < 2) return <span className="spark-placeholder" />
  return (
    <div className="mini-spark">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <Line dataKey="price" stroke="#8298ff" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProfileLegend() {
  return (
    <div className="profile-legend">
      <span><i className="legend-bar" />Executed quantity by price</span>
      <span><i className="legend-prev" />Previous open</span>
      <span><i className="legend-above" />Above levels</span>
      <span><i className="legend-below" />Below levels</span>
    </div>
  )
}

export function levelShare(level: VolumeLevel) {
  return level.volumePercent === null || level.volumePercent === undefined ? '—' : `${level.volumePercent.toFixed(1)}%`
}
