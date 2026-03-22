'use client'
import { FXRate } from '@/lib/types'
import { changeClass, formatPct } from '@/lib/formatters'

interface Props {
  rates: FXRate[]
  onSelect?: (r: FXRate) => void
  selectedPair?: string
}

export function FXPanel({ rates, onSelect, selectedPair }: Props) {
  return (
    <div className="bb-panel">
      <div className="bb-panel-header">
        <span>FX — FOREIGN EXCHANGE RATES</span>
        <span style={{ color: '#555', fontSize: 9 }}>SPOT RATES</span>
      </div>
      <div className="bb-panel-body">
        <table className="bb-table">
          <thead>
            <tr>
              <th>PAIR</th>
              <th>RATE</th>
              <th>CHG</th>
              <th>CHG%</th>
              <th>BID</th>
              <th>ASK</th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => {
              const spread = r.rate * 0.0002
              const bid = r.rate - spread / 2
              const ask = r.rate + spread / 2
              const decimals = r.rate > 10 ? 2 : r.rate > 1 ? 4 : 4
              const isSelected = selectedPair === r.pair
              return (
                <tr
                  key={r.pair}
                  onClick={() => onSelect?.(r)}
                  style={{ cursor: onSelect ? 'pointer' : 'default', background: isSelected ? '#1a1000' : undefined }}
                >
                  <td style={{ color: isSelected ? '#FFD700' : '#FFA500', fontWeight: 'bold' }}>{r.pair}</td>
                  <td style={{ color: '#DEDEDE' }}>{r.rate.toFixed(decimals)}</td>
                  <td className={changeClass(r.change)}>
                    {r.change >= 0 ? '+' : ''}{r.change.toFixed(decimals)}
                  </td>
                  <td className={changeClass(r.changePct)}>{formatPct(r.changePct)}</td>
                  <td style={{ color: '#00FF41', fontSize: 10 }}>{bid.toFixed(decimals)}</td>
                  <td style={{ color: '#FF3333', fontSize: 10 }}>{ask.toFixed(decimals)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Mini rate bar visualization */}
        <div style={{ padding: '8px 8px 4px', borderTop: '1px solid #1a1a1a', marginTop: 4 }}>
          <div style={{ color: '#555', fontSize: 9, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            24H RANGE
          </div>
          {rates.slice(0, 5).map(r => {
            const pct = Math.abs(r.changePct)
            const barW = Math.min(pct * 20, 100)
            const isUp = r.changePct >= 0
            return (
              <div key={r.pair} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <div style={{ color: '#888', fontSize: 9, width: 56 }}>{r.pair}</div>
                <div style={{ flex: 1, height: 4, background: '#1a1a1a', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: isUp ? '50%' : `calc(50% - ${barW / 2}%)`,
                    width: `${barW / 2}%`,
                    height: '100%',
                    background: isUp ? '#00FF41' : '#FF3333',
                  }} />
                  <div style={{ position: 'absolute', left: '50%', top: -1, width: 1, height: 6, background: '#333' }} />
                </div>
                <div style={{ color: isUp ? '#00FF41' : '#FF3333', fontSize: 9, width: 44, textAlign: 'right' }}>
                  {formatPct(r.changePct)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
