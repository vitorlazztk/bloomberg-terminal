'use client'

export interface TickerBarItem {
  symbol: string
  price: number
  changePct: number
}

interface Props {
  items: TickerBarItem[]
}

function fmt(price: number): string {
  if (price <= 0)     return '—'
  if (price >= 10000) return price.toFixed(0)
  if (price >= 1000)  return price.toFixed(2)
  if (price >= 10)    return price.toFixed(2)
  return price.toFixed(4)
}

function TickerItem({ symbol, price, changePct }: TickerBarItem) {
  const up    = changePct >= 0
  const color = up ? '#00FF41' : '#FF3333'
  const noData = price <= 0
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 14px', borderRight: '1px solid #1a1a1a' }}>
      <span style={{ color: '#FFA500', fontSize: 10, fontWeight: 'bold' }}>{symbol}</span>
      {noData ? (
        <span style={{ color: '#333', fontSize: 10 }}>—</span>
      ) : (
        <>
          <span style={{ color: '#DEDEDE', fontSize: 10 }}>{fmt(price)}</span>
          <span style={{ color, fontSize: 10 }}>
            {up ? '▲' : '▼'}{Math.abs(changePct).toFixed(2)}%
          </span>
        </>
      )}
    </span>
  )
}

export function TickerBar({ items }: Props) {
  if (items.length === 0) {
    return (
      <div style={{
        background: '#050505', borderBottom: '1px solid #1a1a1a',
        height: 22, flexShrink: 0, display: 'flex', alignItems: 'center',
        paddingLeft: 12, color: '#2a2a2a', fontSize: 10,
      }}>
        ◌ Árfolyamok betöltése…
      </div>
    )
  }

  // Duplicate for seamless loop
  const doubled = [...items, ...items]
  return (
    <div style={{
      background: '#050505', borderBottom: '1px solid #1a1a1a',
      height: 22, overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center',
    }}>
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <TickerItem key={i} {...item} />
        ))}
      </div>
    </div>
  )
}
