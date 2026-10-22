import type { JSX } from 'react'
import s from './C47-ProgressRing.module.css'

export function ProgressRing({
  value,
  total,
  size = 64,
}: {
  value: number
  total: number
  size?: number
}): JSX.Element {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = total === 0 ? 0 : Math.min(1, value / total)
  return (
    <div className={s.wrap} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--c-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className={s.label}>
        {value}/{total}
      </span>
    </div>
  )
}
