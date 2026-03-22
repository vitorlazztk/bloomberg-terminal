'use client'
import { TICKER_BAR_ITEMS } from '@/lib/mockData'

function fmt(price: number): string {
  if (price >= 10000) return price.toFixed(0)
  if (price >= 1000)  return price.toFixed(2)
  if (price >= 10)    return price.toFixed(2)
  return price.toFixed(4)
}

function TickerItem({ symbol, price, changePct }: { symbol: string; price: number; changePct: number }) {
  const up = changePct >= 0
  const arrow = up ? '▲' : '▼'
  const color = up ? '#00FF41' : '#FF3333'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 14px', borderRight: '1px solid #1a1a1a' }}>
      <span style={{ color: '#FFA500', fontSize: 10, fontWeight: 'bold' }}>{symbol}</span>
      <span style={{ color: '#DEDEDE', fontSize: 10 }}>{fmt(price)}</span>
      <span style={{ color, fontSize: 10 }}>
        {arrow}{Math.abs(changePct).toFixed(2)}%
      </span>
    </span>
  )
}

export function TickerBar() {
  // Duplicate items for seamless loop
  const items = [...TICKER_BAR_ITEMS, ...TICKER_BAR_ITEMS]

  return (
    <div style={{
      background: '#050505',
      borderBottom: '1px solid #1a1a1a',
      height: 22,
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="ticker-track">
        {items.map((item, i) => (
          <TickerItem key={i} {...item} />
        ))}
      </div>
    </div>
  )
}
