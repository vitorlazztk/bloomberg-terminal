'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { TickerBar }       from '@/components/layout/TickerBar'
import { TerminalHeader }  from '@/components/layout/TerminalHeader'
import { CommandBar }      from '@/components/layout/CommandBar'
import { BottomBar, BottomCategory } from '@/components/layout/BottomBar'
import { WEIPanel }        from '@/components/panels/WEIPanel'
import { FXCPanel }        from '@/components/panels/FXCPanel'
import { ChartPanel }      from '@/components/panels/ChartPanel'
import { AIAnalysisPanel } from '@/components/panels/AIAnalysisPanel'
import { WatchlistPanel }  from '@/components/panels/WatchlistPanel'
import { NewsPanel }       from '@/components/panels/NewsPanel'
import { FXPanel }         from '@/components/panels/FXPanel'
import { BUXPanel }        from '@/components/panels/BUXPanel'
import { MarketOverviewPanel } from '@/components/panels/MarketOverviewPanel'
import { useSimulatedPrices }  from '@/hooks/useSimulatedPrices'
import { useLivePrices, useLiveFX, mergePrices } from '@/hooks/useLiveData'
import { TickerData, FXRate }  from '@/lib/types'
import {
  EQUITY_TICKERS, INDEX_TICKERS, FX_RATES,
  CRYPTO_TICKERS, COMMODITY_TICKERS, MOCK_NEWS, BUX_TICKERS,
} from '@/lib/mockData'

// ── Layout types ──────────────────────────────────────────────────────────────
type Layout =
  | 'default'       // WEI | FXC | GP | AI  (the Bloomberg 4-panel)
  | 'focus-chart'   // sidebar + chart
  | 'focus-news'    // news + sidebar
  | 'focus-fx'      // FX list + chart (when pair selected)
  | 'focus-ai'      // sidebar + AI panel
  | 'focus-bux'     // BÉT panel + chart

