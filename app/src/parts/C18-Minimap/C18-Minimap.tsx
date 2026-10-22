import type { JSX } from 'react'
import s from './C18-Minimap.module.css'

export type MiniRect = { x: number; y: number; w: number; h: number }

export function Minimap({
  bounds,
  view,
  sections,
  objects,
  onJump,
}: {
  bounds: MiniRect
  view: MiniRect
  sections: MiniRect[]
  objects: MiniRect[]
  onJump?: (p: { x: number; y: number }) => void
}): JSX.Element {
  const W = 160
  const H = 110
  const pad = 6
  const scale = Math.min((W - pad * 2) / bounds.w, (H - pad * 2) / bounds.h)
  const tx = (x: number) => pad + (x - bounds.x) * scale
  const ty = (y: number) => pad + (y - bounds.y) * scale

  return (
    <div
      className={s.wrap}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const x = bounds.x + (e.clientX - r.left - pad) / scale
        const y = bounds.y + (e.clientY - r.top - pad) / scale
        onJump?.({ x, y })
      }}
    >
      <svg width={W} height={H}>
        {sections.map((sec, i) => (
          <rect
            key={`s${i}`}
            x={tx(sec.x)}
            y={ty(sec.y)}
            width={Math.max(1, sec.w * scale)}
            height={Math.max(1, sec.h * scale)}
            rx={1.5}
            fill="var(--c-line)"
          />
        ))}
        {objects.map((o, i) => (
          <rect
            key={`o${i}`}
            x={tx(o.x)}
            y={ty(o.y)}
            width={Math.max(1, o.w * scale)}
            height={Math.max(1, o.h * scale)}
            rx={1}
            fill="var(--c-text-3)"
            opacity={0.55}
          />
        ))}
        <rect
          x={tx(view.x)}
          y={ty(view.y)}
          width={Math.max(2, view.w * scale)}
          height={Math.max(2, view.h * scale)}
          fill="none"
          stroke="var(--c-accent)"
          strokeWidth={1}
          rx={2}
        />
      </svg>
    </div>
  )
}
