// ── Yahoo Finance symbol mapping ──────────────────────────────────────────────
// Maps our display symbols → Yahoo Finance query symbols

export const DISPLAY_TO_YF: Record<string, string> = {
  // Indices
  'GSPC':  '^GSPC',
  'IXIC':  '^IXIC',
  'DJI':   '^DJI',
  'VIX':   '^VIX',
  'FTSE':  '^FTSE',
  'GDAXI': '^GDAXI',
  'FCHI':  '^FCHI',
  'N225':  '^N225',
  'HSI':   '^HSI',
  'BUX':   '^BUX',

  // BÉT – Budapest Értéktőzsde
  'OTP':        'OTP.BD',
  'MOL':        'MOL.BD',
  'RICHTER':    'RICHTER.BD',
  'MTELEKOM':   'MTELEKOM.BD',
  '4iG':        '4IG.BD',
  'OPUS':       'OPUS.BD',
  'AUTOWALLIS': 'AUTOWALLIS.BD',
  'ORMESTER':   'ORMESTER.BD',

  // US Equities
  'AAPL':  'AAPL',
  'MSFT':  'MSFT',
  'NVDA':  'NVDA',
  'TSLA':  'TSLA',
  'AMZN':  'AMZN',
  'META':  'META',
  'GOOGL': 'GOOGL',
  'BRK.B': 'BRK-B',
  'JPM':   'JPM',
  'V':     'V',

  // FX pairs
  'EUR/USD': 'EURUSD=X',
  'GBP/USD': 'GBPUSD=X',
  'USD/JPY': 'USDJPY=X',
  'USD/CHF': 'USDCHF=X',
  'AUD/USD': 'AUDUSD=X',
  'USD/CAD': 'USDCAD=X',
  'EUR/HUF': 'EURHUF=X',
  'USD/HUF': 'USDHUF=X',
  'EUR/GBP': 'EURGBP=X',
  'EUR/JPY': 'EURJPY=X',
  'GBP/JPY': 'GBPJPY=X',
  'EUR/CHF': 'EURCHF=X',

  // Crypto
  'BTC': 'BTC-USD',
  'ETH': 'ETH-USD',
  'SOL': 'SOL-USD',
  'BNB': 'BNB-USD',
  'XRP': 'XRP-USD',

  // Commodities
  'GC=F': 'GC=F',
  'CL1':  'CL=F',
  'BRN':  'BZ=F',
  'SI1':  'SI=F',
  'NG1':  'NG=F',
  'HG1':  'HG=F',
}

// Reverse map
export const YF_TO_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.entries(DISPLAY_TO_YF).map(([d, y]) => [y, d])
)

export function toYF(display: string): string {
  return DISPLAY_TO_YF[display] ?? display
}

export function toDisplay(yf: string): string {
  return YF_TO_DISPLAY[yf] ?? yf
}

// All symbols to pre-fetch on startup
export const ALL_QUOTE_SYMBOLS = [
  // Indices
  '^GSPC', '^IXIC', '^DJI', '^VIX', '^FTSE', '^GDAXI', '^FCHI', '^N225', '^HSI', '^BUX',
  // Equities
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'BRK-B', 'JPM', 'V',
  // BÉT equities
  'OTP.BD', 'MOL.BD', 'RICHTER.BD', 'MTELEKOM.BD', '4IG.BD', 'OPUS.BD',
  // FX
  'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCHF=X', 'AUDUSD=X', 'USDCAD=X',
  'EURHUF=X', 'USDHUF=X', 'EURGBP=X', 'EURJPY=X', 'GBPJPY=X', 'EURCHF=X',
  // Crypto
  'BTC-USD', 'ETH-USD', 'SOL-USD',
  // Commodities
  'GC=F', 'CL=F', 'SI=F',
]

// Chart range → Yahoo Finance params
export const RANGE_PARAMS: Record<string, { interval: string; range: string }> = {
  '1D': { interval: '5m',  range: '1d'  },
  '5D': { interval: '15m', range: '5d'  },
  '1M': { interval: '1d',  range: '1mo' },
  '3M': { interval: '1d',  range: '3mo' },
  '6M': { interval: '1d',  range: '6mo' },
  '1Y': { interval: '1wk', range: '1y'  },
  '5Y': { interval: '1mo', range: '5y'  },
}
