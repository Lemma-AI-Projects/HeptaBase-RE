import type { JSX } from 'react'
import { Icon, type IconName } from '@/icons'
import s from './C33-BacklinksPanel.module.css'

export type Backlink = {
  id: string
  type: string
  name: string
  snippet: string
}

const iconOf = (type: string): IconName =>
  type === '白板' ? 'board' : type === 'PDF' ? 'pdf' : 'card'

export function BacklinksPanel({
  items,
  onOpened,
}: {
  items: Backlink[]
  onOpened?: (id: string) => void
}): JSX.Element {
  const groups = items.reduce<Record<string, Backlink[]>>((acc, it) => {
    acc[it.type] = acc[it.type] ?? []
    acc[it.type].push(it)
    return acc
  }, {})

  return (
    <div className={s.panel}>
      <div className={s.summary}>{items.length} 处引用</div>
      {Object.entries(groups).map(([type, list]) => (
        <section key={type} className={s.group}>
          <div className={s.groupName}>
            {type}
            <span className={s.count}>{list.length}</span>
          </div>
          {list.map((it) => (
            <button key={it.id} type="button" className={s.item} onClick={() => onOpened?.(it.id)}>
              <Icon name={iconOf(it.type)} size={14} />
              <span className={s.text}>
                <span className={s.name}>{it.name}</span>
                <span className={s.snippet}>{it.snippet}</span>
              </span>
            </button>
          ))}
        </section>
      ))}
    </div>
  )
}
