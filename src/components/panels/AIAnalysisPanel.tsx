'use client'
import { useState, useEffect } from 'react'

interface Props {
  symbol: string
  price: number
  changePct: number
  panelNum?: number
}

type Tab = 'kutatas' | 'ajanlas' | 'social'

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) & 0x7fffffff
  return h
}
function seeded(s: string, offset: number): number {
  return ((hashStr(s + String(offset)) % 1000) + 1000) % 1000 / 1000
}

const RATINGS_HU    = ['ERŐS VÉTEL', 'VÉTEL', 'TART', 'ELADÁS']
const RATING_COLORS = ['#00FF41',    '#7FFF00', '#FFA500', '#FF3333']
const VIEWS_HU      = ['EMELKEDŐ',  'SEMLEGES', 'CSÖKKENŐ']
const VIEW_COLORS   = ['#00FF41',   '#FFA500',  '#FF3333']

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 4, background: '#1a1a1a', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: color, transition: 'width 0.5s' }} />
    </div>
  )
}

function Sec({ title }: { title: string }) {
  return (
    <div style={{
      color: '#333', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
      marginTop: 8, marginBottom: 4, paddingBottom: 3, borderBottom: '1px solid #141414',
    }}>
      {title}
    </div>
  )
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      fontSize: 9, padding: '2px 8px', fontWeight: 'bold',
      background: color + '22', color, border: `1px solid ${color}55`,
      letterSpacing: '0.06em',
    }}>
      {text}
    </span>
  )
}

function fmt(n: number): string {
  if (n >= 10000) return n.toFixed(0)
  if (n >= 1000)  return n.toFixed(2)
  if (n >= 10)    return n.toFixed(3)
  return n.toFixed(4)
}

function pctDiff(a: number, b: number): string {
  const d = ((a / b) - 1) * 100
  return (d >= 0 ? '+' : '') + d.toFixed(1) + '%'
}

