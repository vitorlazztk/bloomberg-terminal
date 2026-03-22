'use client'

export type BottomCategory = 'RÉSZVÉNY' | 'NYERSANYAG' | 'INDEX' | 'DEVIZA' | 'BUX' | 'STOCK'

interface Props {
  activeCategory: BottomCategory
  onCategory: (c: BottomCategory) => void
  panelCount?: number
  activePanel?: number
}

const CATEGORIES: BottomCategory[] = ['RÉSZVÉNY', 'NYERSANYAG', 'INDEX', 'DEVIZA', 'BUX', 'STOCK']

export function BottomBar({ activeCategory, onCategory, panelCount = 4, activePanel = 1 }: Props) {
  return (
    <div style={{
      background: '#060606',
      borderTop: '1px solid #1a1a1a',
      height: 24,
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      gap: 0,
      flexShrink: 0,
    }}>
      {/* Panel indicator */}
      <div style={{
        color: '#FFA500', fontSize: 10, fontWeight: 'bold',
        letterSpacing: '0.05em', padding: '0 12px 0 0',
        borderRight: '1px solid #1a1a1a', marginRight: 8,
        flexShrink: 0,
      }}>
        PANEL: {activePanel}/{panelCount}
      </div>

      {/* Category buttons */}
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          className={`cat-btn${activeCategory === cat ? ' active' : ''}`}
          onClick={() => onCategory(cat)}
        >
          {cat}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Right status */}
      <div style={{ color: '#1e1e1e', fontSize: 9 }}>
        Bloomberg Terminal Clone © 2025 &nbsp;|&nbsp; Next.js + TypeScript
      </div>
    </div>
  )
}
