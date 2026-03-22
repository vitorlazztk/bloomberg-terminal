'use client'
import { useState, KeyboardEvent } from 'react'

// Quick command shortcut buttons shown on the right
const QUICK_BTNS = [
  { label: 'WEI',    cmd: 'WEI',    title: 'Világ indexek' },
  { label: 'BUX',    cmd: 'BUX',    title: 'Budapest Értéktőzsde' },
  { label: 'FXC',    cmd: 'FXC',    title: 'Devizaárfolyamok' },
  { label: 'GP',     cmd: 'GP',     title: 'Árfolyam grafikon' },
  { label: 'AI',     cmd: 'AI',     title: 'AI elemzés' },
  { label: 'TOP',    cmd: 'TOP',    title: 'Legfrissebb hírek' },
  { label: 'IMAP',   cmd: 'IMAP',   title: 'Hőtérkép' },
  { label: 'COMCTY', cmd: 'CMDTY',  title: 'Nyersanyagok' },
  { label: 'STOCK',  cmd: 'EQUITY', title: 'Részvények' },
]

const FK_COMMANDS: Record<string, string> = {
  F2: 'EQUITY', F3: 'FXC', F4: 'BONDS', F5: 'CMDTY',
  F6: 'AI', F8: 'WEI', F9: 'TOP', F10: 'GP', Escape: 'BACK',
}

interface Props {
  onCommand?: (cmd: string) => void
}

export function CommandBar({ onCommand }: Props) {
  const [cmd, setCmd] = useState('')

  const fire = (c: string) => { if (c.trim()) onCommand?.(c.trim()) }

  const submit = () => { if (cmd.trim()) { fire(cmd); setCmd('') } }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (FK_COMMANDS[e.key]) { e.preventDefault(); fire(FK_COMMANDS[e.key]); return }
    if (e.key === 'Enter') submit()
  }

  return (
    <div style={{
      background: '#060606', borderBottom: '1px solid #1a1a1a',
      display: 'flex', alignItems: 'center',
      padding: '0 8px', height: 28, flexShrink: 0, gap: 0,
    }}>

      {/* ── Input ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 10 }}>
        <span style={{ color: '#2a2a2a', fontSize: 10 }}>▶</span>
        <input
          value={cmd}
          onChange={e => setCmd(e.target.value.toUpperCase())}
          onKeyDown={handleKey}
          placeholder="Parancs vagy részvény szimbolum... (DI, AAPL, BUX, WEI, FXC, AI, GP)"
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#FF8C00', fontSize: 11, fontFamily: 'Courier New',
            width: 340, padding: '0 2px',
          }}
        />
        {/* GO button */}
        <button
          onClick={submit}
          style={{
            background: '#00AA00', color: '#000',
            fontSize: 10, padding: '0 10px', height: 18,
            border: 'none', cursor: 'pointer', fontFamily: 'Courier New',
            fontWeight: 'bold', letterSpacing: '0.05em', flexShrink: 0,
          }}
        >
          GO
        </button>
      </div>

      <div style={{ color: '#1a1a1a', fontSize: 14, marginRight: 10 }}>│</div>

      {/* ── Quick buttons ── */}
      <div style={{ display: 'flex', gap: 2 }}>
        {QUICK_BTNS.map(b => (
          <button
            key={b.label}
            onClick={() => fire(b.cmd)}
            title={b.title}
            style={{
              background: b.label === 'AI' ? '#1a0800' : 'transparent',
              color: b.label === 'AI' ? '#FF8C00' : '#3a3a3a',
              border: `1px solid ${b.label === 'AI' ? '#3a1500' : '#1e1e1e'}`,
              fontSize: 9, padding: '0 7px', height: 18,
              cursor: 'pointer', fontFamily: 'Courier New',
              letterSpacing: '0.06em', fontWeight: 'bold',
              transition: 'all 0.1s',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#FF8C00'; el.style.borderColor = '#3a2200'; el.style.background = '#110800' }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.color = b.label === 'AI' ? '#FF8C00' : '#3a3a3a'
              el.style.borderColor = b.label === 'AI' ? '#3a1500' : '#1e1e1e'
              el.style.background = b.label === 'AI' ? '#1a0800' : 'transparent'
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* ── Status ── */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ color: '#1e1e1e', fontSize: 9 }}>Adatok: Yahoo Finance • Finnhub • 15 perces késleltetés</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 8 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF41' }} />
          <span style={{ color: '#2a2a2a', fontSize: 9 }}>ÉLŐ</span>
        </div>
      </div>
    </div>
  )
}
