'use client'
import { useClock } from '@/hooks/useSimulatedPrices'

interface Props {
  loadedSymbol?: string
}

function isNyseOpen(): boolean {
  const now = new Date()
  // ET = UTC-5 (winter) or UTC-4 (summer); simple check:
  const h = now.getUTCHours()
  const day = now.getUTCDay()
  if (day === 0 || day === 6) return false
  // NYSE: 14:30–21:00 UTC (winter) approx
  return h >= 14 && h < 21
}

function isBseOpen(): boolean {
  const now = new Date()
  const h = now.getUTCHours()
  const day = now.getUTCDay()
  if (day === 0 || day === 6) return false
  // BSE/BÉT: 09:00–17:00 CET = 08:00–16:00 UTC
  return h >= 8 && h < 16
}

export function TerminalHeader({ loadedSymbol = 'EURHUF' }: Props) {
  const { time } = useClock()
  const nyseOpen = isNyseOpen()
  const bseOpen  = isBseOpen()

  return (
    <div style={{
      background: '#080808',
      borderBottom: '1px solid #1e1e1e',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      height: 26,
      flexShrink: 0,
      gap: 12,
    }}>
      {/* Logo */}
      <div style={{
        color: '#FF8C00', fontWeight: 'bold', fontSize: 14,
        letterSpacing: '0.15em', flexShrink: 0,
      }}>
        TERM
      </div>

      {/* Loaded symbol */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ color: '#2a2a2a', fontSize: 9 }}>BETÖLTVE:</span>
        <span style={{ color: '#FFD700', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.05em' }}>
          {loadedSymbol}
        </span>
      </div>

      <div style={{ color: '#1e1e1e' }}>│</div>

      {/* Market status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#2a2a2a', fontSize: 9 }}>▶</span>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: nyseOpen ? '#00FF41' : '#FF3333' }} />
          <span style={{ color: '#555', fontSize: 9 }}>NYSE {nyseOpen ? 'NYITVA' : 'ZÁRVA'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: bseOpen ? '#00FF41' : '#FF3333' }} />
          <span style={{ color: '#555', fontSize: 9 }}>BSE {bseOpen ? 'NYITVA' : 'ZÁRVA'}</span>
          <span style={{ color: '#333', fontSize: 9 }}>{time} CET</span>
        </div>
      </div>

      {/* Right icons (decorative) */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#2a2a2a', fontSize: 11 }}>
        <span title="Értesítések">🔔</span>
        <span title="Letöltés">⬇</span>
        <span title="Beállítások">⚙</span>
        <span style={{ color: '#FF8C00', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.05em' }}>VZ</span>
      </div>
    </div>
  )
}
