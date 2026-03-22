'use client'
import { useState, useEffect, useRef } from 'react'
import type { AIAnalysis } from '@/app/api/ai-analysis/route'

interface Props {
  symbol: string
  price: number
  changePct: number
  panelNum?: number
}

type Tab = 'kutatas' | 'ajanlas' | 'social'

const RATING_COLORS: Record<string, string> = {
  'ERŐS VÉTEL': '#00FF41',
  'VÉTEL':      '#7FFF00',
  'TART':       '#FFA500',
  'ELADÁS':     '#FF3333',
}

const VIEW_COLORS: Record<string, string> = {
  'EMELKEDŐ':  '#00FF41',
  'SEMLEGES':  '#FFA500',
  'CSÖKKENŐ':  '#FF3333',
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 4, background: '#1a1a1a', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', background: color, transition: 'width 0.6s' }} />
    </div>
  )
}

function Sec({ title }: { title: string }) {
  return (
    <div style={{
      color: '#333', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
      marginTop: 10, marginBottom: 5, paddingBottom: 3, borderBottom: '1px solid #141414',
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
  if (n >= 10000) return n.toLocaleString('hu-HU', { maximumFractionDigits: 0 })
  if (n >= 1000)  return n.toFixed(2)
  if (n >= 10)    return n.toFixed(3)
  return n.toFixed(4)
}

function pctDiff(a: number, b: number): string {
  const d = ((a / b) - 1) * 100
  return (d >= 0 ? '+' : '') + d.toFixed(1) + '%'
}

function timeSince(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}mp`
  if (diff < 3600) return `${Math.floor(diff / 60)} perce`
  return `${Math.floor(diff / 3600)} órája`
}

export function AIAnalysisPanel({ symbol, price, changePct, panelNum = 4 }: Props) {
  const [activeTab,  setActiveTab]  = useState<Tab>('ajanlas')
  const [analysis,   setAnalysis]   = useState<AIAnalysis | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [dots,       setDots]       = useState('')
  const abortRef = useRef<AbortController | null>(null)

  // Loading dots animation
  useEffect(() => {
    if (!loading) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 300)
    return () => clearInterval(id)
  }, [loading])

  // Fetch analysis when symbol changes
  useEffect(() => {
    if (!symbol) return

    // Cancel previous request
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setLoading(true)
    setError(null)
    setAnalysis(null)

    const url = `/api/ai-analysis?symbol=${encodeURIComponent(symbol)}&price=${price}&changePct=${changePct}`

    fetch(url, { signal: ctrl.signal })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error ?? `HTTP ${res.status}`) })
        return res.json()
      })
      .then((data: AIAnalysis) => {
        setAnalysis(data)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError(err.message ?? 'Ismeretlen hiba')
        setLoading(false)
      })

    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'kutatas', label: 'KUTATÁS' },
    { id: 'ajanlas', label: 'AJÁNLÁS' },
    { id: 'social',  label: 'SOCIAL'  },
  ]

  const ratingColor = analysis ? (RATING_COLORS[analysis.rating] ?? '#FFA500') : '#444'
  const isUp = changePct >= 0

  return (
    <div className="bb-panel">
      {/* Header */}
      <div className="bb-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="panel-num">{panelNum}</span>
          <span>AI — Mesterséges intelligencia elemzés</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading && <span style={{ color: '#FF8C00', fontSize: 9, animation: 'none' }}>◌</span>}
          <span style={{ background: '#FF8C00', color: '#000', fontSize: 9, padding: '1px 6px', fontWeight: 'bold' }}>AI ▾</span>
        </div>
      </div>

      {/* Sub-header */}
      <div style={{
        background: '#0a0a0a', borderBottom: '1px solid #1a1a1a',
        padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ color: '#FFD700', fontSize: 10, fontWeight: 'bold' }}>{symbol}</span>
        <span style={{ fontSize: 9, color: '#333' }}>Tavily</span>
        <span style={{ fontSize: 9, color: '#222' }}>+</span>
        <span style={{ fontSize: 9, color: '#333' }}>Claude</span>
        {analysis && (
          <span style={{ color: '#2a2a2a', fontSize: 9 }}>
            ⊙ {timeSince(analysis.generatedAt)}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => {
            setAnalysis(null)
            setError(null)
            setLoading(true)
            const url = `/api/ai-analysis?symbol=${encodeURIComponent(symbol)}&price=${price}&changePct=${changePct}&t=${Date.now()}`
            fetch(url)
              .then(r => r.json())
              .then((data: AIAnalysis) => { setAnalysis(data); setLoading(false) })
              .catch(err => { setError(err.message); setLoading(false) })
          }}
          style={{
            background: '#1a1000', border: '1px solid #3a2000', color: '#FF8C00',
            fontSize: 9, padding: '0 6px', cursor: 'pointer', fontFamily: 'Courier New',
          }}
        >
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
              <span style={{
                display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                background: '#FF8C00', marginRight: 4, marginBottom: 1, verticalAlign: 'middle',
              }} />
            )}
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="bb-panel-body" style={{ padding: '4px 8px 8px' }}>

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, gap: 8 }}>
            <div style={{ color: '#FF8C00', fontSize: 11 }}>◌ AI elemzés{dots}</div>
            <div style={{ color: '#2a2a2a', fontSize: 9 }}>Tavily keresés → Claude szintézis</div>
            <div style={{ color: '#1a1a1a', fontSize: 9 }}>{symbol} · valós idejű adatok</div>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && error && (
          <div style={{ padding: '12px 8px' }}>
            <div style={{ color: '#FF3333', fontSize: 10, marginBottom: 6 }}>⚠ Elemzés sikertelen</div>
            <div style={{ color: '#444', fontSize: 9, fontFamily: 'monospace', wordBreak: 'break-all' }}>{error}</div>
            <div style={{ color: '#333', fontSize: 9, marginTop: 8 }}>
              Ellenőrizd a TAVILY_API_KEY és ANTHROPIC_API_KEY env változókat.
            </div>
          </div>
        )}

        {/* ── DATA ── */}
        {!loading && !error && analysis && (
          <>
            {/* ─── KUTATÁS ─── */}
            {activeTab === 'kutatas' && (
              <div>
                {/* Tavily AI összefoglaló */}
                {analysis.tavilyAnswer && (
                  <>
                    <Sec title="Tavily AI összefoglaló" />
                    <div style={{
                      color: '#888', fontSize: 10, lineHeight: 1.6,
                      background: '#080808', border: '1px solid #141414',
                      padding: '6px 8px', marginBottom: 6,
                    }}>
                      {analysis.tavilyAnswer}
                    </div>
                  </>
                )}

                <Sec title="Elemzői konszenzus" />
                {[
                  { label: 'VÉTEL',   count: analysis.analysts.bull, color: '#00FF41' },
                  { label: 'TART',    count: analysis.analysts.hold, color: '#FFA500' },
                  { label: 'ELADÁS',  count: analysis.analysts.sell, color: '#FF3333' },
                ].map(r => {
                  const total = analysis.analysts.bull + analysis.analysts.hold + analysis.analysts.sell
                  return (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div style={{ color: '#555', fontSize: 9, width: 50 }}>{r.label}</div>
                      <Bar pct={(r.count / total) * 100} color={r.color} />
                      <div style={{ color: r.color, fontSize: 9, width: 36, textAlign: 'right' }}>
                        {r.count}/{total}
                      </div>
                    </div>
                  )
                })}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
                  {[
                    { label: 'KONSZENZUS', val: analysis.rating,               color: ratingColor },
                    { label: '12H CÉLÁR',  val: fmt(analysis.targetPrice),     color: '#FFA500'   },
                    { label: 'BIZALOM',    val: analysis.confidence + '%',      color: analysis.confidence > 68 ? '#00FF41' : analysis.confidence > 54 ? '#FFA500' : '#FF3333' },
                    { label: 'ELEMZŐK',    val: `${analysis.analysts.bull + analysis.analysts.hold + analysis.analysts.sell} fő`, color: '#DEDEDE' },
                  ].map(b => (
                    <div key={b.label} style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', padding: '4px 7px' }}>
                      <div style={{ color: '#333', fontSize: 8, letterSpacing: '0.07em', marginBottom: 2 }}>{b.label}</div>
                      <div style={{ color: b.color, fontSize: 12, fontWeight: 'bold' }}>{b.val}</div>
                    </div>
                  ))}
                </div>

                <Sec title="Katalizátorok & kockázatok" />
                {analysis.catalysts.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, borderBottom: '1px solid #0d0d0d', paddingBottom: 4 }}>
                    <span style={{ color: '#00FF41', fontSize: 10, flexShrink: 0 }}>▲</span>
                    <span style={{ color: '#777', fontSize: 10, lineHeight: 1.4 }}>{c}</span>
                  </div>
                ))}
                {analysis.risks.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, borderBottom: '1px solid #0d0d0d', paddingBottom: 4 }}>
                    <span style={{ color: '#FF3333', fontSize: 10, flexShrink: 0 }}>▼</span>
                    <span style={{ color: '#777', fontSize: 10, lineHeight: 1.4 }}>{r}</span>
                  </div>
                ))}

                <Sec title="Legfrissebb hírek" />
                {analysis.news.map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5, borderBottom: '1px solid #0c0c0c', paddingBottom: 5 }}>
                    <div style={{ color: '#2a2a2a', fontSize: 9, width: 44, flexShrink: 0 }}>{n.time}</div>
                    <div style={{ color: n.up === true ? '#00FF41' : n.up === false ? '#FF3333' : '#FFA500', fontSize: 10, flexShrink: 0 }}>
                      {n.up === true ? '▲' : n.up === false ? '▼' : '─'}
                    </div>
                    <div>
                      <div style={{ color: '#333', fontSize: 8 }}>{n.source}</div>
                      <div style={{ color: '#999', fontSize: 10, lineHeight: 1.4 }}>
                        {n.url
                          ? <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{n.text}</a>
                          : n.text
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── AJÁNLÁS ─── */}
            {activeTab === 'ajanlas' && (
              <div>
                <div style={{ padding: '6px 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    background: ratingColor + '22', border: `1px solid ${ratingColor}55`,
                    padding: '3px 14px', display: 'inline-block',
                  }}>
                    <span style={{ color: ratingColor, fontSize: 15, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                      — {analysis.rating}
                    </span>
                  </div>
                  <div style={{ color: '#2a2a2a', fontSize: 9 }}>
                    {symbol} · Tavily + Claude · {new Date(analysis.generatedAt).toLocaleDateString('hu-HU')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Bar pct={analysis.confidence} color={ratingColor} />
                  <span style={{ color: '#FFA500', fontSize: 10, fontWeight: 'bold', width: 32 }}>{analysis.confidence}%</span>
                </div>

                {/* Three target columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 8 }}>
                  {[
                    { label: 'Rövid táv',  desc: '1–4 hét',    price: analysis.shortTarget, view: analysis.shortView, color: VIEW_COLORS[analysis.shortView] ?? '#FFA500' },
                    { label: 'Közép táv',  desc: '1–3 hónap',  price: analysis.midTarget,   view: analysis.midView,   color: VIEW_COLORS[analysis.midView]   ?? '#FFA500' },
                    { label: 'Hosszú táv', desc: '6–12 hónap', price: analysis.longTarget,  view: analysis.longView,  color: VIEW_COLORS[analysis.longView]  ?? '#FFA500' },
                  ].map(col => (
                    <div key={col.label} style={{
                      background: '#0c0c0c', border: '1px solid #1a1a1a',
                      padding: '8px 6px', textAlign: 'center',
                      borderTop: `2px solid ${col.color}`,
                    }}>
                      <div style={{ color: '#444', fontSize: 8, letterSpacing: '0.06em', marginBottom: 3 }}>{col.label.toUpperCase()}</div>
                      <div style={{ color: col.color, fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>{fmt(col.price)}</div>
                      <div style={{ color: '#333', fontSize: 8 }}>{col.desc}</div>
                      <div style={{ color: '#333', fontSize: 8, marginTop: 2 }}>
                        {col.price > price ? '+' : ''}{pctDiff(col.price, price)}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Badge text={col.view} color={col.color} />
                      </div>
                    </div>
                  ))}
                </div>

                <Sec title="Belépési & kilépési szintek" />
                {[
                  { label: 'BELÉPÉSI ZÓNA', val: `${fmt(analysis.entryMin)} – ${fmt(analysis.entryMax)}`, color: '#00BFFF', pct: null },
                  { label: 'STOP LOSS',     val: fmt(analysis.stopLoss),  color: '#FF3333', pct: pctDiff(analysis.stopLoss, price) },
                  { label: '12H CÉLÁR',     val: fmt(analysis.targetPrice), color: '#FFA500', pct: pctDiff(analysis.targetPrice, price) },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '4px 8px', marginBottom: 3,
                    background: '#0a0a0a', borderLeft: `2px solid ${row.color}`,
                  }}>
                    <span style={{ color: '#555', fontSize: 9 }}>{row.label}</span>
                    <div>
                      <span style={{ color: row.color, fontSize: 11, fontWeight: 'bold' }}>{row.val}</span>
                      {row.pct && <span style={{ color: '#444', fontSize: 9, marginLeft: 8 }}>{row.pct}</span>}
                    </div>
                  </div>
                ))}

                <Sec title="AI elemzés" />
                <div style={{
                  color: '#888', fontSize: 10, lineHeight: 1.7,
                  background: '#0a0a0a', border: '1px solid #141414',
                  padding: '8px 10px',
                }}>
                  <strong style={{ color: '#FFA500' }}>
                    {symbol} · {fmt(price)} · {isUp ? '+' : ''}{changePct.toFixed(2)}%
                  </strong>
                  <br /><br />
                  {analysis.summary}
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
                      text={analysis.sentiment.overall > 62 ? 'BULLISH' : analysis.sentiment.overall > 47 ? 'SEMLEGES' : 'BEARISH'}
                      color={analysis.sentiment.overall > 62 ? '#00FF41' : analysis.sentiment.overall > 47 ? '#FFA500' : '#FF3333'}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bar
                      pct={analysis.sentiment.overall}
                      color={analysis.sentiment.overall > 62 ? '#00FF41' : analysis.sentiment.overall > 47 ? '#FFA500' : '#FF3333'}
                    />
                    <span style={{ color: '#FFA500', fontSize: 12, fontWeight: 'bold', width: 32 }}>
                      {analysis.sentiment.overall}%
                    </span>
                  </div>
                </div>

                <Sec title="Platform bontás" />
                {[
                  { name: 'REDDIT',    sent: analysis.sentiment.reddit  },
                  { name: 'TWITTER/X', sent: analysis.sentiment.twitter },
                  { name: 'FÓRUM',     sent: analysis.sentiment.forum   },
                ].map(p => {
                  const c = p.sent > 62 ? '#00FF41' : p.sent > 47 ? '#FFA500' : '#FF3333'
                  return (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, borderBottom: '1px solid #0d0d0d', paddingBottom: 5 }}>
                      <div style={{ color: '#666', fontSize: 9, width: 72, flexShrink: 0 }}>{p.name}</div>
                      <Bar pct={p.sent} color={c} />
                      <div style={{ color: c, fontSize: 10, fontWeight: 'bold', width: 28, textAlign: 'right' }}>{p.sent}%</div>
                    </div>
                  )
                })}

                <Sec title="Trending bejegyzések" />
                {analysis.news.map((n, i) => (
                  <div key={i} style={{ background: '#0c0c0c', border: '1px solid #141414', padding: '5px 8px', marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: '#333', fontSize: 9 }}>{n.source}</span>
                      <span style={{ color: '#2a2a2a', fontSize: 9 }}>{n.time}</span>
                    </div>
                    <div style={{ color: '#999', fontSize: 10, lineHeight: 1.4 }}>
                      <span style={{ color: n.up === true ? '#00FF41' : n.up === false ? '#FF3333' : '#FFA500', marginRight: 5 }}>
                        {n.up === true ? '▲' : n.up === false ? '▼' : '─'}
                      </span>
                      {n.url
                        ? <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{n.text}</a>
                        : n.text
                      }
                    </div>
                  </div>
                ))}

                <Sec title="Adatforrás" />
                <div style={{ color: '#2a2a2a', fontSize: 9, lineHeight: 1.8 }}>
                  <div>Keresőmotor: Tavily Web Search API</div>
                  <div>Szintézis: Anthropic Claude 3.5 Haiku</div>
                  <div>Generálva: {new Date(analysis.generatedAt).toLocaleString('hu-HU')}</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && !analysis && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
            <span style={{ color: '#2a2a2a', fontSize: 10 }}>Válassz szimbólumot az elemzéshez</span>
          </div>
        )}

      </div>
    </div>
  )
}
