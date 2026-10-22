import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C56-InboxList.module.css'

export type InboxItem = { id: string; title: string; source: string; kind: '网页' | 'PDF' | '图片' }

export function InboxList({
  items,
  selected,
  onToggle,
  onOrganize,
  onTag,
  onTodo,
}: {
  items: InboxItem[]
  selected: string[]
  onToggle: (id: string) => void
  onOrganize: (ids: string[]) => void
  onTag: (ids: string[]) => void
  onTodo: (ids: string[]) => void
}): JSX.Element {
  const ids = selected.length > 0 ? selected : items.map((i) => i.id)
  return (
    <div className={s.wrap}>
      <div className={s.actions}>
        <span className={s.count}>{selected.length > 0 ? `选中 ${selected.length}` : `${items.length} 条待整理`}</span>
        <button type="button" className={s.btn} onClick={() => onOrganize(ids)}>
          <Icon name="board" size={14} /> 整理到板
        </button>
        <button type="button" className={s.btn} onClick={() => onTag(ids)}>
          <Icon name="tag" size={14} /> 打标签
        </button>
        <button type="button" className={s.btn} onClick={() => onTodo(ids)}>
          <Icon name="todo" size={14} /> 转待办
        </button>
      </div>
      <ul className={s.list}>
        {items.map((it) => (
          <li key={it.id} className={s.item} data-selected={selected.includes(it.id)}>
            <button type="button" className={s.check} data-on={selected.includes(it.id)} onClick={() => onToggle(it.id)}>
              {selected.includes(it.id) ? '✓' : ''}
            </button>
            <span className={s.kind}>{it.kind}</span>
            <span className={s.title}>{it.title}</span>
            <span className={s.source}>{it.source}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
