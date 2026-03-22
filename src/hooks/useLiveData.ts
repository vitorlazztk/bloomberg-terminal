'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { TickerData, FXRate } from '@/lib/types'
import { DISPLAY_TO_YF, YF_TO_DISPLAY, ALL_QUOTE_SYMBOLS } from '@/lib/symbols'

export type DataSource = 'live' | 'loading' | 'error'

interface LivePrice {
  price: number
  change: number
  changePct: number
  prevClose: number
}

/**
 * Fetches real prices from Yahoo Finance via /api/prices.
 * Returns a map: displaySymbol → LivePrice
 */
export function useLivePrices(intervalMs = 60_000) {
  const [priceMap, setPriceMap] = useState<Record<string, LivePrice>>({})
  const [source,   setSource]   = useState<DataSource>('loading')

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`/api/prices?symbols=${ALL_QUOTE_SYMBOLS.join(',')}`, {
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: Array<{ symbol: string; price: number; change: number; changePct: number; prevClose: number }> =
        await res.json()

      if (!Array.isArray(data) || data.length === 0) throw new Error('empty response')

      const map: Record<string, LivePrice> = {}
      data.forEach(item => {
        const display = YF_TO_DISPLAY[item.symbol] ?? item.symbol
        if (item.price > 0) {
          map[display] = {
            price:     item.price,
            change:    item.change,
            changePct: item.changePct,
            prevClose: item.prevClose,
          }
        }
      })

      setPriceMap(map)
      setSource('live')
    } catch {
      setSource(prev => prev === 'live' ? 'live' : 'error')
    }
  }, [])

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, intervalMs)
    return () => clearInterval(id)
  }, [fetchPrices, intervalMs])

  return { priceMap, source }
}

/**
 * Applies live prices to a base ticker array.
 * Tickers without live data get price=0 (displayed as "—" in UI).
 */
export function applyLivePrices(base: TickerData[], priceMap: Record<string, LivePrice>): TickerData[] {
  return base.map(t => {
    const live = priceMap[t.symbol]
    if (!live) return { ...t, price: 0, change: 0, changePct: 0, prevPrice: 0 }
    return {
      ...t,
      price:     live.price,
      change:    live.change,
      changePct: live.changePct,
      prevPrice: live.prevClose,
    }
  })
}

/**
 * Flash map: tracks which symbols changed price (for green/red flash animation).
 * Keyed by display symbol.
 */
export function useFlashMap(priceMap: Record<string, LivePrice>) {
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down' | ''>>({})
  const prevRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const flashes: Record<string, 'up' | 'down' | ''> = {}
    for (const [sym, live] of Object.entries(priceMap)) {
      const prev = prevRef.current[sym]
      if (prev !== undefined && live.price !== prev && live.price > 0) {
        flashes[sym] = live.price > prev ? 'up' : 'down'
      }
    }
    prevRef.current = Object.fromEntries(
      Object.entries(priceMap).map(([k, v]) => [k, v.price])
    )
    if (Object.keys(flashes).length > 0) {
      setFlashMap(flashes)
      setTimeout(() => setFlashMap({}), 700)
    }
  }, [priceMap])

  return flashMap
}

/**
 * Fetches real FX rates from /api/fx (Frankfurter / ECB data).
 * Starts empty – no mock fallback.
 */
export function useLiveFX(intervalMs = 60_000) {
  const [rates,  setRates]  = useState<FXRate[]>([])
  const [source, setSource] = useState<DataSource>('loading')

  const fetchFX = useCallback(async () => {
    try {
      const res = await fetch('/api/fx', { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: Array<{ pair: string; rate: number; change: number; changePct: number }> =
        await res.json()

      if (!Array.isArray(data) || data.length === 0) throw new Error('empty')

      setRates(
        data
          .filter(d => d.rate > 0)
          .map(d => ({
            pair:      d.pair,
            base:      d.pair.split('/')[0],
            quote:     d.pair.split('/')[1],
            rate:      d.rate,
            change:    d.change,
            changePct: d.changePct,
          }))
      )
      setSource('live')
    } catch {
      setSource(prev => prev === 'live' ? 'live' : 'error')
    }
  }, [])

  useEffect(() => {
    fetchFX()
    const id = setInterval(fetchFX, intervalMs)
    return () => clearInterval(id)
  }, [fetchFX, intervalMs])

  return { rates, source }
}

// Helper: convert display symbol to Yahoo Finance symbol for chart
export function toYFSymbol(display: string): string {
  return DISPLAY_TO_YF[display] ?? display
}
