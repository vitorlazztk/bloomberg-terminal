import { NextResponse } from 'next/server'

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
}

export interface PriceRecord {
  symbol: string   // Yahoo Finance symbol (visszatér a merge-hez)
  price: number
  change: number
  changePct: number
  prevClose: number
  name?: string
}

// BÉT szimbólumok – a v7 API Unauthorized-et dob rájuk, v8-cal kell lekérdezni
const BET_SYMBOLS = new Set([
  'OTP.BD', 'MOL.BD', 'RICHTER.BD', 'MTELEKOM.BD',
  '4IG.BD', 'OPUS.BD', 'AUTOWALLIS.BD', 'ORMESTER.BD',
])

// Egy BÉT szimbólum lekérdezése v8 chart API-val (utolsó 2 nap = zárás + előző zárás)
async function fetchBetPrice(symbol: string): Promise<PriceRecord | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`
    const res = await fetch(url, { headers: YF_HEADERS, next: { revalidate: 60 } })
    if (!res.ok) return null

    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return null

    const closes: number[] = (result.indicators?.quote?.[0]?.close ?? []).filter((c: number | null) => c != null)
    if (closes.length < 1) return null

    const price    = closes.at(-1)!
    const prevClose = closes.at(-2) ?? price
    const change    = price - prevClose
    const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0

    return { symbol, price, change, changePct, prevClose }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawSymbols = searchParams.get('symbols') ?? ''

  if (!rawSymbols) return NextResponse.json([], { status: 200 })

  const allSymbols  = rawSymbols.split(',').filter(Boolean)
  const betSymbols  = allSymbols.filter(s => BET_SYMBOLS.has(s))
  const restSymbols = allSymbols.filter(s => !BET_SYMBOLS.has(s))

  const results: PriceRecord[] = []

  // ── 1. Globális szimbólumok – Yahoo Finance v7 ─────────────────────────────
  if (restSymbols.length > 0) {
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${restSymbols.join(',')}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,shortName`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(url, { headers: YF_HEADERS, signal: controller.signal, next: { revalidate: 30 } })
      clearTimeout(timeout)

      if (res.ok) {
        const json = await res.json()
        for (const q of json?.quoteResponse?.result ?? []) {
          results.push({
            symbol:    q.symbol,
            price:     q.regularMarketPrice     ?? 0,
            change:    q.regularMarketChange    ?? 0,
            changePct: q.regularMarketChangePercent ?? 0,
            prevClose: q.regularMarketPreviousClose ?? 0,
            name:      q.shortName ?? '',
          })
        }
      }
    } catch { /* folytatjuk a BÉT-tel */ }
  }

  // ── 2. BÉT szimbólumok – Yahoo Finance v8 chart API ────────────────────────
  if (betSymbols.length > 0) {
    const betResults = await Promise.all(betSymbols.map(fetchBetPrice))
    for (const r of betResults) {
      if (r) results.push(r)
    }
  }

  return NextResponse.json(results)
}
