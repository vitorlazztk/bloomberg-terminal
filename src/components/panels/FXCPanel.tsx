'use client'
import { FXRate } from '@/lib/types'

interface Props {
  rates: FXRate[]
  onSelect: (r: FXRate) => void
  selectedPair?: string
  panelNum?: number
}

function decimals(rate: number): number {
  if (rate >= 100) return 2
  if (rate >= 1)   return 4
  return 5
}

export function FXCPanel({ rates, onSelect, selectedPair, panelNum = 2 }: Props) {
  return (
    <div className="bb-panel">
      {/* Header */}
      <div className="bb-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="panel-num">{panelNum}</span>
          <span>FXC — Devizaárfolyamok</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#2a2a2a', fontSize: 9 }}>Kattints egy devizapárra a grafikon megjelenítéséhez — Panel 3-ban</span>
          <button style={{
            background: '#1a1000', border: '1px solid #3a2000', color: '#FF8C00',
            fontSize: 9, padding: '0 6px', cursor: 'pointer', fontFamily: 'Courier New',
          }}>
            FXC ▾
          </button>
        </div>
      </div>

      <div className="bb-panel-body">
        <table className="bb-table">
          <thead>
            <tr>
              <th>DEVIZAPÁR</th>
              <th>ÁRFOLYAM</th>
              <th>VÁLTOZÁS</th>
              <th>VÁLTOZÁS %</th>
              <th>GRAFIKON</th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => {
              const d = decimals(r.rate)
              const isUp = r.changePct >= 0
              const isSelected = selectedPair === r.pair
              const isHuf = r.pair.includes('HUF')

              return (
                <tr
                  key={r.pair}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => onSelect(r)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{
                    color: isSelected ? '#FFD700' : isHuf ? '#FFA500' : '#FFA500',
                    fontWeight: 'bold',
                    background: isHuf && !isSelected ? '#0d0800' : undefined,
                  }}>
                    {r.pair}
                  </td>
                  <td style={{
                    color: '#DEDEDE', fontWeight: 'bold',
                    background: isHuf && !isSelected ? '#0d0800' : undefined,
                  }}>
                    {r.rate.toFixed(d)}
                  </td>
                  <td style={{
                    color: isUp ? '#00FF41' : '#FF3333',
                    background: isHuf && !isSelected ? '#0d0800' : undefined,
                  }}>
                    {isUp ? '▲' : '▼'} {Math.abs(r.change).toFixed(d)}
                  </td>
                  <td style={{
                    color: isUp ? '#00FF41' : '#FF3333', fontWeight: 'bold',
                    background: isHuf && !isSelected ? '#0d0800' : undefined,
                  }}>
                    {isUp ? '+' : ''}{r.changePct.toFixed(2)}%
                  </td>
                  <td style={{
                    textAlign: 'center',
                    background: isHuf && !isSelected ? '#0d0800' : undefined,
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(r) }}
                      style={{
                        background: isSelected ? '#FF8C00' : '#1a1000',
                        color: isSelected ? '#000' : '#FF8C00',
                        border: `1px solid ${isSelected ? '#FF8C00' : '#3a2000'}`,
                        fontSize: 9, padding: '0 6px', height: 14,
                        cursor: 'pointer', fontFamily: 'Courier New',
                        fontWeight: 'bold',
                      }}
                    >
                      ▶ GP
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
