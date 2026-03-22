import { NextResponse } from 'next/server'

// Frankfurter.app – European Central Bank data, no API key needed
// Returns EUR-based rates, we compute all cross pairs from those

export interface FXRecord {
  pair: string
  rate: number
  change: number
  changePct: number
}

async function fetchEurRates(): Promise<Record<string, number>> {
  const url = 'https://api.frankfurter.app/latest?from=EUR&to=HUF,USD,GBP,JPY,CHF,CAD,AUD'
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Frankfurter API error')
  const data = await res.json()
  return data.rates as Record<string, number>
}

// Compute cross rates from EUR base
function computePairs(r: Record<string, number>): Record<string, number> {
  return {
    'EUR/USD': r.USD,
    'EUR/HUF': r.HUF,
    'EUR/GBP': r.GBP,
    'EUR/JPY': r.JPY,
    'EUR/CHF': r.CHF,
    'GBP/USD': r.USD / r.GBP,
    'USD/JPY': r.JPY / r.USD,
    'USD/CHF': r.CHF / r.USD,
    'AUD/USD': r.USD / r.AUD,
    'USD/CAD': r.CAD / r.USD,
    'USD/HUF': r.HUF / r.USD,
    'GBP/JPY': r.JPY / r.GBP,
  }
}

// Simple in-memory cache for previous rates (to compute change)
let prevRates: Record<string, number> | null = null
let lastFetch = 0

export async function GET() {
  try {
    const eurRates = await fetchEurRates()
    const pairs = computePairs(eurRates)

    const now = Date.now()
    const records: FXRecord[] = Object.entries(pairs).map(([pair, rate]) => {
      const prev = prevRates?.[pair]
      const change = prev ? rate - prev : 0
      const changePct = prev ? (change / prev) * 100 : 0
      return { pair, rate, change, changePct }
    })

    // Update cache every 5 minutes
    if (!prevRates || now - lastFetch > 5 * 60 * 1000) {
      prevRates = pairs
      lastFetch = now
    }

    return NextResponse.json(records)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
