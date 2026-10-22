import type { JSX } from 'react'
import type { Guide } from '@/lib/board-state'
import s from './C17-SnapGuide.module.css'

export function SnapGuides({ guides }: { guides: Guide[] }): JSX.Element {
  return (
    <svg className={s.layer} width={3200} height={2400} aria-hidden="true">
      {guides.map((g, i) =>
        g.axis === 'x' ? (
          <line key={i} className={s.line} x1={g.pos} y1={g.from} x2={g.pos} y2={g.to} />
        ) : (
          <line key={i} className={s.line} x1={g.from} y1={g.pos} x2={g.to} y2={g.pos} />
        )
      )}
    </svg>
  )
}
