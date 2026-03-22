'use client'
import { TickerData } from '@/lib/types'
import { formatPrice, formatChange, formatPct, formatVolume, formatMarketCap, changeClass } from '@/lib/formatters'

interface Props {
  title: string
  tickers: TickerData[]
  flashMap: Record<string, 'up' | 'down' | ''>
  showPE?: boolean
  showMktCap?: boolean
  showVol?: boolean
  priceDecimals?: number
  onSelect?: (t: TickerData) => void
  selectedSymbol?: string
}

export function WatchlistPanel({ title, tickers, flashMap, showPE, showMktCap, showVol = true, priceDecimals = 2, onSelect, selectedSymbol }: Props) {
  return (
    <div className="bb-panel">
      <div className="bb-panel-header">
        <span>{title}</span>
        <span style={{ color: '#555', fontSize: 9 }}>{tickers.length} SECURITIES</span>
      </div>
      <div className="bb-panel-body">
        <table className="bb-table">
          <thead>
            <tr>
              <th>TICKER</th>
              <th>LAST</th>
              <th>CHG</th>
              <th>CHG%</th>
              {showVol && <th>VOLUME</th>}
              {showMktCap && <th>MKT CAP</th>}
              {showPE && <th>P/E</th>}
            </tr>
          </thead>
          <tbody>
            {tickers.map(t => {
              const flash = flashMap[t.symbol]
              const isSelected = selectedSymbol === t.symbol
              return (
                <tr
                  key={t.symbol}
                  className={flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}
                  onClick={() => onSelect?.(t)}
                  style={{ cursor: onSelect ? 'pointer' : 'default', background: isSelected ? '#1a1000' : undefined }}
                >
                  <td style={{ color: isSelected ? '#FFD700' : '#FFA500', fontWeight: 'bold' }}>{t.symbol}</td>
                  <td style={{ color: '#DEDEDE' }}>{formatPrice(t.price, priceDecimals)}</td>
                  <td className={changeClass(t.change)}>{formatChange(t.change, priceDecimals)}</td>
                  <td className={changeClass(t.changePct)}>{formatPct(t.changePct)}</td>
                  {showVol && <td style={{ color: '#777' }}>{formatVolume(t.volume)}</td>}
                  {showMktCap && <td style={{ color: '#777' }}>{formatMarketCap(t.marketCap ?? 0)}</td>}
                  {showPE && <td style={{ color: '#777' }}>{t.pe?.toFixed(1) ?? '—'}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
