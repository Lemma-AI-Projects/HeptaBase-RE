import type { JSX, ReactNode } from 'react'
import { TabItem, type TabItemProps } from '../C04-TabItem/C04-TabItem'
import s from './C03-TabStrip.module.css'

export type TabData = TabItemProps & { id: string }

export function TabStrip({
  tabs,
  activeId,
  onTabSelected,
  onTabClosed,
  onTabAdded,
  actions,
}: {
  tabs: TabData[]
  activeId?: string
  onTabSelected?: (id: string) => void
  onTabClosed?: (id: string) => void
  onTabAdded?: () => void
  actions?: ReactNode
}): JSX.Element {
  return (
    <div className={s.strip} role="tablist">
      <div className={s.tabs}>
        {tabs.map((t) => (
          <TabItem
            key={t.id}
            name={t.name}
            pinned={t.pinned}
            dirty={t.dirty}
            active={t.id === activeId}
            onActivate={() => onTabSelected?.(t.id)}
            onClose={() => onTabClosed?.(t.id)}
          />
        ))}
        <button
          type="button"
          className={s.add}
          aria-label="新建标签页"
          title="新建卡片"
          onClick={() => onTabAdded?.()}
        >
          +
        </button>
      </div>
      <div className={s.actions}>{actions}</div>
    </div>
  )
}
