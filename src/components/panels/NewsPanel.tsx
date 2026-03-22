'use client'
import { useState } from 'react'
import { NewsItem } from '@/lib/types'
import { formatDateTime } from '@/lib/formatters'

interface Props {
  news: NewsItem[]
}

const CATEGORY_COLORS: Record<string, string> = {
  economy:     '#FF8C00',
  earnings:    '#00BFFF',
  forex:       '#7FFF00',
  commodities: '#FFD700',
  crypto:      '#BF7FFF',
  tech:        '#00CED1',
  default:     '#888888',
}

export function NewsPanel({ news }: Props) {
  const [selected, setSelected] = useState<NewsItem | null>(null)

  return (
    <div className="bb-panel">
      <div className="bb-panel-header">
        <span>TOP NEWS &mdash; MARKET INTELLIGENCE</span>
        <span style={{ color: '#00FF41', fontSize: 9 }}>&#9679; LIVE</span>
      </div>
      <div className="bb-panel-body">
        {selected ? (
          <div style={{ padding: 10 }}>
            <div
              style={{ color: '#888', fontSize: 10, cursor: 'pointer', marginBottom: 8 }}
              onClick={() => setSelected(null)}
            >
              &#8592; BACK TO LIST
            </div>
            <div style={{
              display: 'inline-block',
              background: CATEGORY_COLORS[selected.category] ?? CATEGORY_COLORS.default,
              color: '#000',
              fontSize: 9,
              padding: '1px 5px',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {selected.category}
            </div>
            <div style={{ color: '#FFA500', fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
              {selected.headline}
            </div>
            <div style={{ color: '#888', fontSize: 10, marginBottom: 8 }}>
              {selected.source} &bull; {formatDateTime(selected.datetime)}
            </div>
            <div style={{ color: '#DEDEDE', fontSize: 11, lineHeight: 1.6 }}>
              {selected.summary}
            </div>
          </div>
        ) : (
          news.map((item, i) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              style={{
                padding: '6px 8px',
                borderBottom: '1px solid #111',
                cursor: 'pointer',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0f0f0f')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ color: '#333', fontSize: 10, minWidth: 18, paddingTop: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#DEDEDE', fontSize: 11, lineHeight: 1.4, marginBottom: 2 }}>
                  {item.headline}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    color: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.default,
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {item.category}
                  </span>
                  <span style={{ color: '#555', fontSize: 9 }}>{item.source}</span>
                  <span style={{ color: '#444', fontSize: 9, marginLeft: 'auto' }}>
                    {formatDateTime(item.datetime)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
