'use client'
import { useEffect, useRef, useState } from 'react'
import { OHLCBar } from '@/lib/types'
import { generateOHLC } from '@/lib/mockData'

interface Props {
  symbol: string
  price: number
  changePct: number
  panelNum?: number
}

const PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'] as const
type Period = typeof PERIODS[number]

const PERIOD_DAYS: Record<Period, number> = {
  '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '5Y': 1825
}

// Hungarian period labels
const PERIOD_HU: Record<string, string> = {
  '1D': '1 nap', '1W': '5 nap', '1M': '1 hó', '3M': '3 hó', '6M': '6 hó', '1Y': '1 év', '5Y': '5 év',
}

export function ChartPanel({ symbol, price, changePct, panelNum = 3 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [period, setPeriod] = useState<Period>('3M')
  const [data, setData] = useState<OHLCBar[]>([])
  const [hovered, setHovered] = useState<OHLCBar | null>(null)

  useEffect(() => {
    setData(generateOHLC(price, PERIOD_DAYS[period]))
  }, [symbol, period, price])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || data.length === 0) return

    const w = container.clientWidth
    const h = container.clientHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    const prices = data.map(d => d.close)
    const minP = Math.min(...prices) * 0.998
    const maxP = Math.max(...prices) * 1.002

    const padL = 60, padR = 8, padT = 16, padB = 28
    const plotW = w - padL - padR
    const plotH = h - padT - padB

    // Background
    ctx.fillStyle = '#080808'
    ctx.fillRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke()
      const p = maxP - ((maxP - minP) / 4) * i
      ctx.fillStyle = '#555'
      ctx.font = '9px Courier New'
      ctx.textAlign = 'right'
      ctx.fillText(p.toFixed(2), padL - 4, y + 3)
    }

    // Area fill
    const toX = (i: number) => padL + (i / (data.length - 1)) * plotW
    const toY = (p: number) => padT + ((maxP - p) / (maxP - minP)) * plotH

    const gradient = ctx.createLinearGradient(0, padT, 0, padT + plotH)
    const isUp = data[data.length - 1].close >= data[0].close
    gradient.addColorStop(0, isUp ? 'rgba(0,255,65,0.15)' : 'rgba(255,51,51,0.15)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.beginPath()
    ctx.moveTo(toX(0), toY(data[0].close))
    data.forEach((d, i) => ctx.lineTo(toX(i), toY(d.close)))
    ctx.lineTo(toX(data.length - 1), padT + plotH)
    ctx.lineTo(toX(0), padT + plotH)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Line
    ctx.beginPath()
    ctx.strokeStyle = isUp ? '#00FF41' : '#FF3333'
    ctx.lineWidth = 1.5
    data.forEach((d, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(d.close))
      else ctx.lineTo(toX(i), toY(d.close))
    })
    ctx.stroke()

    // Hovered crosshair
    if (hovered) {
      const idx = data.indexOf(hovered)
      const x = toX(idx)
      const y = toY(hovered.close)
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#FFA500'
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
    }

    // X-axis date labels
    ctx.fillStyle = '#555'
    ctx.font = '9px Courier New'
    ctx.textAlign = 'center'
    const labelCount = Math.min(6, data.length)
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.floor((i / (labelCount - 1)) * (data.length - 1))
      const d = data[idx]
      const x = toX(idx)
      const label = new Date(d.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ctx.fillText(label, x, h - 8)
    }
  }, [data, hovered])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const padL = 60, padR = 8
    const plotW = canvas.width - padL - padR
    const idx = Math.round(((x - padL) / plotW) * (data.length - 1))
    if (idx >= 0 && idx < data.length) setHovered(data[idx])
  }

  const isUp = changePct >= 0
  const priceLabel = price >= 1000 ? price.toFixed(2) : price >= 10 ? price.toFixed(3) : price.toFixed(4)

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
      {/* Sub-header: symbol + price + change + periods */}
      <div style={{
        background: '#080808', borderBottom: '1px solid #1a1a1a',
        padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ color: '#FFD700', fontSize: 11, fontWeight: 'bold' }}>
          {symbol}
        </span>
        <span style={{ color: '#DEDEDE', fontSize: 11 }}>{priceLabel}</span>
        <span style={{ color: isUp ? '#00FF41' : '#FF3333', fontSize: 10 }}>
          {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
        </span>
        <div style={{ flex: 1 }} />
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              fontSize: 10, padding: '1px 7px',
              background: period === p ? '#FF8C00' : 'transparent',
              color: period === p ? '#000' : '#444',
              border: `1px solid ${period === p ? '#FF8C00' : '#1e1e1e'}`,
              cursor: 'pointer', fontFamily: 'Courier New',
            }}
          >
            {PERIOD_HU[p] ?? p}
          </button>
        ))}
        {hovered && (
          <span style={{ color: '#555', fontSize: 9, marginLeft: 8 }}>
            {new Date(hovered.time * 1000).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
            &nbsp;Z:{hovered.close.toFixed(2)}
            &nbsp;M:{hovered.high.toFixed(2)}
            &nbsp;A:{hovered.low.toFixed(2)}
          </span>
        )}
      </div>
      <div ref={containerRef} className="flex-1" style={{ minHeight: 0, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
        />
      </div>
    </div>
  )
}
