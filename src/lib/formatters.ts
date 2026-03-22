export function formatPrice(val: number, decimals = 2): string {
  if (!isFinite(val)) return '—'
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatChange(val: number, decimals = 2): string {
  if (!isFinite(val)) return '—'
  const sign = val >= 0 ? '+' : ''
  return `${sign}${val.toFixed(decimals)}`
}

export function formatPct(val: number): string {
  if (!isFinite(val)) return '—'
  const sign = val >= 0 ? '+' : ''
  return `${sign}${val.toFixed(2)}%`
}

export function formatVolume(val: number): string {
  if (!isFinite(val) || val === 0) return '—'
  if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B'
  if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M'
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K'
  return val.toFixed(0)
}

export function formatMarketCap(val: number): string {
  if (!val || !isFinite(val)) return '—'
  if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T'
  if (val >= 1e9)  return (val / 1e9).toFixed(1)  + 'B'
  if (val >= 1e6)  return (val / 1e6).toFixed(1)  + 'M'
  return val.toFixed(0)
}

export function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function changeClass(val: number): string {
  if (val > 0) return 'text-up'
  if (val < 0) return 'text-down'
  return ''
}
