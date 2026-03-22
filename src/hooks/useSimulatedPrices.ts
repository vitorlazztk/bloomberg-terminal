'use client'
import { useState, useEffect, useCallback } from 'react'
import { TickerData } from '@/lib/types'

// Simulates real-time price ticks with random walk
export function useSimulatedPrices(initialTickers: TickerData[], intervalMs = 1200) {
  const [tickers, setTickers] = useState<TickerData[]>(initialTickers)
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down' | ''>>({})

  const tick = useCallback(() => {
    setTickers(prev => {
      const next = prev.map(t => {
        // Random walk: ~60% chance of small move each tick
        if (Math.random() > 0.4) return t
        const volatility = t.price * 0.0008
        const delta = (Math.random() - 0.49) * volatility
        const newPrice = Math.max(t.price + delta, 0.01)
        const newChange = newPrice - t.prevPrice
        const newChangePct = (newChange / t.prevPrice) * 100
        return { ...t, price: newPrice, change: newChange, changePct: newChangePct }
      })

      // Compute which tickers moved
      const flashes: Record<string, 'up' | 'down' | ''> = {}
      next.forEach((t, i) => {
        if (t.price !== prev[i].price) {
          flashes[t.symbol] = t.price > prev[i].price ? 'up' : 'down'
        }
      })

      if (Object.keys(flashes).length > 0) {
        setFlashMap(flashes)
        setTimeout(() => setFlashMap({}), 700)
      }

      return next
    })
  }, [])

  useEffect(() => {
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [tick, intervalMs])

  return { tickers, flashMap }
}

export function useClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return { time, date }
}
