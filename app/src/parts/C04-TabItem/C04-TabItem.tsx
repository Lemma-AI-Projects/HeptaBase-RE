import type { JSX } from 'react'
import type { IconName } from '@/icons'
import s from './C04-TabItem.module.css'

export type TabItemProps = {
  name: string
  icon?: IconName
  active?: boolean
  pinned?: boolean
  dirty?: boolean
  onActivate?: () => void
  onClose?: () => void
}

export function TabItem({
  name,
  active = false,
  pinned = false,
  dirty = false,
  onActivate,
  onClose,
}: TabItemProps): JSX.Element {
  return (
    <div
      className={`${s.tab} ${active ? s.active : ''}`}
      role="tab"
      aria-selected={active}
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onActivate?.()
      }}
    >
      {pinned ? <span className={s.pin} aria-label="已置顶" /> : null}
      <span className={s.name}>{name}</span>
      {dirty ? <span className={s.dirty} aria-label="未保存" /> : null}
      {!pinned && active ? (
        <button
          type="button"
          className={s.close}
          aria-label="关闭标签"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
        >
          ×
        </button>
      ) : null}
    </div>
  )
}
