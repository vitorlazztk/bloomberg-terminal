'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { toYFSymbol } from '@/hooks/useLiveData'
import type { ChartBar } from '@/app/api/chart/route'

interface Props {
  symbol: string
  price: number
  changePct: number
  panelNum?: number
}

const PERIODS = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'] as const
type Period = typeof PERIODS[number]

const PERIOD_HU: Record<Period, string> = {
  '1D': '1 nap', '5D': '5 nap', '1M': '1 hó',
  '3M': '3 hó',  '6M': '6 hó', '1Y': '1 év', '5Y': '5 év',
}

const PERIOD_DAYS: Record<Period, number> = {
  '1D': 1, '5D': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '5Y': 1825,
}

function fmtPrice(p: number): string {
  if (p >= 10000) return p.toFixed(2)
  if (p >= 1000)  return p.toFixed(2)
  if (p >= 10)    return p.toFixed(3)
  return p.toFixed(4)
}

export function ChartPanel({ symbol, price, changePct, panelNum = 3 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef    = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef   = useRef<any>(null)

  const [period,     setPeriod]     = useState<Period>('3M')
  const [dataSource, setDataSource] = useState<'live' | 'sim'>('sim')
  const [loading,    setLoading]    = useState(false)
  const [dataError,  setDataError]  = useState<string | null>(null)
  const [tooltip,    setTooltip]    = useState<{ time: string; open: number; high: number; low: number; close: number } | null>(null)

  const isUp = changePct >= 0
  const upColor   = '#00FF41'
  const downColor = '#FF3333'
  const lineColor = isUp ? upColor : downColor

  // ── Init Lightweight Charts ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    let chart: ReturnType<typeof import('lightweight-charts').createChart>

    import('lightweight-charts').then((lc) => {
      const { createChart, ColorType, CrosshairMode, CandlestickSeries } = lc as typeof import('lightweight-charts') & {
        CandlestickSeries: unknown
      }
      if (!containerRef.current) return

      chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#080808' },
          textColor: '#555555',
          fontFamily: 'Courier New, monospace',
          fontSize: 10,
        },
        grid: {
          vertLines: { color: '#111111' },
          horzLines: { color: '#111111' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: '#3a3a3a', labelBackgroundColor: '#1a1a1a' },
          horzLine: { color: '#3a3a3a', labelBackgroundColor: '#1a1a1a' },
        },
        rightPriceScale: { borderColor: '#1a1a1a' },
        timeScale: {
          borderColor: '#1a1a1a',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: true,
        handleScale: true,
        width:  containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })

      chartRef.current = chart

      // Candlestick series — v5 API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cs = (chart as any).addSeries
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (chart as any).addSeries(CandlestickSeries, {
            upColor,
            downColor,
            borderUpColor:   upColor,
            borderDownColor: downColor,
            wickUpColor:     upColor,
            wickDownColor:   downColor,
          })
        // fallback for v4-style API
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : (chart as any).addCandlestickSeries({
            upColor, downColor,
            borderUpColor: upColor, borderDownColor: downColor,
            wickUpColor: upColor, wickDownColor: downColor,
          })

      seriesRef.current = cs

      // Tooltip on crosshair move
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || !param.seriesData) { setTooltip(null); return }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = (param.seriesData as Map<any, any>).get(cs) as
          { open: number; high: number; low: number; close: number } | undefined
        if (!d) { setTooltip(null); return }
        const t = param.time as number
        const date = new Date(t * 1000).toLocaleDateString('hu-HU', {
          year: '2-digit', month: 'short', day: 'numeric'
        })
        setTooltip({ time: date, ...d })
      })

      // Resize observer
      const ro = new ResizeObserver(() => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width:  containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          })
        }
      })
      ro.observe(containerRef.current)

      return () => {
        ro.disconnect()
        chart.remove()
      }
    })

    return () => {
      if (chartRef.current) {
        try { chartRef.current.remove() } catch { /* ignore */ }
        chartRef.current  = null
        seriesRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load chart data ────────────────────────────────────────────────────────
  const loadData = useCallback(async (sym: string, per: Period) => {
    if (!seriesRef.current) return
    setLoading(true)

    const yfSym = toYFSymbol(sym)

    try {
      const res = await fetch(`/api/chart?symbol=${encodeURIComponent(yfSym)}&period=${per}`, {
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      const bars: ChartBar[] = json.bars ?? []

      if (bars.length === 0) throw new Error('Nincs elérhető adat')

      seriesRef.current.setData(
        bars.map(b => ({
          time:  b.time,
          open:  b.open,
          high:  b.high,
          low:   b.low,
          close: b.close,
        }))
      )
      chartRef.current?.timeScale().fitContent()
      setDataSource('live')
      setDataError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ismeretlen hiba'
      setDataError(`Grafikon nem elérhető: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload when symbol or period changes
  useEffect(() => {
    // Small delay to let chart initialize
    const t = setTimeout(() => loadData(symbol, period), 100)
    return () => clearTimeout(t)
  }, [symbol, period, loadData])

  return (
    <div className="bb-panel">
      {/* Header */}
      <div className="bb-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="panel-num">{panelNum}</span>
          <span>GP — Árfolyam grafikon</span>
        </div>
        <button style={{
          background: '#1a1000', border: '1px solid #3a2000', color: '#FF8C00',
          fontSize: 9, padding: '0 6px', cursor: 'pointer', fontFamily: 'Courier New',
        }}>
          GP ▾
        </button>
      </div>

      {/* Sub-header: symbol + price + periods */}
      <div style={{
        background: '#080808', borderBottom: '1px solid #1a1a1a',
        padding: '3px 8px', display: 'flex', alignItems: 'center',
        gap: 6, flexShrink: 0, flexWrap: 'wrap',
      }}>
        <span style={{ color: '#FFD700', fontSize: 11, fontWeight: 'bold' }}>{symbol}</span>
        <span style={{ color: '#DEDEDE', fontSize: 11 }}>{fmtPrice(price)}</span>
        <span style={{ color: isUp ? upColor : downColor, fontSize: 10 }}>
          {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
        </span>

        {/* Data source badge */}
        <div style={{
          fontSize: 8, padding: '1px 5px',
          background: dataSource === 'live' ? '#00441144' : '#2a2a2a',
          color:      dataSource === 'live' ? '#00FF41'   : '#555',
          border:     `1px solid ${dataSource === 'live' ? '#00441188' : '#333'}`,
          letterSpacing: '0.08em',
        }}>
          {dataSource === 'live' ? '● ÉLŐ' : '○ SIM'}
        </div>
        {loading && <span style={{ color: '#444', fontSize: 9 }}>betöltés…</span>}

        <div style={{ flex: 1 }} />

        {/* Period selector */}
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              fontSize: 10, padding: '1px 7px',
              background: period === p ? '#FF8C00' : 'transparent',
              color:      period === p ? '#000'    : '#444',
              border:     `1px solid ${period === p ? '#FF8C00' : '#1e1e1e'}`,
              cursor: 'pointer', fontFamily: 'Courier New',
            }}
          >
            {PERIOD_HU[p]}
          </button>
        ))}
      </div>

      {/* Tooltip overlay */}
      {tooltip && (
        <div style={{
          position: 'absolute', top: 48, left: 68, zIndex: 10,
          background: '#0f0f0f', border: '1px solid #2a2a2a',
          padding: '4px 8px', fontSize: 10, pointerEvents: 'none',
          color: '#AAA', fontFamily: 'Courier New',
        }}>
          <span style={{ color: '#FFA500' }}>{tooltip.time}</span>
          &nbsp;·&nbsp;
          O: <span style={{ color: '#DDD' }}>{fmtPrice(tooltip.open)}</span>
          &nbsp;H: <span style={{ color: upColor }}>{fmtPrice(tooltip.high)}</span>
          &nbsp;L: <span style={{ color: downColor }}>{fmtPrice(tooltip.low)}</span>
          &nbsp;Z: <span style={{ color: isUp ? upColor : downColor }}>{fmtPrice(tooltip.close)}</span>
        </div>
      )}

      {/* Chart container */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {dataError && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#080808', zIndex: 5, gap: 8,
          }}>
            <div style={{ color: '#FF3333', fontSize: 11 }}>⚠ {dataError}</div>
            <div style={{ color: '#333', fontSize: 9 }}>Ellenőrizd a szimbólumot vagy próbáld újra később</div>
          </div>
        )}
      </div>
    </div>
  )
}
