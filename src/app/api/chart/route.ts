import { NextResponse } from 'next/server'
import { RANGE_PARAMS } from '@/lib/symbols'

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
}

export interface ChartBar {
  time: number  // Unix seconds
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') ?? ''
  const period = searchParams.get('period') ?? '3M'

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })
  }

  const { interval, range } = RANGE_PARAMS[period] ?? RANGE_PARAMS['3M']
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%7Csplits`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      headers: YF_HEADERS,
      signal: controller.signal,
      next: { revalidate: 60 },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo Finance chart error: ${res.status}` }, { status: 502 })
    }

    const json = await res.json()
    const result = json?.chart?.result?.[0]

    if (!result) {
      return NextResponse.json({ error: 'No chart data' }, { status: 404 })
    }

    const timestamps: number[] = result.timestamp ?? []
    const quotes = result.indicators?.quote?.[0] ?? {}
    const opens:   number[] = quotes.open   ?? []
    const highs:   number[] = quotes.high   ?? []
    const lows:    number[] = quotes.low    ?? []
    const closes:  number[] = quotes.close  ?? []
    const volumes: number[] = quotes.volume ?? []

    const bars: ChartBar[] = timestamps
      .map((t, i) => ({
        time: t,
        open:   opens[i],
        high:   highs[i],
        low:    lows[i],
        close:  closes[i],
        volume: volumes[i],
      }))
      .filter(b => b.close != null && !isNaN(b.close))

    return NextResponse.json({ bars, currency: result.meta?.currency ?? '' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
