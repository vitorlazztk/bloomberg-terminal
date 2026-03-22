'use client'
import { useState, useEffect, useCallback } from 'react'
import { TickerData, FXRate } from '@/lib/types'
import { DISPLAY_TO_YF, YF_TO_DISPLAY, ALL_QUOTE_SYMBOLS } from '@/lib/symbols'

export type DataSource = 'live' | 'sim'

interface LivePrice {
  price: number
  change: number
  changePct: number
  prevClose: number
}

/**
 * Fetches real prices from Yahoo Finance via /api/prices
 * Returns a map: displaySymbol → LivePrice
 * Falls back to simulation on error
 */
export function useLivePrices(intervalMs = 60_000) {
  const [priceMap, setPriceMap] = useState<Record<string, LivePrice>>({})
  const [source, setSource] = useState<DataSource>('sim')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

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
        // Map Yahoo Finance symbol back to display symbol
        const display = YF_TO_DISPLAY[item.symbol] ?? item.symbol
        map[display] = {
          price:      item.price,
          change:     item.change,
          changePct:  item.changePct,
          prevClose:  item.prevClose,
        }
      })

      setPriceMap(map)
      setSource('live')
      setLastUpdate(new Date())
    } catch {
      // Keep previous data, mark as sim if never had live data
      setSource(prev => prev === 'live' ? 'live' : 'sim')
    }
  }, [])

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, intervalMs)
    return () => clearInterval(id)
  }, [fetchPrices, intervalMs])

  return { priceMap, source, lastUpdate }
}

/**
 * Merges live prices into simulated ticker array.
 * Simulation provides smooth real-time feel; live prices correct the baseline.
 */
export function mergePrices(simTickers: TickerData[], priceMap: Record<string, LivePrice>): TickerData[] {
  return simTickers.map(t => {
    const live = priceMap[t.symbol]
    if (!live || live.price === 0) return t
    return {
      ...t,
      price:      live.price,
      change:     live.change,
      changePct:  live.changePct,
      prevPrice:  live.prevClose,
    }
  })
}

/**
 * Fetches real FX rates from /api/fx (Frankfurter / ECB data)
 */
export function useLiveFX(fallbackRates: FXRate[], intervalMs = 60_000) {
  const [rates, setRates] = useState<FXRate[]>(fallbackRates)
  const [source, setSource] = useState<DataSource>('sim')

  const fetchFX = useCallback(async () => {
    try {
      const res = await fetch('/api/fx', { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: Array<{ pair: string; rate: number; change: number; changePct: number }> =
        await res.json()

      if (!Array.isArray(data) || data.length === 0) throw new Error('empty')

      // Merge with fallback (to keep all 12 pairs, even if Frankfurter doesn't have all)
      setRates(prev =>
        prev.map(existing => {
          const live = data.find(d => d.pair === existing.pair)
          if (!live || live.rate === 0) return existing
          return {
            ...existing,
            rate:       live.rate,
            change:     live.change,
            changePct:  live.changePct,
          }
        })
      )
      setSource('live')
    } catch {
      setSource(prev => prev)
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
