import type { JSX } from 'react'
import s from './C54-WeekStrip.module.css'

export type Day = { date: string; label: string; day: number; today?: boolean; hasNote?: boolean }

export function WeekStrip({
  days,
  active,
  onSelect,
}: {
  days: Day[]
  active: string
  onSelect: (date: string) => void
}): JSX.Element {
  return (
    <div className={s.strip}>
      {days.map((d) => (
        <button
          key={d.date}
          type="button"
          className={active === d.date ? s.dayOn : s.day}
          data-today={d.today}
          onClick={() => onSelect(d.date)}
        >
          <span className={s.label}>{d.label}</span>
          <span className={s.num}>{d.day}</span>
          <span className={s.dot} data-on={!!d.hasNote} />
        </button>
      ))}
    </div>
  )
}