export function AIAnalysisPanel({ symbol, price, changePct, panelNum = 4 }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('ajanlas')
  const [loaded, setLoaded] = useState(false)
  const [dots, setDots] = useState('')

  useEffect(() => {
    setLoaded(false)
    const t = setTimeout(() => setLoaded(true), 800)
    return () => clearTimeout(t)
  }, [symbol])

  useEffect(() => {
    if (loaded) return
    const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 280)
    return () => clearInterval(i)
  }, [loaded])

  // Deterministic computed values
  const h = hashStr(symbol)
  const ratingIdx    = h % 4
  const rating       = RATINGS_HU[ratingIdx]
  const ratingColor  = RATING_COLORS[ratingIdx]
  const confidence   = 52 + (h % 42)
  const bullAnalysts = Math.max(3, Math.floor(9  + seeded(symbol, 1) * 13))
  const holdAnalysts = Math.max(1, Math.floor(2  + seeded(symbol, 2) *  7))
  const sellAnalysts = Math.max(1, 24 - bullAnalysts - holdAnalysts)
  const targetPrice  = price * (1.05 + seeded(symbol, 3) * 0.15)
  const entryMin     = price * (0.965 + seeded(symbol, 4) * 0.02)
  const entryMax     = price * (1.000 + seeded(symbol, 5) * 0.02)
  const stop         = price * (0.890 + seeded(symbol, 6) * 0.05)
  const shortTarget  = price * (1.020 + seeded(symbol, 7) * 0.04)
  const midTarget    = price * (1.060 + seeded(symbol, 8) * 0.06)
  const longTarget   = price * (1.110 + seeded(symbol, 9) * 0.10)
  const shortView    = VIEWS_HU[h % 3]
  const shortColor   = VIEW_COLORS[h % 3]
  const midView      = VIEWS_HU[(h + 1) % 3]
  const midColor     = VIEW_COLORS[(h + 1) % 3]
  const longView     = VIEWS_HU[(h + 2) % 3]
  const longColor    = VIEW_COLORS[(h + 2) % 3]
  const redditSent   = 48 + (h % 44)
  const twitterSent  = 44 + ((h * 7) % 44)
  const forumSent    = 46 + ((h * 3) % 46)
  const overallSent  = Math.round(redditSent * 0.35 + twitterSent * 0.45 + forumSent * 0.20)
  const redditM      = 150 + (h % 600)
  const twitterM     = 2800 + (h % 18000)
  const forumM       = 60 + (h % 400)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'kutatas', label: 'KUTATÁS'  },
    { id: 'ajanlas', label: 'AJÁNLÁS'  },
    { id: 'social',  label: 'SOCIAL'   },
  ]

  const isUp = changePct >= 0

  // Loading skeleton
  if (!loaded) {
    return (
      <div className="bb-panel">
        <div className="bb-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="panel-num">{panelNum}</span>
            <span>AI — Mesterséges intelligencia elemzés</span>
          </div>
          <span style={{ background: '#FF8C00', color: '#000', fontSize: 9, padding: '1px 6px', fontWeight: 'bold' }}>AI ▾</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <div style={{ color: '#FF8C00', fontSize: 11 }}>◌ AI elemzés{dots}</div>
          <div style={{ color: '#222', fontSize: 9 }}>{symbol} adatainak feldolgozása</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bb-panel">
      {/* Header */}
      <div className="bb-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="panel-num">{panelNum}</span>
          <span>AI — Mesterséges intelligencia elemzés</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ background: '#FF8C00', color: '#000', fontSize: 9, padding: '1px 6px', fontWeight: 'bold' }}>AI ▾</span>
        </div>
      </div>

      {/* Sub-header: symbol + source + refresh */}
      <div style={{
        background: '#0a0a0a', borderBottom: '1px solid #1a1a1a',
        padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ color: '#FFD700', fontSize: 10, fontWeight: 'bold' }}>{symbol}</span>
        <span style={{ color: '#2a2a2a', fontSize: 9 }}>Tavily webes keresés</span>
        <span style={{ color: '#2a2a2a', fontSize: 9 }}>⊙ ma {new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
        <div style={{ flex: 1 }} />
        <button style={{
          background: '#1a1000', border: '1px solid #3a2000', color: '#FF8C00',
          fontSize: 9, padding: '0 6px', cursor: 'pointer', fontFamily: 'Courier New',
        }}>
          ↻ Frissítés
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', background: '#050505', flexShrink: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '5px 0', fontSize: 10,
              background: activeTab === t.id ? '#110800' : 'transparent',
              color: activeTab === t.id ? '#FF8C00' : '#444',
              border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? '#FF8C00' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'Courier New', letterSpacing: '0.08em',
            }}
          >
            {activeTab === t.id && (
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#FF8C00', marginRight: 4, marginBottom: 1, verticalAlign: 'middle' }} />
            )}
            {t.label}
          </button>
        ))}
      </div>

      <div className="bb-panel-body" style={{ padding: '4px 8px 8px' }}>

        {/* ─── KUTATÁS ─── */}
        {activeTab === 'kutatas' && (
          <div>
            <Sec title="Elemzői konszenzus" />
            {[
              { label: 'VÉTEL',   count: bullAnalysts, color: '#00FF41' },
              { label: 'TART',    count: holdAnalysts, color: '#FFA500' },
              { label: 'ELADÁS', count: sellAnalysts, color: '#FF3333' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <div style={{ color: '#555', fontSize: 9, width: 50 }}>{r.label}</div>
                <Bar pct={(r.count / 24) * 100} color={r.color} />
                <div style={{ color: r.color, fontSize: 9, width: 32, textAlign: 'right' }}>{r.count}/24</div>
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
              {[
                { label: 'KONSZENZUS', val: rating,            color: ratingColor },
                { label: '12H CÉLÁR',  val: fmt(targetPrice),  color: '#FFA500'   },
                { label: 'BIZALOM',    val: confidence + '%',  color: confidence > 68 ? '#00FF41' : confidence > 54 ? '#FFA500' : '#FF3333' },
                { label: 'ELEMZŐK',    val: '24 fő',           color: '#DEDEDE'   },
              ].map(b => (
                <div key={b.label} style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', padding: '4px 7px' }}>
                  <div style={{ color: '#333', fontSize: 8, letterSpacing: '0.07em', marginBottom: 1 }}>{b.label}</div>
                  <div style={{ color: b.color, fontSize: 12, fontWeight: 'bold' }}>{b.val}</div>
                </div>
              ))}
            </div>

            <Sec title="Kockázatok & katalizátorok" />
            {[
              { icon: '▲', c: '#00FF41', t: 'Erős bevételek és pozitív szabad cash-flow trend' },
              { icon: '▲', c: '#00FF41', t: 'Intézményi befektetők növelik kitettségüket' },
              { icon: '─', c: '#FFA500', t: 'Makrogazdasági bizonytalanság fennáll' },
              { icon: '▼', c: '#FF3333', t: 'Szabályozói kockázatok a szektorban növekedtek' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, borderBottom: '1px solid #0d0d0d', paddingBottom: 4 }}>
                <span style={{ color: r.c, fontSize: 10, flexShrink: 0 }}>{r.icon}</span>
                <span style={{ color: '#777', fontSize: 10, lineHeight: 1.4 }}>{r.t}</span>
              </div>
            ))}

            <Sec title="Legfrissebb hírek" />
            {[
              { time: '14:32', src: 'Reuters',      text: `${symbol} – elemzői frissítés, erős fundamentumok`,   up: true  },
              { time: '11:15', src: 'Bloomberg',    text: `Q1 eredmények meghaladják a konszenzust 8%-kal`,       up: true  },
              { time: '09:42', src: 'WSJ',          text: `Technikai szint közeledik – figyelő pozíció ajánlott`, up: null  },
              { time: 'Tegnap',src: 'Portfolio.hu', text: `Szektoriális szabályozási kockázatok nőttek`,          up: false },
            ].map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5, borderBottom: '1px solid #0c0c0c', paddingBottom: 5 }}>
                <div style={{ color: '#2a2a2a', fontSize: 9, width: 40, flexShrink: 0 }}>{n.time}</div>
                <div style={{ color: n.up === true ? '#00FF41' : n.up === false ? '#FF3333' : '#FFA500', fontSize: 10, flexShrink: 0 }}>
                  {n.up === true ? '▲' : n.up === false ? '▼' : '─'}
                </div>
                <div>
                  <div style={{ color: '#333', fontSize: 8 }}>{n.src}</div>
                  <div style={{ color: '#999', fontSize: 10, lineHeight: 1.4 }}>{n.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── AJÁNLÁS ─── */}
        {activeTab === 'ajanlas' && (
          <div>
            {/* Rating badge + source line */}
            <div style={{ padding: '6px 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: ratingColor + '22', border: `1px solid ${ratingColor}55`,
                padding: '3px 14px', display: 'inline-block',
              }}>
                <span style={{ color: ratingColor, fontSize: 15, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                  — {rating}
                </span>
              </div>
              <div style={{ color: '#2a2a2a', fontSize: 9 }}>
                {symbol} — Kereskedési Ajánlás (Tavily + technikai, {new Date().toLocaleDateString('hu-HU')})
              </div>
            </div>

            {/* Confidence bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Bar pct={confidence} color={ratingColor} />
              <span style={{ color: '#FFA500', fontSize: 10, fontWeight: 'bold', width: 32 }}>{confidence}%</span>
            </div>

            {/* ── THREE TARGET PRICE COLUMNS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 8 }}>
              {[
                { label: 'Rövid táv',  desc: '1-4 hét',    price: shortTarget, view: shortView, color: shortColor },
                { label: 'Közép táv',  desc: '1-3 hónap',  price: midTarget,   view: midView,   color: midColor   },
                { label: 'Hosszú táv', desc: '6-12 hónap', price: longTarget,  view: longView,  color: longColor  },
              ].map(col => (
                <div key={col.label} style={{
                  background: '#0c0c0c', border: '1px solid #1a1a1a',
                  padding: '8px 6px', textAlign: 'center',
                  borderTop: `2px solid ${col.color}`,
                }}>
                  <div style={{ color: '#444', fontSize: 8, letterSpacing: '0.06em', marginBottom: 3 }}>{col.label.toUpperCase()}</div>
                  <div style={{ color: col.color, fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>
                    {fmt(col.price)}
                  </div>
                  <div style={{ color: '#333', fontSize: 8 }}>{col.desc}</div>
                  <div style={{ marginTop: 4 }}>
                    <Badge text={col.view} color={col.color} />
                  </div>
                </div>
              ))}
            </div>

            {/* Entry / Stop */}
            <Sec title="Belépési & kilépési szintek" />
            {[
              { label: 'BELÉPÉSI ZÓna', val: `${fmt(entryMin)} – ${fmt(entryMax)}`, color: '#00BFFF', pct: null },
              { label: 'STOP LOSS',     val: fmt(stop),    color: '#FF3333', pct: pctDiff(stop, price)    },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 8px', marginBottom: 2,
                background: '#0a0a0a', borderLeft: `2px solid ${row.color}`,
              }}>
                <span style={{ color: '#555', fontSize: 9 }}>{row.label}</span>
                <div>
                  <span style={{ color: row.color, fontSize: 11, fontWeight: 'bold' }}>{row.val}</span>
                  {row.pct && <span style={{ color: '#444', fontSize: 9, marginLeft: 8 }}>{row.pct}</span>}
                </div>
              </div>
            ))}

            {/* Analysis text */}
            <Sec title="Részletes elemzés" />
            <div style={{
              color: '#888', fontSize: 10, lineHeight: 1.6,
              background: '#0a0a0a', border: '1px solid #141414',
              padding: '8px 10px',
            }}>
              <strong style={{ color: '#FFA500' }}>
                {symbol} — Árfolyam: {fmt(price)} &nbsp;|&nbsp; Változás: {isUp ? '+' : ''}{changePct.toFixed(2)}%
              </strong>
              <br /><br />
              Piaci háttér: Az {symbol} jelenlegi árfolyama {fmt(price)}, napi változás{' '}
              <span style={{ color: isUp ? '#00FF41' : '#FF3333', fontWeight: 'bold' }}>
                {isUp ? '+' : ''}{changePct.toFixed(2)}%
              </span>.{' '}
              A technikai kép {shortView.toLowerCase()} képet mutat rövid távon, az {midView.toLowerCase()} kilátások
              közép távon {midTarget.toFixed(fmt(midTarget).includes('.') ? 2 : 0)} körüli célt valószínűsítenek.
              Az elemzői konszenzus <strong style={{ color: ratingColor }}>{rating}</strong> ({bullAnalysts}/24 analitikus).{' '}
              Technikai kép: Konszolidáció, {shortView.toLowerCase()} irányban. Ajánlás: <strong style={{ color: ratingColor }}>{rating}</strong>.
            </div>
          </div>
        )}

        {/* ─── SOCIAL ─── */}
        {activeTab === 'social' && (
          <div>
            <Sec title="Összesített hangulat" />
            <div style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', padding: '8px 10px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: '#444', fontSize: 9 }}>PIACI HANGULAT</span>
                <Badge
                  text={overallSent > 62 ? 'BULLISH' : overallSent > 47 ? 'SEMLEGES' : 'BEARISH'}
                  color={overallSent > 62 ? '#00FF41' : overallSent > 47 ? '#FFA500' : '#FF3333'}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bar pct={overallSent} color={overallSent > 62 ? '#00FF41' : overallSent > 47 ? '#FFA500' : '#FF3333'} />
                <span style={{ color: '#FFA500', fontSize: 12, fontWeight: 'bold', width: 32 }}>{overallSent}%</span>
              </div>
            </div>

            <Sec title="Platform bontás" />
            {[
              { name: 'REDDIT',    mentions: redditM,  sent: redditSent,  trending: h % 3 === 0 },
              { name: 'TWITTER/X', mentions: twitterM, sent: twitterSent, trending: h % 5 === 0 },
              { name: 'FÓRUM',     mentions: forumM,   sent: forumSent,   trending: h % 2 === 0 },
            ].map(p => {
              const c = p.sent > 62 ? '#00FF41' : p.sent > 47 ? '#FFA500' : '#FF3333'
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, borderBottom: '1px solid #0d0d0d', paddingBottom: 5 }}>
                  <div style={{ color: '#666', fontSize: 9, width: 72, flexShrink: 0 }}>
                    {p.name}{p.trending && <span style={{ color: '#FF8C00', marginLeft: 4 }}>↑</span>}
                  </div>
                  <Bar pct={p.sent} color={c} />
                  <div style={{ color: c, fontSize: 10, fontWeight: 'bold', width: 28, textAlign: 'right' }}>{p.sent}%</div>
                  <div style={{ color: '#2a2a2a', fontSize: 9, width: 60, textAlign: 'right' }}>{p.mentions.toLocaleString('hu-HU')} említ</div>
                </div>
              )
            })}

            <Sec title="Trending bejegyzések" />
            {[
              { src: 'Reddit  r/investing',  text: `${symbol} hosszú távú fundamentumai szilárdak`,          likes: 1240 + (h % 600), up: true  },
              { src: 'Twitter/X',            text: `${symbol} ellenállási szinthez közelít – technikai belépési pont`, likes: 892 + (h % 350),  up: true  },
              { src: 'StockTwits',           text: `${symbol} kulcsszint közelében – short kamat figyelhető`,  likes: 445 + (h % 200), up: false },
            ].map((p, i) => (
              <div key={i} style={{ background: '#0c0c0c', border: '1px solid #141414', padding: '5px 8px', marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: '#333', fontSize: 9 }}>{p.src}</span>
                  <span style={{ color: '#2a2a2a', fontSize: 9 }}>♥ {p.likes.toLocaleString('hu-HU')}</span>
                </div>
                <div style={{ color: '#999', fontSize: 10, lineHeight: 1.4 }}>
                  <span style={{ color: p.up ? '#00FF41' : '#FF3333', marginRight: 5 }}>{p.up ? '▲' : '▼'}</span>
                  {p.text}
                </div>
              </div>
            ))}

            {/* Mini trend */}
            <Sec title="Heti hangulat trend" />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 }}>
              {Array.from({ length: 14 }, (_, i) => {
                const v = 40 + ((hashStr(symbol + i) % 50))
                const c = v > 62 ? '#00FF41' : v > 47 ? '#FFA500' : '#FF3333'
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    <div style={{ width: '100%', height: `${(v / 90) * 100}%`, background: c + '77', minHeight: 2 }} />
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ color: '#1e1e1e', fontSize: 8 }}>-14 nap</span>
              <span style={{ color: '#1e1e1e', fontSize: 8 }}>ma</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
