import { NextResponse } from 'next/server'

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
}

export interface PriceRecord {
  symbol: string   // display symbol
  yf: string       // Yahoo Finance symbol
  price: number
  change: number
  changePct: number
  prevClose: number
  name?: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawSymbols = searchParams.get('symbols') ?? ''

  if (!rawSymbols) {
    return NextResponse.json([], { status: 200 })
  }

  const yfSymbols = rawSymbols.split(',').filter(Boolean)
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yfSymbols.join(',')}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,shortName,longName`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      headers: YF_HEADERS,
      signal: controller.signal,
      next: { revalidate: 30 },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo Finance error: ${res.status}` }, { status: 502 })
    }

    const json = await res.json()
    const results = json?.quoteResponse?.result ?? []

    const prices: PriceRecord[] = results.map((q: Record<string, unknown>) => ({
      symbol: q.symbol as string,
      yf: q.symbol as string,
      price: (q.regularMarketPrice as number) ?? 0,
      change: (q.regularMarketChange as number) ?? 0,
      changePct: (q.regularMarketChangePercent as number) ?? 0,
      prevClose: (q.regularMarketPreviousClose as number) ?? 0,
      name: (q.shortName as string) ?? (q.longName as string) ?? '',
    }))

    return NextResponse.json(prices)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
