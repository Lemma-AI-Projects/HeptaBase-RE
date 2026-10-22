import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C51-FilterBar.module.css'

export type FilterGroup = {
  id: string
  label: string
  options: { value: string; count: number }[]
}

export function FilterBar({
  groups,
  active,
  resultCount,
  onToggle,
  onClear,
}: {
  groups: FilterGroup[]
  active: Record<string, string[]>
  resultCount: number
  onToggle: (groupId: string, value: string) => void
  onClear: () => void
}): JSX.Element {
  const hasAny = Object.values(active).some((v) => v.length > 0)
  return (
    <div className={s.bar}>
      {groups.map((g) => (
        <div key={g.id} className={s.group}>
          <span className={s.groupLabel}>{g.label}</span>
          {g.options.map((o) => {
            const on = (active[g.id] ?? []).includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                className={on ? s.chipOn : s.chip}
                onClick={() => onToggle(g.id, o.value)}
              >
                {o.value}
                <span className={s.count}>{o.count}</span>
              </button>
            )
          })}
        </div>
      ))}
      <div className={s.tail}>
        {hasAny ? (
          <button type="button" className={s.clear} onClick={onClear}>
            <Icon name="close" size={12} />
            清空
          </button>
        ) : null}
        <span className={s.result}>{resultCount} 张</span>
      </div>
    </div>
  )
}
