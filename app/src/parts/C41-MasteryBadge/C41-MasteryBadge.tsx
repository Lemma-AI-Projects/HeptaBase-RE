import type { JSX } from 'react'
import s from './C41-MasteryBadge.module.css'

export type Mastery = 'none' | 'fuzzy' | 'solid'

/** 三档掌握度：极低干扰，只有三个 3px 的小段 */
export function MasteryBadge({ level }: { level: Mastery }): JSX.Element {
  const filled = level === 'solid' ? 3 : level === 'fuzzy' ? 2 : 0
  return (
    <span className={s.badge} data-level={level} aria-label={`掌握度 ${level}`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < filled ? s.on : s.off} />
      ))}
    </span>
  )
}