interface ChartItem {
  symbol: string
  price: number
  changePct: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function tickerToChart(t: TickerData): ChartItem {
  return { symbol: t.symbol, price: t.price, changePct: t.changePct }
}
function fxToChart(r: FXRate): ChartItem {
  return { symbol: r.pair, price: r.rate, changePct: r.changePct }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [layout,       setLayout]       = useState<Layout>('default')
  const [chartItem,    setChartItem]    = useState<ChartItem>({ symbol: 'EUR/HUF', price: 393.08, changePct: 0.51 })
  const [selectedPair, setSelectedPair] = useState<string | undefined>('EUR/HUF')
  const [bottomCat,    setBottomCat]    = useState<BottomCategory>('DEVIZA')

  // ── Simulated prices (smooth real-time feel) ──────────────────────────────
  const { tickers: simEquities, flashMap: eqFlash }  = useSimulatedPrices(EQUITY_TICKERS, 1000)
  const { tickers: simIndices,  flashMap: idxFlash }  = useSimulatedPrices(INDEX_TICKERS,  1500)
  const { tickers: simBux,      flashMap: buxFlash }  = useSimulatedPrices(BUX_TICKERS,    1200)

  // ── Live prices from Yahoo Finance (corrects simulation every 60s) ─────────
  const { priceMap, source: priceSource } = useLivePrices(60_000)

  // Merge: live prices correct the simulated baseline
  const equities  = mergePrices(simEquities, priceMap)
  const indices   = mergePrices(simIndices,  priceMap)
  const buxTickers = mergePrices(simBux,     priceMap)

  // ── Live FX rates from Frankfurter/ECB ───────────────────────────────────
  const { rates: fxRates } = useLiveFX(FX_RATES, 60_000)

  // Refs for stable command handler
  const equitiesRef  = useRef(equities)
  const indicesRef   = useRef(indices)
  const chartItemRef = useRef(chartItem)
  useEffect(() => { equitiesRef.current  = equities  }, [equities])
  useEffect(() => { indicesRef.current   = indices   }, [indices])
  useEffect(() => { chartItemRef.current = chartItem }, [chartItem])

  // Sync chart price for live tickers
  useEffect(() => {
    const live = [...equities, ...indices].find(t => t.symbol === chartItem.symbol)
    if (live) setChartItem(tickerToChart(live))
  }, [equities, indices, chartItem.symbol])

  // ── Command handler (stable via refs) ─────────────────────────────────────
  const handleCommand = useCallback((cmd: string) => {
    const parts = cmd.trim().toUpperCase().split(/\s+/)
    const first = parts[0]

    if (first === 'WEI' || first === 'INDEX' || first === 'MONITOR') {
      setLayout('default')
      setBottomCat('INDEX')
    } else if (first === 'FXC' || first === 'FX' || first === 'FXIP' || first === 'DEVIZA') {
      setLayout('focus-fx')
      setBottomCat('DEVIZA')
    } else if (first === 'NEWS' || first === 'TOP' || first === 'NI') {
      setLayout('focus-news')
    } else if (first === 'EQUITY' || first === 'STOCK' || first === 'RÉSZVÉNY') {
      setLayout('focus-chart')
      setBottomCat('RÉSZVÉNY')
    } else if (first === 'AI' || first === 'ANL') {
      setLayout('focus-ai')
    } else if (first === 'CMDTY' || first === 'COMCTY' || first === 'NYERSANYAG') {
      setBottomCat('NYERSANYAG')
      setLayout('focus-chart')
    } else if (first === 'BUX') {
      setBottomCat('BUX')
      setLayout('focus-bux')
    } else if (first === 'GP' || parts.some(p => p === 'GP')) {
      setLayout('focus-chart')
    } else if (first === 'BACK' || first === 'MENU' || first === 'ESC' || first === 'IMAP') {
      setLayout('default')
    } else if (parts.length >= 2 && parts.some(p => p === 'GP')) {
      // e.g. "AAPL GP"
      const sym = parts.find(p => p !== 'GP' && p !== 'US' && p !== 'EQUITY') ?? first
      const found = [...equitiesRef.current, ...indicesRef.current].find(t => t.symbol === sym)
      if (found) setChartItem(tickerToChart(found))
      setLayout('focus-chart')
    }
  }, [])

  // ── Global keyboard handler ────────────────────────────────────────────────
  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    const map: Record<string, string> = {
      F2: 'STOCK', F3: 'FXC', F4: 'BONDS', F5: 'CMDTY',
      F6: 'AI', F7: 'BUX', F8: 'WEI', F9: 'TOP', F10: 'GP', Escape: 'BACK',
    }
    if (map[e.key]) { e.preventDefault(); handleCommand(map[e.key]) }
  }, [handleCommand])

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [handleGlobalKey])

  // ── Click handlers ────────────────────────────────────────────────────────
  // Index/equity click → show in chart (stay in current layout or switch to default)
  const handleIndexSelect = useCallback((t: TickerData) => {
    setChartItem(tickerToChart(t))
    setSelectedPair(undefined)
  }, [])

  // Equity click in sidebars → show chart
  const handleTickerSelect = useCallback((t: TickerData) => {
    setChartItem(tickerToChart(t))
    setSelectedPair(undefined)
    setLayout('focus-chart')
  }, [])

  // FX click → show chart inline in default/fx view
  const handleFxSelect = useCallback((r: FXRate) => {
    setChartItem(fxToChart(r))
    setSelectedPair(r.pair)
    // In default layout: just update GP panel
    // In focus-fx: update chart on right
  }, [])

  // AI sidebar ticker select
  const handleAISelect = useCallback((t: TickerData) => {
    setChartItem(tickerToChart(t))
    setSelectedPair(undefined)
  }, [])

  // Bottom category → navigate
  const handleCategory = useCallback((cat: BottomCategory) => {
    setBottomCat(cat)
    if (cat === 'INDEX')      setLayout('default')
    else if (cat === 'DEVIZA') setLayout('focus-fx')
    else if (cat === 'RÉSZVÉNY' || cat === 'STOCK') setLayout('focus-chart')
    else if (cat === 'NYERSANYAG')                   setLayout('focus-chart')
    else if (cat === 'BUX')                          setLayout('focus-bux')
  }, [])

  // ── Loaded symbol label ───────────────────────────────────────────────────
  const loadedSymbol = selectedPair ?? chartItem.symbol

  // ── Layout panel number ───────────────────────────────────────────────────
  const panelNum = layout === 'default' ? 1 : layout === 'focus-bux' ? 2 : 2

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>

      {/* Scrolling ticker bar */}
      <TickerBar />

      {/* Header */}
      <TerminalHeader loadedSymbol={loadedSymbol} />

      {/* Command bar + quick buttons */}
      <CommandBar onCommand={handleCommand} />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0 }}>

        {/* ═══ DEFAULT: WEI | FXC | GP | AI ═══════════════════════════════════ */}
        {layout === 'default' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            height: '100%', gap: 1, background: '#111',
          }}>
            {/* Panel 1 – WEI */}
            <WEIPanel
              indices={indices}
              flashMap={idxFlash}
              onSelect={handleIndexSelect}
              selectedSymbol={chartItem.symbol}
              panelNum={1}
            />

            {/* Panel 2 – FXC */}
            <FXCPanel
              rates={fxRates}
              onSelect={handleFxSelect}
              selectedPair={selectedPair}
              panelNum={2}
            />

            {/* Panel 3 – GP (chart) */}
            <div style={{ position: 'relative', height: '100%', minHeight: 0 }}>
              <ChartPanel
                symbol={chartItem.symbol}
                price={chartItem.price}
                changePct={chartItem.changePct}
                panelNum={3}
              />
            </div>

            {/* Panel 4 – AI */}
            <AIAnalysisPanel
              symbol={chartItem.symbol}
              price={chartItem.price}
              changePct={chartItem.changePct}
              panelNum={4}
            />
          </div>
        )}

        {/* ═══ FOCUS-CHART ═════════════════════════════════════════════════════ */}
        {layout === 'focus-chart' && (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%', gap: 1, background: '#111' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <WatchlistPanel title="EQUITY" tickers={equities.slice(0, 5)} flashMap={eqFlash}
                showVol={false} onSelect={handleTickerSelect} selectedSymbol={chartItem.symbol} />
              <WatchlistPanel title="INDICES" tickers={indices.slice(0, 5)} flashMap={idxFlash}
                showVol={false} priceDecimals={0} onSelect={handleTickerSelect} selectedSymbol={chartItem.symbol} />
              <FXPanel rates={fxRates.slice(0, 4)} onSelect={(r) => { setChartItem(fxToChart(r)); setSelectedPair(r.pair) }} selectedPair={selectedPair} />
            </div>
            <ChartPanel symbol={chartItem.symbol} price={chartItem.price} changePct={chartItem.changePct} panelNum={3} />
          </div>
        )}

        {/* ═══ FOCUS-FX ════════════════════════════════════════════════════════ */}
        {layout === 'focus-fx' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedPair ? '1fr 1fr' : '1fr 260px',
            height: '100%', gap: 1, background: '#111',
          }}>
            <FXCPanel rates={fxRates} onSelect={handleFxSelect} selectedPair={selectedPair} panelNum={2} />
            {selectedPair ? (
              <ChartPanel symbol={chartItem.symbol} price={chartItem.price} changePct={chartItem.changePct} panelNum={3} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <WatchlistPanel title="NYERSANYAGOK" tickers={COMMODITY_TICKERS} flashMap={{}} showVol={false} onSelect={handleTickerSelect} selectedSymbol={chartItem.symbol} />
                <WatchlistPanel title="CRYPTO" tickers={CRYPTO_TICKERS} flashMap={{}} showVol={false} onSelect={handleTickerSelect} selectedSymbol={chartItem.symbol} />
              </div>
            )}
          </div>
        )}

        {/* ═══ FOCUS-NEWS ══════════════════════════════════════════════════════ */}
        {layout === 'focus-news' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', height: '100%', gap: 1, background: '#111' }}>
            <NewsPanel news={MOCK_NEWS} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <WatchlistPanel title="INDEXEK" tickers={indices} flashMap={idxFlash} showVol={false} priceDecimals={0} onSelect={handleTickerSelect} selectedSymbol={chartItem.symbol} />
              <WatchlistPanel title="CRYPTO" tickers={CRYPTO_TICKERS} flashMap={{}} showVol={false} onSelect={handleTickerSelect} selectedSymbol={chartItem.symbol} />
            </div>
          </div>
        )}

        {/* ═══ FOCUS-BUX ═══════════════════════════════════════════════════════ */}
        {layout === 'focus-bux' && (() => {
          const buxIndex = indices.find(t => t.symbol === 'BUX') ?? buxTickers[0]
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%', gap: 1, background: '#111' }}>
              <BUXPanel
                buxIndex={buxIndex ?? { symbol: 'BUX', name: 'BUX Index', price: 85420, prevPrice: 84210, change: 1210, changePct: 1.44, volume: 0, type: 'index' }}
                tickers={buxTickers}
                flashMap={buxFlash}
                onSelect={(t) => { setChartItem(tickerToChart(t)); setSelectedPair(undefined) }}
                selectedSymbol={chartItem.symbol}
                panelNum={2}
              />
              <ChartPanel
                symbol={chartItem.symbol}
                price={chartItem.price}
                changePct={chartItem.changePct}
                panelNum={3}
              />
            </div>
          )
        })()}

        {/* ═══ FOCUS-AI ════════════════════════════════════════════════════════ */}
        {layout === 'focus-ai' && (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%', gap: 1, background: '#111' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <WatchlistPanel title="EQUITY" tickers={equities.slice(0, 5)} flashMap={eqFlash}
                showVol={false} onSelect={handleAISelect} selectedSymbol={chartItem.symbol} />
              <WatchlistPanel title="INDEXEK" tickers={indices.slice(0, 5)} flashMap={idxFlash}
                showVol={false} priceDecimals={0} onSelect={handleAISelect} selectedSymbol={chartItem.symbol} />
              <FXPanel rates={fxRates.slice(0, 5)} onSelect={(r) => { setChartItem(fxToChart(r)); setSelectedPair(r.pair) }} selectedPair={selectedPair} />
            </div>
            <AIAnalysisPanel symbol={chartItem.symbol} price={chartItem.price} changePct={chartItem.changePct} panelNum={4} />
          </div>
        )}

      </div>

      {/* Bottom bar */}
      <BottomBar
        activeCategory={bottomCat}
        onCategory={handleCategory}
        panelCount={4}
        activePanel={layout === 'default' ? 1 : layout === 'focus-chart' ? 2 : layout === 'focus-fx' ? 3 : layout === 'focus-bux' ? 2 : 4}
      />
    </div>
  )
}
