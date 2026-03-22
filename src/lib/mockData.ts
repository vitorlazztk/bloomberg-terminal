import { TickerData, NewsItem, FXRate, OHLCBar } from './types'

// ── US Equities ──────────────────────────────────────────────────────────────
export const EQUITY_TICKERS: TickerData[] = [
  { symbol: 'AAPL',  name: 'Apple Inc',         price: 189.50,  prevPrice: 187.20,  change:  2.30,   changePct:  1.23,  volume: 45200000, marketCap: 2.93e12, pe: 28.4, type: 'equity' },
  { symbol: 'MSFT',  name: 'Microsoft Corp',     price: 415.20,  prevPrice: 416.30,  change: -1.10,   changePct: -0.26,  volume: 22100000, marketCap: 3.08e12, pe: 35.1, type: 'equity' },
  { symbol: 'NVDA',  name: 'NVIDIA Corp',        price: 875.40,  prevPrice: 858.90,  change: 16.50,   changePct:  1.92,  volume: 38600000, marketCap: 2.15e12, pe: 65.2, type: 'equity' },
  { symbol: 'TSLA',  name: 'Tesla Inc',          price: 178.90,  prevPrice: 170.40,  change:  8.50,   changePct:  4.99,  volume: 98700000, marketCap: 571e9,   pe: 72.3, type: 'equity' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc',     price: 198.70,  prevPrice: 200.10,  change: -1.40,   changePct: -0.70,  volume: 31400000, marketCap: 2.08e12, pe: 44.8, type: 'equity' },
  { symbol: 'META',  name: 'Meta Platforms',     price: 512.30,  prevPrice: 508.90,  change:  3.40,   changePct:  0.67,  volume: 18200000, marketCap: 1.31e12, pe: 27.9, type: 'equity' },
  { symbol: 'GOOGL', name: 'Alphabet Inc',       price: 175.80,  prevPrice: 174.20,  change:  1.60,   changePct:  0.92,  volume: 25600000, marketCap: 2.19e12, pe: 23.1, type: 'equity' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 438.10,  prevPrice: 440.50,  change: -2.40,   changePct: -0.54,  volume:  4200000, marketCap: 961e9,   pe:  8.9, type: 'equity' },
  { symbol: 'JPM',   name: 'JPMorgan Chase',     price: 286.56,  prevPrice: 283.23,  change:  3.33,   changePct:  1.18,  volume: 12100000, marketCap: 643e9,   pe: 12.4, type: 'equity' },
  { symbol: 'V',     name: 'Visa Inc',           price: 281.90,  prevPrice: 283.20,  change: -1.30,   changePct: -0.46,  volume:  7800000, marketCap: 577e9,   pe: 30.2, type: 'equity' },
]

// ── Világ részvényindexek (WEI) ──────────────────────────────────────────────
// Region separators are handled in the WEIPanel component
export const INDEX_TICKERS: TickerData[] = [
  // USA
  { symbol: 'GSPC',  name: 'S&P 500',        price:  6506,    prevPrice:  6631.71, change: -125.71,  changePct: -1.90, volume: 0, type: 'index' },
  { symbol: 'IXIC',  name: 'Nasdaq 100',     price: 21648,    prevPrice: 22105.75, change: -457.75,  changePct: -2.07, volume: 0, type: 'index' },
  { symbol: 'DJI',   name: 'Dow Jones',      price: 45577,    prevPrice: 46558.00, change: -981.00,  changePct: -2.11, volume: 0, type: 'index' },
  { symbol: 'VIX',   name: 'CBOE VIX',       price:    26.78, prevPrice:    23.51, change:    3.27,  changePct: 13.91, volume: 0, type: 'index' },
  // EURÓPA
  { symbol: 'FTSE',  name: 'FTSE 100',       price:  9918,    prevPrice: 10260.87, change: -342.87,  changePct: -3.34, volume: 0, type: 'index' },
  { symbol: 'GDAXI', name: 'DAX',            price: 22380,    prevPrice: 23447.10, change: -1067.10, changePct: -4.55, volume: 0, type: 'index' },
  { symbol: 'FCHI',  name: 'CAC 40',         price:  7666,    prevPrice:  7936.35, change: -270.35,  changePct: -3.41, volume: 0, type: 'index' },
  // ÁZSIA
  { symbol: 'N225',  name: 'Nikkei 225',     price: 53373,    prevPrice: 53820.08, change: -447.08,  changePct: -0.83, volume: 0, type: 'index' },
  { symbol: 'HSI',   name: 'Hang Seng',      price: 25277,    prevPrice: 25465.28, change: -188.28,  changePct: -0.74, volume: 0, type: 'index' },
  // KELET-EURÓPA
  { symbol: 'BUX',   name: 'BUX Index',      price: 85420,    prevPrice: 84210.00, change:  1210.00, changePct:  1.44, volume: 0, type: 'index' },
]

export const WEI_REGIONS: Record<string, string[]> = {
  'USA':          ['GSPC', 'IXIC', 'DJI', 'VIX'],
  'EURÓPA':       ['FTSE', 'GDAXI', 'FCHI'],
  'ÁZSIA':        ['N225', 'HSI'],
  'KELET-EURÓPA': ['BUX'],
}

// ── BÉT – Budapest Értéktőzsde ────────────────────────────────────────────────
// Árak: Yahoo Finance v8 API alapján (2025. március)
export const BUX_TICKERS: TickerData[] = [
  { symbol: 'OTP',        name: 'OTP Bank',        price: 35950, prevPrice: 35950, change:    0, changePct:  0.00, volume: 2850000, marketCap: 4.2e12, pe:  9.4, type: 'equity' },
  { symbol: 'MOL',        name: 'MOL Magyar Olaj', price:  3916, prevPrice:  3916, change:    0, changePct:  0.00, volume:  980000, marketCap: 1.8e12, pe:  7.1, type: 'equity' },
  { symbol: 'RICHTER',    name: 'Richter Gedeon',  price: 11740, prevPrice: 11690, change:   50, changePct:  0.43, volume:  540000, marketCap: 1.7e12, pe: 15.8, type: 'equity' },
  { symbol: 'MTELEKOM',   name: 'Magyar Telekom',  price:  2010, prevPrice:  2010, change:    0, changePct:  0.00, volume:  720000, marketCap: 548e9,  pe: 11.2, type: 'equity' },
  { symbol: '4iG',        name: '4iG Nyrt',        price:  2940, prevPrice:  2940, change:    0, changePct:  0.00, volume:  310000, marketCap: 182e9,  pe: 18.6, type: 'equity' },
  { symbol: 'OPUS',       name: 'Opus Global',     price:   496, prevPrice:   496, change:    0, changePct:  0.00, volume:  195000, marketCap: 96e9,   pe: 22.1, type: 'equity' },
  { symbol: 'AUTOWALLIS', name: 'AutoWallis',      price:   153, prevPrice:   157, change:   -4, changePct: -2.55, volume:  145000, marketCap: 48e9,   pe: 12.4, type: 'equity' },
  { symbol: 'ORMESTER',   name: 'Ormester',        price:   410, prevPrice:   410, change:    0, changePct:  0.00, volume:   48000, marketCap: 18e9,   pe:  8.9, type: 'equity' },
]

// ── Devizaárfolyamok (FXC) ───────────────────────────────────────────────────
export const FX_RATES: FXRate[] = [
  { pair: 'EUR/USD', base: 'EUR', quote: 'USD', rate: 1.1575,  change:  0.0140, changePct:  1.22 },
  { pair: 'GBP/USD', base: 'GBP', quote: 'USD', rate: 1.3341,  change:  0.0093, changePct:  0.70 },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', rate: 159.22,  change: -0.35,   changePct: -0.22 },
  { pair: 'USD/CHF', base: 'USD', quote: 'CHF', rate: 0.78700, change: -0.0021, changePct: -0.27 },
  { pair: 'AUD/USD', base: 'AUD', quote: 'USD', rate: 0.70240, change:  0.0018, changePct:  0.26 },
  { pair: 'USD/CAD', base: 'USD', quote: 'CAD', rate: 1.3723,  change:  0.0011, changePct:  0.08 },
  { pair: 'EUR/HUF', base: 'EUR', quote: 'HUF', rate: 393.08,  change:  1.99,   changePct:  0.51 },
  { pair: 'USD/HUF', base: 'USD', quote: 'HUF', rate: 339.60,  change: -2.55,   changePct: -0.74 },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', rate: 0.86720, change:  0.0041, changePct:  0.48 },
  { pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', rate: 184.25,  change:  1.79,   changePct:  0.98 },
  { pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', rate: 212.44,  change:  1.07,   changePct:  0.51 },
  { pair: 'EUR/CHF', base: 'EUR', quote: 'CHF', rate: 0.91140, change:  0.0082, changePct:  0.91 },
]

// ── Crypto ───────────────────────────────────────────────────────────────────
export const CRYPTO_TICKERS: TickerData[] = [
  { symbol: 'BTC', name: 'Bitcoin',  price: 68450,  prevPrice: 67250,  change:  1200,    changePct:  1.78, volume: 28e9,  marketCap: 1.34e12, type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', price:  3521,  prevPrice:  3480,  change:    41,    changePct:  1.18, volume: 14e9,  marketCap: 423e9,   type: 'crypto' },
  { symbol: 'SOL', name: 'Solana',   price:   182.40, prevPrice: 185.10, change: -2.70, changePct: -1.46, volume:  3.2e9, marketCap: 84e9,   type: 'crypto' },
  { symbol: 'BNB', name: 'BNB',      price:   421.80, prevPrice: 418.90, change:  2.90, changePct:  0.69, volume:  1.8e9, marketCap: 62e9,   type: 'crypto' },
  { symbol: 'XRP', name: 'Ripple',   price:     0.5831, prevPrice: 0.5912, change: -0.0081, changePct: -1.37, volume: 2.1e9, marketCap: 32e9, type: 'crypto' },
]

// ── Nyersanyagok ──────────────────────────────────────────────────────────────
export const COMMODITY_TICKERS: TickerData[] = [
  { symbol: 'GC=F',  name: 'Arany (Gold)',       price: 4375,    prevPrice: 4386.0,  change: -11.0,  changePct: -0.25, volume: 0, type: 'commodity' },
  { symbol: 'CL1',   name: 'Kőolaj WTI',         price:   81.34, prevPrice:   80.92, change:  0.42,  changePct:  0.52, volume: 0, type: 'commodity' },
  { symbol: 'BRN',   name: 'Brent Crude',         price:   85.21, prevPrice:   84.70, change:  0.51,  changePct:  0.60, volume: 0, type: 'commodity' },
  { symbol: 'SI1',   name: 'Ezüst (Silver)',      price:   27.84, prevPrice:   27.51, change:  0.33,  changePct:  1.20, volume: 0, type: 'commodity' },
  { symbol: 'NG1',   name: 'Földgáz',             price:    1.842, prevPrice:   1.881, change: -0.039, changePct: -2.07, volume: 0, type: 'commodity' },
  { symbol: 'HG1',   name: 'Réz (Copper)',        price:    4.312, prevPrice:   4.290, change:  0.022, changePct:  0.51, volume: 0, type: 'commodity' },
]

// ── Hírek ────────────────────────────────────────────────────────────────────
export const MOCK_NEWS: NewsItem[] = [
  { id: '1', headline: 'Fed kamatot változatlanul hagyott, két vágást jelez 2025-re', source: 'Reuters', datetime: Date.now()/1000 - 300,  summary: 'A Federal Reserve márciusi ülésén változatlanul hagyta az alapkamatot és két lehetséges kamatvágást jelzett az év végére.', url: '#', category: 'economy' },
  { id: '2', headline: 'NVIDIA Q4 eredmények felülmúlják az előrejelzéseket, árfolyam +5%', source: 'Bloomberg', datetime: Date.now()/1000 - 900,  summary: 'Az NVIDIA rekord bevételeket jelentett az AI chip-ek iránti hatalmas keresletnek köszönhetően.', url: '#', category: 'earnings' },
  { id: '3', headline: 'EUR/HUF erősödés az EKB bejelentések hatására', source: 'Portfolio.hu', datetime: Date.now()/1000 - 1800, summary: 'A forint gyengül az euróval szemben az EKB lazább monetáris politikájának bejelentése után.', url: '#', category: 'forex' },
  { id: '4', headline: 'Olajárak emelkednek az OPEC+ termelésvágás meghosszabbítása után', source: 'WSJ', datetime: Date.now()/1000 - 2700, summary: 'A nyersolaj ára emelkedett miután az OPEC+ meghosszabbította az önkéntes termelésvágást 2025 Q2-re.', url: '#', category: 'commodities' },
  { id: '5', headline: 'Bitcoin új all-time high felett $69 000-nél az ETF beáramlások hatására', source: 'CoinDesk', datetime: Date.now()/1000 - 3600, summary: 'A Bitcoin új csúcsra emelkedett miközben az intézményi befektetők tömegesen lépnek be az ETF-eken keresztül.', url: '#', category: 'crypto' },
  { id: '6', headline: 'Tesla Q1 szállítások elmaradnak a várttól, részvény -3%', source: 'CNBC', datetime: Date.now()/1000 - 5400, summary: 'A Tesla az első negyedévben a vártnál kevesebb járművet szállított, ami kereslet aggodalmakat vet fel.', url: '#', category: 'earnings' },
  { id: '7', headline: 'Magyar inflációs adatok: KSH 4,3% februárban', source: 'MNB', datetime: Date.now()/1000 - 7200, summary: 'Magyarország fogyasztói árindexe 4,3%-ra csökkent februárban, közelítve az MNB 3%-os céljához.', url: '#', category: 'economy' },
  { id: '8', headline: 'OTP Bank rekord nyereséget jelentett 2024-re', source: 'Portfolio.hu', datetime: Date.now()/1000 - 9000, summary: 'Az OTP Bank rekord éves nyereséget ért el 2024-ben, köszönhetően a régió erős bankpiaci pozíciójának.', url: '#', category: 'earnings' },
]

// ── OHLC generátor ────────────────────────────────────────────────────────────
export function generateOHLC(basePrice: number, days = 90): OHLCBar[] {
  const bars: OHLCBar[] = []
  let price = basePrice * 0.85
  const now = Math.floor(Date.now() / 1000)
  const daySeconds = 86400

  for (let i = days; i >= 0; i--) {
    const t = now - i * daySeconds
    const volatility = price * 0.02
    const open = price + (Math.random() - 0.5) * volatility
    const close = open + (Math.random() - 0.5) * volatility * 1.5
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low  = Math.min(open, close) - Math.random() * volatility * 0.5
    bars.push({ time: t, open, high, low, close, volume: Math.floor(Math.random() * 50e6 + 5e6) })
    price = close
  }
  return bars
}

// ── Ticker bar items (scrolling top bar) ──────────────────────────────────────
export const TICKER_BAR_ITEMS = [
  { symbol: 'JPM',    price: 286.56, changePct:  1.18 },
  { symbol: 'GSPC',   price:  6506,  changePct: -1.90 },
  { symbol: 'IXIC',   price: 21648,  changePct: -2.07 },
  { symbol: 'DJI',    price: 45577,  changePct: -2.11 },
  { symbol: 'VIX',    price:  26.78, changePct: 13.91 },
  { symbol: 'FTSE',   price:  9918,  changePct: -3.34 },
  { symbol: 'GDAXI',  price: 22380,  changePct: -4.55 },
  { symbol: 'FCHI',   price:  7666,  changePct: -3.41 },
  { symbol: 'N225',   price: 53373,  changePct: -0.83 },
  { symbol: 'HSI',    price: 25277,  changePct: -0.74 },
  { symbol: 'EURHUF', price: 393.88, changePct:  0.51 },
  { symbol: 'USDHUF', price: 339.60, changePct: -0.74 },
  { symbol: 'GC=F',   price:  4375,  changePct: -0.25 },
  { symbol: 'BTC',    price: 68450,  changePct:  1.78 },
  { symbol: 'AAPL',   price: 189.50, changePct:  1.23 },
  { symbol: 'NVDA',   price: 875.40, changePct:  1.92 },
]
