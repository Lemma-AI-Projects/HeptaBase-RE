import { useState, type JSX } from 'react'
import { Icon, type IconName } from '@/icons'
import { Divider } from '../C67-Divider/C67-Divider'
import { navigate } from '@/lib/hash-route'
import s from './C02-AppRail.module.css'

export type AppItem = {
  id: string
  name: string
  icon: IconName
  tint: string
  count?: number
}

export type TagItem = {
  name: string
  count?: number
  /** 置顶：永远排在最上，最多 3 个 */
  pinned?: boolean
  /** 分组名；不填归入「标签」 */
  group?: string
  /** 文件夹名；有值时这个标签收在文件夹里 */
  folder?: string
}

const APP_ROUTE: Record<string, string> = {
  inbox: '/s11',
  today: '/s01',
  board: '/s02',
  library: '/s08',
  tags: '/s09',
  highlight: '/s05',
  chat: '/s02?demo=ai',
}

export type AppRailProps = {
  apps: AppItem[]
  activeId?: string
  tags?: TagItem[]
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
  const [opened, setOpened] = useState<Record<string, boolean>>({})

  const pinned = tags.filter((t) => t.pinned).slice(0, 3)
  const rest = tags.filter((t) => !t.pinned)
  const groups = Object.entries(
    rest
      .filter((t) => !t.folder)
      .reduce<Record<string, TagItem[]>>((acc, t) => {
        const k = t.group ?? '我的标签'
        acc[k] = acc[k] ?? []
        acc[k].push(t)
        return acc
      }, {})
  )
  const folders = Object.entries(
    rest
      .filter((t) => t.folder)
      .reduce<Record<string, TagItem[]>>((acc, t) => {
        acc[t.folder!] = acc[t.folder!] ?? []
        acc[t.folder!].push(t)
        return acc
      }, {})
  )

  return (
    <nav className={s.rail} aria-label="应用">
      <div className={s.top}>
        <button
          type="button"
          className={s.research}
          onClick={() => (onNewTopicClicked ? onNewTopicClicked() : navigate('/s02?demo=newcard'))}
        >
          <Icon name="sparkles" size={16} />
          <span>新建学习主题</span>
        </button>
        <button
          type="button"
          className={s.square}
          aria-label="新建"
          title="新建卡片"
          onClick={() => (onNewTopicClicked ? onNewTopicClicked() : navigate('/s02?demo=newcard'))}
        >
          <Icon name="plus" size={18} />
        </button>
        <button
          type="button"
          className={s.square}
          aria-label="搜索"
          title="全局搜索 ⌘O"
          onClick={() => navigate('/s08?demo=search')}
        >
          <Icon name="search" size={18} />
        </button>
      </div>

      <ul className={s.list}>
        {apps.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              className={`${s.item} ${app.id === activeId ? s.active : ''}`}
              onClick={() =>
                onAppSelected ? onAppSelected(app.id) : navigate(APP_ROUTE[app.id] ?? '/s02')
              }
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
          <button
            type="button"
            className={s.tagAdd}
            aria-label="新建标签"
            onClick={() => navigate('/s09')}
          >
            <Icon name="plus" size={14} />
          </button>
        </div>

        {pinned.length > 0 ? (
          <ul className={s.tagList}>
            {pinned.map((t) => (
              <li key={t.name}>
                <button
                  type="button"
                  className={`${s.tag} ${s.pinned}`}
                  onClick={() => navigate(`/s08?tag=${encodeURIComponent(t.name)}`)}
                >
                  <span className={s.pin} aria-hidden="true" />
                  {t.name}
                  {typeof t.count === 'number' ? <span className={s.tagCount}>{t.count}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {groups.map(([group, list]) => (
          <section key={group} className={s.group}>
            <div className={s.groupHead}>{group}</div>
            <ul className={s.tagList}>
              {list.map((t) => (
                <li key={t.name}>
                  <button
                    type="button"
                    className={s.tag}
                    onClick={() => navigate(`/s08?tag=${encodeURIComponent(t.name)}`)}
                  >
                    <span className={s.hash}>#</span>
                    {t.name}
                    {typeof t.count === 'number' ? <span className={s.tagCount}>{t.count}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {folders.map(([name, list]) => {
          const open = opened[name] ?? false
          return (
            <section key={name} className={s.group}>
              <button
                type="button"
                className={s.folderHead}
                onClick={() => setOpened((v) => ({ ...v, [name]: !open }))}
                aria-expanded={open}
              >
                <Icon name={open ? 'chevronDown' : 'chevronRight'} size={12} />
                <span className={s.folderName}>{name}</span>
                <span className={s.folderCount}>{list.length}</span>
              </button>
              {open ? (
                <ul className={s.tagList}>
                  {list.map((t) => (
                    <li key={t.name}>
                      <button
                        type="button"
                        className={`${s.tag} ${s.nested}`}
                        onClick={() => navigate(`/s08?tag=${encodeURIComponent(t.name)}`)}
                      >
                        <span className={s.hash}>#</span>
                        {t.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          )
        })}
      </div>
    </nav>
  )
}
