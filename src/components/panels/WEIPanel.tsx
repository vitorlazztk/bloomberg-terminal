'use client'
import { TickerData } from '@/lib/types'
import { WEI_REGIONS } from '@/lib/mockData'

interface Props {
  indices: TickerData[]
  flashMap: Record<string, 'up' | 'down' | ''>
  onSelect: (t: TickerData) => void
  selectedSymbol?: string
  panelNum?: number
}

function fmtPrice(p: number): string {
  if (p >= 10000) return p.toFixed(0)
  if (p >= 1000)  return p.toFixed(2)
  if (p >= 10)    return p.toFixed(2)
  return p.toFixed(3)
}

function fmtChange(c: number, price: number): string {
  if (price >= 1000) return (c >= 0 ? '+' : '') + c.toFixed(2)
  if (price >= 10)   return (c >= 0 ? '+' : '') + c.toFixed(2)
  return (c >= 0 ? '+' : '') + c.toFixed(4)
}

function fmtPct(p: number): string {
  return (p >= 0 ? '+' : '') + p.toFixed(2) + '%'
}

export function WEIPanel({ indices, flashMap, onSelect, selectedSymbol, panelNum = 1 }: Props) {
  // Build region groups from the current tickers
  const bySymbol = Object.fromEntries(indices.map(t => [t.symbol, t]))

  const regionOrder = Object.keys(WEI_REGIONS)

  return (
    <div className="bb-panel">
      {/* Header */}
      <div className="bb-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="panel-num">{panelNum}</span>
          <span>WEI — Világ részvényindexek</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#2a2a2a', fontSize: 9 }}>Kattints egy indexre a grafikon megjelenítéséhez</span>
          <button style={{
            background: '#1a1000', border: '1px solid #3a2000', color: '#FF8C00',
            fontSize: 9, padding: '0 6px', cursor: 'pointer', fontFamily: 'Courier New',
          }}>
            WEI ▾
          </button>
        </div>
      </div>

      <div className="bb-panel-body">
        <table className="bb-table">
          <thead>
            <tr>
              <th>TICKER</th>
              <th>MEGNEVEZÉS</th>
              <th>SZINT</th>
              <th>VÁLTOZÁS</th>
              <th>VÁLTOZÁS %</th>
            </tr>
          </thead>
          <tbody>
            {regionOrder.map(region => {
              const symbols = WEI_REGIONS[region]
              return [
                // Region separator row
                <tr key={`sep-${region}`} className="region-row">
                  <td colSpan={5}>— {region} —</td>
                </tr>,
                // Ticker rows for this region
                ...symbols.map(sym => {
                  const t = bySymbol[sym]
                  if (!t) return null
                  const flash = flashMap[t.symbol]
                  const isSelected = selectedSymbol === t.symbol
                  const isUp = t.changePct >= 0
                  return (
                    <tr
                      key={t.symbol}
                      className={[
                        flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : '',
                        isSelected ? 'selected' : '',
                      ].join(' ')}
                      onClick={() => onSelect(t)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ color: isSelected ? '#FFD700' : '#FFA500', fontWeight: 'bold' }}>
                        {t.symbol}
                      </td>
                      <td style={{ color: '#666', textAlign: 'left' }}>{t.name}</td>
                      <td style={{ color: '#DEDEDE', fontWeight: 'bold' }}>{fmtPrice(t.price)}</td>
                      <td style={{ color: isUp ? '#00FF41' : '#FF3333' }}>
                        {isUp ? '▲' : '▼'} {Math.abs(t.change).toFixed(t.price > 100 ? 2 : 4)}
                      </td>
                      <td style={{ color: isUp ? '#00FF41' : '#FF3333', fontWeight: 'bold' }}>
                        {fmtPct(t.changePct)}
                      </td>
                    </tr>
                  )
                }).filter(Boolean)
              ]
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
