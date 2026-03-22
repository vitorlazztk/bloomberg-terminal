import { NextResponse } from 'next/server'

// Automatically picks the best available Claude model for this API key
let cachedModel: string | null = null

async function getModel(): Promise<string> {
  if (cachedModel) return cachedModel

  // Allow manual override via env
  if (process.env.ANTHROPIC_MODEL) {
    cachedModel = process.env.ANTHROPIC_MODEL
    return cachedModel
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const json = await res.json()
      const ids: string[] = (json.data ?? []).map((m: { id: string }) => m.id)
      // Prefer: haiku (cheapest/fastest) → sonnet → anything
      const pick =
        ids.find(id => id.toLowerCase().includes('haiku'))   ??
        ids.find(id => id.toLowerCase().includes('sonnet'))  ??
        ids[0]
      if (pick) { cachedModel = pick; return pick }
    }
  } catch { /* fall through */ }

  // Last-resort fallback
  cachedModel = 'claude-3-haiku-20240307'
  return cachedModel
}

export interface AIAnalysis {
  rating: string
  confidence: number
  analysts: { bull: number; hold: number; sell: number }
  targetPrice: number
  shortTarget: number
  midTarget: number
  longTarget: number
  shortView: string
  midView: string
  longView: string
  entryMin: number
  entryMax: number
  stopLoss: number
  catalysts: string[]
  risks: string[]
  summary: string
  sentiment: { overall: number; reddit: number; twitter: number; forum: number }
  news: Array<{ time: string; source: string; text: string; up: boolean | null; url?: string }>
  tavilyAnswer: string
  generatedAt: string
}

interface TavilyResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
}

interface TavilyResponse {
  answer?: string
  results: TavilyResult[]
}

async function searchTavily(query: string): Promise<TavilyResponse> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      include_answer: true,
      max_results: 8,
    }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`Tavily hiba: ${res.status}`)
  return res.json()
}

async function synthesizeWithClaude(
  symbol: string,
  price: number,
  changePct: number,
  tavily: TavilyResponse
): Promise<AIAnalysis> {

  const newsSnippets = tavily.results
    .slice(0, 6)
    .map((r, i) =>
      `[${i + 1}] ${r.title}\n${(r.content ?? '').slice(0, 400)}\nForrás: ${r.url}${r.published_date ? ' (' + r.published_date + ')' : ''}`
    )
    .join('\n\n---\n\n')

  const prompt = `Te egy professzionális pénzügyi elemző vagy. Elemezd az alábbi értékpapírt a webes keresési eredmények alapján, és adj visszA KIZÁRÓLAG érvényes JSON-t.

Szimbólum: ${symbol}
Jelenlegi ár: ${price}
Napi változás: ${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%

=== TAVILY AI ÖSSZEFOGLALÓ ===
${tavily.answer ?? 'Nem elérhető'}

=== KERESÉSI EREDMÉNYEK ===
${newsSnippets}

Válaszolj KIZÁRÓLAG az alábbi JSON struktúrával, semmilyen más szöveget NE írj!

{
  "rating": "<ERŐS VÉTEL | VÉTEL | TART | ELADÁS>",
  "confidence": <egész szám 40–90>,
  "analysts": { "bull": <szám>, "hold": <szám>, "sell": <szám> },
  "targetPrice": <12 hónapos reális célár, szám>,
  "shortTarget": <1-4 hetes célár, szám>,
  "midTarget": <1-3 hónapos célár, szám>,
  "longTarget": <6-12 hónapos célár, szám>,
  "shortView": "<EMELKEDŐ | SEMLEGES | CSÖKKENŐ>",
  "midView": "<EMELKEDŐ | SEMLEGES | CSÖKKENŐ>",
  "longView": "<EMELKEDŐ | SEMLEGES | CSÖKKENŐ>",
  "entryMin": <ajánlott belépési ár alsó határ, szám>,
  "entryMax": <ajánlott belépési ár felső határ, szám>,
  "stopLoss": <stop loss szint, szám>,
  "catalysts": ["katalizátor 1", "katalizátor 2", "katalizátor 3"],
  "risks": ["kockázat 1", "kockázat 2", "kockázat 3"],
  "summary": "<2-3 mondatos összefoglaló elemzés magyarul, a hírek alapján>",
  "sentiment": { "overall": <0–100>, "reddit": <0–100>, "twitter": <0–100>, "forum": <0–100> },
  "news": [
    { "time": "<HH:MM vagy 'Tegnap' vagy dátum>", "source": "<forrás domain neve>", "text": "<hír tömör összefoglalója magyarul, max 90 karakter>", "up": <true | false | null>, "url": "<eredeti url>" }
  ]
}

Szabályok:
- analysts összege legyen 18–24 között
- A célárakat realisztikusan, a jelenlegi ${price} árhoz képest határozd meg a hírek tónusa alapján
- news tömbben pontosan 4 elem legyen, a tényleges keresési eredményekből
- sentiment értékek 38–85 között legyenek
- Ha a hír pozitív: up=true, ha negatív: up=false, ha semleges: up=null
- Csak érvényes JSON-t adj vissza, magyarázat nélkül`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: await getModel(),
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const errText = await res.text()
    const usedModel = await getModel()
    throw new Error(`Claude API hiba: ${res.status} (modell: ${usedModel}) – ${errText.slice(0, 200)}`)
  }

  const json = await res.json()
  const rawText: string = json.content?.[0]?.text ?? ''

  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude nem adott vissza érvényes JSON-t')

  const analysis = JSON.parse(jsonMatch[0]) as Omit<AIAnalysis, 'tavilyAnswer' | 'generatedAt'>
  return {
    ...analysis,
    tavilyAnswer: tavily.answer ?? '',
    generatedAt: new Date().toISOString(),
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol    = searchParams.get('symbol')    ?? ''
  const price     = parseFloat(searchParams.get('price')     ?? '0')
  const changePct = parseFloat(searchParams.get('changePct') ?? '0')

  if (!symbol) {
    return NextResponse.json({ error: 'Hiányzó szimbólum' }, { status: 400 })
  }
  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json({ error: 'TAVILY_API_KEY nincs beállítva' }, { status: 500 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY nincs beállítva' }, { status: 500 })
  }

  try {
    // Keresési lekérdezés: angol + HUF részvényeknél magyar is
    const isHungarian = ['OTP', 'MOL', 'RICHTER', 'MTELEKOM', '4iG', 'OPUS'].includes(symbol)
    const query = isHungarian
      ? `${symbol} részvény árfolyam elemzés célár 2025`
      : `${symbol} stock analysis price target analyst rating news 2025`

    const tavily = await searchTavily(query)

    if (!tavily.results || tavily.results.length === 0) {
      return NextResponse.json({ error: 'Tavily nem adott vissza eredményt' }, { status: 502 })
    }

    const analysis = await synthesizeWithClaude(symbol, price, changePct, tavily)

    return NextResponse.json(analysis, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ismeretlen hiba'
    console.error('[ai-analysis]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
