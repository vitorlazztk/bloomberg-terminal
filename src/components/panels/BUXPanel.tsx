'use client'
import { TickerData } from '@/lib/types'

interface Props {
  buxIndex: TickerData
  tickers: TickerData[]
  flashMap: Record<string, 'up' | 'down' | ''>
  onSelect: (t: TickerData) => void
  selectedSymbol?: string
  panelNum?: number
}

function fmtPrice(p: number, decimals?: number): string {
  if (!p || p <= 0) return '—'
  if (decimals !== undefined) return p.toFixed(decimals)
  if (p >= 1000) return p.toLocaleString('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  if (p >= 10)   return p.toFixed(2)
  return p.toFixed(3)
}

function fmtVol(v: number): string {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K'
  return v.toString()
}

function fmtMcap(v: number): string {
  if (v >= 1e12) return (v / 1e12).toFixed(1) + ' Bn'
  if (v >= 1e9)  return (v / 1e9).toFixed(0) + ' Md'
  if (v >= 1e6)  return (v / 1e6).toFixed(0) + ' M'
  return v.toString()
}

export function BUXPanel({ buxIndex, tickers, flashMap, onSelect, selectedSymbol, panelNum = 2 }: Props) {
  const isUp = buxIndex.changePct >= 0
  const upColor   = '#00FF41'
  const downColor = '#FF3333'

  return (
    <div className="bb-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="bb-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="panel-num">{panelNum}</span>
          <span>BUX — Budapest Értéktőzsde</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: '#555' }}>BÉT</span>
          <button style={{
            background: '#1a0800', border: '1px solid #3a2000', color: '#FF8C00',
            fontSize: 9, padding: '0 6px', cursor: 'pointer', fontFamily: 'Courier New',
          }}>
            BUX ▾
          </button>
        </div>
      </div>

      {/* BUX Index Summary */}
      <div style={{
        background: '#060606', borderBottom: '1px solid #1a1a1a',
        padding: '6px 10px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ color: '#FFD700', fontSize: 13, fontWeight: 'bold', letterSpacing: '0.05em' }}>
            BUX
          </span>
          <span style={{ color: '#EFEFEF', fontSize: 14, fontWeight: 'bold' }}>
            {buxIndex.price.toLocaleString('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span style={{ color: isUp ? upColor : downColor, fontSize: 12 }}>
            {isUp ? '▲' : '▼'} {Math.abs(buxIndex.changePct).toFixed(2)}%
          </span>
          <span style={{ color: '#555', fontSize: 10 }}>
            {isUp ? '+' : ''}{buxIndex.change.toLocaleString('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} pont
          </span>
        </div>
        <div style={{ marginTop: 3, fontSize: 9, color: '#444', letterSpacing: '0.06em' }}>
          BÉT NYITVA  ·  2025.03.22  ·  Budapest Stock Exchange  ·  HUF
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 80px 60px 60px 52px',
        padding: '3px 8px',
        borderBottom: '1px solid #1a1a1a',
        flexShrink: 0,
        background: '#040404',
      }}>
        {['TICKER', 'NÉV', 'ÁR (HUF)', 'VÁLTOZ.', 'FORGALOM', 'P/E'].map((h, i) => (
          <span key={i} style={{
            fontSize: 9, color: '#444', letterSpacing: '0.06em',
            textAlign: i >= 2 ? 'right' : 'left',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Ticker rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tickers.map(t => {
          const up = t.changePct >= 0
          const flash = flashMap[t.symbol]
          const isSelected = t.symbol === selectedSymbol

          return (
            <div
              key={t.symbol}
              onClick={() => onSelect(t)}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 1fr 80px 60px 60px 52px',
                padding: '4px 8px',
                borderBottom: '1px solid #111',
                cursor: 'pointer',
                background: isSelected
                  ? '#0d0800'
                  : flash === 'up'
                    ? '#002200'
                    : flash === 'down'
                      ? '#220000'
                      : 'transparent',
                transition: 'background 0.3s',
              }}
            >
              {/* Ticker */}
              <span style={{
                color: isSelected ? '#FF8C00' : '#FFD700',
                fontSize: 11, fontWeight: 'bold',
              }}>
                {t.symbol}
              </span>

              {/* Name */}
              <span style={{ color: '#888', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.name}
              </span>

              {/* Price */}
              <span style={{
                color: t.price > 0 ? (up ? upColor : downColor) : '#333',
                fontSize: 11, textAlign: 'right', fontWeight: 'bold',
              }}>
                {fmtPrice(t.price)}
              </span>

              {/* Change % */}
              <span style={{
                color: t.price > 0 ? (up ? upColor : downColor) : '#333',
                fontSize: 10, textAlign: 'right',
              }}>
                {t.price > 0 ? `${up ? '+' : ''}${t.changePct.toFixed(2)}%` : '—'}
              </span>

              {/* Volume */}
              <span style={{ color: '#555', fontSize: 10, textAlign: 'right' }}>
                {fmtVol(t.volume)}
              </span>

              {/* P/E */}
              <span style={{ color: '#666', fontSize: 10, textAlign: 'right' }}>
                {t.pe?.toFixed(1) ?? '—'}
              </span>
            </div>
          )
        })}

        {/* Separator */}
        <div style={{ borderTop: '1px solid #1a1a1a', margin: '4px 0' }} />

        {/* Market info footer */}
        <div style={{ padding: '6px 10px', fontSize: 9, color: '#333', lineHeight: 1.8 }}>
          <div>Tőzsdei forgalom: ~42 Md HUF</div>
          <div>Adatok: Yahoo Finance (BÉT)</div>
          <div>Frissítés: 60 másodpercenként</div>
        </div>
      </div>
    </div>
  )
}
