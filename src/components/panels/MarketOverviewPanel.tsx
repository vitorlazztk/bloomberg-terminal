'use client'
import { TickerData } from '@/lib/types'
import { changeClass, formatPct, formatPrice } from '@/lib/formatters'

interface Props {
  indices: TickerData[]
  flashMap: Record<string, 'up' | 'down' | ''>
  equities: TickerData[]
  onSelectTicker?: (t: TickerData) => void
}

export function MarketOverviewPanel({ indices, flashMap, equities, onSelectTicker }: Props) {
  // Sector performance (mock)
  const sectors = [
    { name: 'Technology',    pct: 1.42 },
    { name: 'Energy',        pct: 0.83 },
    { name: 'Financials',    pct: 0.61 },
    { name: 'Healthcare',    pct: -0.22 },
    { name: 'Consumer Disc', pct: 0.94 },
    { name: 'Industrials',   pct: 0.38 },
    { name: 'Materials',     pct: -0.57 },
    { name: 'Utilities',     pct: -0.84 },
  ]

  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.pct)))

  return (
    <div className="bb-panel">
      <div className="bb-panel-header">
        <span>MARKET OVERVIEW — GLOBAL INDICES</span>
        <span style={{ color: '#555', fontSize: 9 }}>REAL-TIME</span>
      </div>
      <div className="bb-panel-body" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Indices grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, padding: 4 }}>
          {indices.map(idx => {
            const flash = flashMap[idx.symbol]
            const isUp = idx.changePct >= 0
            return (
              <div
                key={idx.symbol}
                className={flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}
                onClick={() => onSelectTicker?.(idx)}
                style={{
                  background: '#0d0d0d',
                  border: '1px solid #1a1a1a',
                  padding: '5px 8px',
                  cursor: onSelectTicker ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#FFA500', fontSize: 11, fontWeight: 'bold' }}>{idx.symbol}</span>
                  <span style={{ color: isUp ? '#00FF41' : '#FF3333', fontSize: 10 }}>
                    {formatPct(idx.changePct)}
                  </span>
                </div>
                <div style={{ color: '#DEDEDE', fontSize: 12, marginTop: 2 }}>
                  {formatPrice(idx.price, idx.price > 1000 ? 0 : 2)}
                </div>
                <div style={{ color: '#555', fontSize: 9 }}>{idx.name}</div>
              </div>
            )
          })}
        </div>

        {/* Sector heatmap */}
        <div style={{ padding: '6px 8px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ color: '#555', fontSize: 9, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            SECTOR PERFORMANCE — S&P 500
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {sectors.map(s => {
              const isUp = s.pct >= 0
              const intensity = Math.abs(s.pct) / maxAbs
              const bg = isUp
                ? `rgba(0,255,65,${0.04 + intensity * 0.22})`
                : `rgba(255,51,51,${0.04 + intensity * 0.22})`
              return (
                <div key={s.name} style={{
                  background: bg,
                  border: `1px solid ${isUp ? 'rgba(0,255,65,0.15)' : 'rgba(255,51,51,0.15)'}`,
                  padding: '3px 6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ color: '#AAAAAA', fontSize: 9 }}>{s.name}</span>
                  <span style={{ color: isUp ? '#00FF41' : '#FF3333', fontSize: 10 }}>
                    {formatPct(s.pct)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top movers */}
        <div style={{ padding: '6px 8px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ color: '#555', fontSize: 9, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            TOP MOVERS
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[...equities]
              .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
              .slice(0, 5)
              .map(t => (
                <div key={t.symbol} onClick={() => onSelectTicker?.(t)} style={{
                  flex: 1,
                  cursor: onSelectTicker ? 'pointer' : 'default',
                  textAlign: 'center',
                  padding: '3px 2px',
                  background: t.changePct >= 0 ? 'rgba(0,255,65,0.08)' : 'rgba(255,51,51,0.08)',
                  border: `1px solid ${t.changePct >= 0 ? 'rgba(0,255,65,0.12)' : 'rgba(255,51,51,0.12)'}`,
                }}>
                  <div style={{ color: '#FFA500', fontSize: 9, fontWeight: 'bold' }}>{t.symbol}</div>
                  <div style={{ color: t.changePct >= 0 ? '#00FF41' : '#FF3333', fontSize: 9 }}>
                    {formatPct(t.changePct)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
