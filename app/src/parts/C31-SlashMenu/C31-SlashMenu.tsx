import type { JSX } from 'react'
import { Popover } from '../C63-Popover/C63-Popover'
import { Icon, type IconName } from '@/icons'
import { SLASH_ITEMS, type BlockType } from '@/lib/blocks'
import s from './C31-SlashMenu.module.css'

export function SlashMenu({
  anchor,
  open,
  query,
  onPick,
  onDismiss,
}: {
  anchor: { x: number; y: number; w: number; h: number } | null
  open: boolean
  query: string
  onPick: (type: BlockType) => void
  onDismiss: () => void
}): JSX.Element {
  const q = query.trim().toLowerCase()
  const items = SLASH_ITEMS.filter(
    (i) => !q || i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q) || i.type.includes(q)
  )

  return (
    <Popover anchor={anchor} open={open} width={220} onDismiss={onDismiss}>
      <div className={s.menu}>
        <div className={s.head}>
          <span>插入块</span>
          <span className={s.query}>{q ? `“${q}”` : '/'}</span>
        </div>
        {items.length === 0 ? <div className={s.empty}>没有匹配的块</div> : null}
        {items.map((item) => (
          <button key={item.type} type="button" className={s.item} onClick={() => onPick(item.type)}>
            <span className={s.icon}>
              <Icon name={item.icon as IconName} size={16} />
            </span>
            <span className={s.label}>{item.label}</span>
            <span className={s.hint}>{item.hint}</span>
          </button>
        ))}
      </div>
    </Popover>
  )
}
