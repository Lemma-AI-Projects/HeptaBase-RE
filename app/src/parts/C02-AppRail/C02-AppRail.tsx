import type { JSX } from 'react'
import { Icon, type IconName } from '@/icons'
import { Divider } from '../C67-Divider/C67-Divider'
import s from './C02-AppRail.module.css'

export type AppItem = {
  id: string
  name: string
  icon: IconName
  tint: string
  count?: number
}

export type AppRailProps = {
  apps: AppItem[]
  activeId?: string
  tags?: string[]
  onAppSelected?: (id: string) => void
  onNewTopicClicked?: () => void
}

export function AppRail({
  apps,
  activeId,
  tags = [],
  onAppSelected,
  onNewTopicClicked,
}: AppRailProps): JSX.Element {
  return (
    <nav className={s.rail} aria-label="应用">
      <div className={s.top}>
        <button type="button" className={s.research} onClick={onNewTopicClicked}>
          <Icon name="sparkles" size={16} />
          <span>新建学习主题</span>
        </button>
        <button type="button" className={s.square} aria-label="新建">
          <Icon name="plus" size={18} />
        </button>
        <button type="button" className={s.square} aria-label="搜索">
          <Icon name="search" size={18} />
        </button>
      </div>

      <ul className={s.list}>
        {apps.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              className={`${s.item} ${app.id === activeId ? s.active : ''}`}
              onClick={() => onAppSelected?.(app.id)}
            >
              <span className={s.tile} style={{ background: app.tint }}>
                <Icon name={app.icon} size={14} />
              </span>
              <span className={s.name}>{app.name}</span>
              {typeof app.count === 'number' ? <span className={s.count}>{app.count}</span> : null}
            </button>
          </li>
        ))}
      </ul>

      <Divider inset />

      <div className={s.tags}>
        <div className={s.tagsHead}>
          <span>标签</span>
          <button type="button" className={s.tagAdd} aria-label="新建标签">
            <Icon name="plus" size={14} />
          </button>
        </div>
        <ul className={s.tagList}>
          {tags.map((t) => (
            <li key={t}>
              <button type="button" className={s.tag}>
                <span className={s.hash}>#</span>
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
