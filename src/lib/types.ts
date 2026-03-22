export interface TickerData {
  symbol: string
  name: string
  price: number
  prevPrice: number
  change: number
  changePct: number
  volume: number
  marketCap?: number
  high52w?: number
  low52w?: number
  pe?: number
  type: 'equity' | 'fx' | 'crypto' | 'commodity' | 'index'
}

export interface NewsItem {
  id: string
  headline: string
  source: string
  datetime: number
  summary: string
  url: string
  category: string
}

export interface OHLCBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface FXRate {
  pair: string
  base: string
  quote: string
  rate: number
  change: number
  changePct: number
}
