import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C37-HighlightToolbar.module.css'

export const HL_COLORS = [
  { id: 'yellow', label: '黄', token: 'var(--c-yellow-solid)' },
  { id: 'green', label: '绿', token: 'var(--c-green-solid)' },
  { id: 'blue', label: '蓝', token: 'var(--c-blue-solid)' },
  { id: 'red', label: '粉', token: 'var(--c-red-solid)' },
]

export function HighlightToolbar({
  rect,
  activeColor = 'yellow',
  onColor,
  onExcerpt,
  onNote,
  onAi,
  onDismiss,
}: {
  rect: { x: number; y: number; w: number; h: number }
  activeColor?: string
  onColor?: (id: string) => void
  onExcerpt?: () => void
  onNote?: () => void
  onAi?: () => void
  onDismiss?: () => void
}): JSX.Element {
  const width = 300
  const left = Math.min(Math.max(8, rect.x + rect.w / 2 - width / 2), window.innerWidth - width - 8)
  const above = rect.y > 56

  return (
    <div
      className={s.bar}
      style={{ left, top: above ? rect.y - 44 : rect.y + rect.h + 10, width }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className={s.colors}>
        {HL_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={s.dot}
            data-active={activeColor === c.id}
            style={{ background: c.token }}
            aria-label={`${c.label}色`}
            onClick={() => onColor?.(c.id)}
          />
        ))}
      </div>
      <span className={s.sep} />
      <button type="button" className={s.action} onClick={onExcerpt}>
        <Icon name="card" size={14} />
        摘录成卡
      </button>
      <button type="button" className={s.icon} onClick={onNote} aria-label="加注">
        <Icon name="text" size={14} />
      </button>
      <button type="button" className={s.icon} onClick={onAi} aria-label="AI 解释">
        <Icon name="sparkles" size={14} />
      </button>
      <button type="button" className={s.icon} onClick={onDismiss} aria-label="关闭">
        <Icon name="close" size={12} />
      </button>
    </div>
  )
}
