import type { JSX } from 'react'
import { Popover } from '../C63-Popover/C63-Popover'
import { MENTION_GROUPS } from '@/lib/blocks'
import s from './C32-MentionMenu.module.css'

export function MentionMenu({
  anchor,
  open,
  query,
  onPick,
  onDismiss,
}: {
  anchor: { x: number; y: number; w: number; h: number } | null
  open: boolean
  query: string
  onPick: (label: string) => void
  onDismiss: () => void
}): JSX.Element {
  const q = query.trim().toLowerCase()
  return (
    <Popover anchor={anchor} open={open} width={260} onDismiss={onDismiss}>
      <div className={s.menu}>
        {MENTION_GROUPS.map((g) => {
          const items = g.items.filter((i) => !q || i.toLowerCase().includes(q))
          if (items.length === 0) return null
          return (
            <div key={g.group} className={s.group}>
              <div className={s.groupName}>{g.group}</div>
              {items.map((item) => (
                <button key={item} type="button" className={s.item} onClick={() => onPick(item)}>
                  {item}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </Popover>
  )
}
