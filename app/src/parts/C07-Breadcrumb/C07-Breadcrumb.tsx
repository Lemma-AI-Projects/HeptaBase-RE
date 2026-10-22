import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C07-Breadcrumb.module.css'

export type Crumb = {
  label: string
  onClick?: () => void
  /** 当前所在层：不可点、字色最深 */
  current?: boolean
}

export function Breadcrumb({ items }: { items: Crumb[] }): JSX.Element {
  return (
    <nav className={s.bar} aria-label="位置">
      {items.map((c, i) => {
        const last = i === items.length - 1
        return (
          <span key={`${c.label}-${i}`} className={s.part}>
            {i > 0 ? <Icon name="chevronRight" size={12} className={s.sep} /> : null}
            {c.current || !c.onClick ? (
              <span className={`${s.text} ${c.current ? s.current : ''}`} aria-current={last ? 'page' : undefined}>
                {c.label}
              </span>
            ) : (
              <button type="button" className={s.text} onClick={c.onClick}>
                {c.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
