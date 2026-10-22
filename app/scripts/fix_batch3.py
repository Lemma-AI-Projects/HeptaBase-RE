import io

# ---------- 5) C02：标签置顶 / 分组 / 文件夹 ----------
p = 'src/parts/C02-AppRail/C02-AppRail.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace("""import type { JSX } from 'react'
import { Icon, type IconName } from '@/icons'""",
"""import { useState, type JSX } from 'react'
import { Icon, type IconName } from '@/icons'""")

t = t.replace("""export type AppRailProps = {
  apps: AppItem[]
  activeId?: string
  tags?: string[]""",
"""export type TagItem = {
  name: string
  count?: number
  /** 置顶：永远排在最上，最多 3 个 */
  pinned?: boolean
  /** 分组名；不填归入「标签」 */
  group?: string
  /** 文件夹名；有值时这个标签收在文件夹里 */
  folder?: string
}

export type AppRailProps = {
  apps: AppItem[]
  activeId?: string
  tags?: TagItem[]""")

old_tags = """      <div className={s.tags}>
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
      </div>"""

new_tags = """      <div className={s.tags}>
        <div className={s.tagsHead}>
          <span>标签</span>
          <button type="button" className={s.tagAdd} aria-label="新建标签">
            <Icon name="plus" size={14} />
          </button>
        </div>

        {pinned.length > 0 ? (
          <ul className={s.tagList}>
            {pinned.map((t) => (
              <li key={t.name}>
                <button type="button" className={`${s.tag} ${s.pinned}`}>
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
                  <button type="button" className={s.tag}>
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
                      <button type="button" className={`${s.tag} ${s.nested}`}>
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
      </div>"""

assert old_tags in t
t = t.replace(old_tags, new_tags)

# 在 return 前算分组
t = t.replace("""}: AppRailProps): JSX.Element {
  return (""",
"""}: AppRailProps): JSX.Element {
  const [opened, setOpened] = useState<Record<string, boolean>>({})

  const pinned = tags.filter((t) => t.pinned).slice(0, 3)
  const rest = tags.filter((t) => !t.pinned)
  const groups = Object.entries(
    rest
      .filter((t) => !t.folder)
      .reduce<Record<string, TagItem[]>>((acc, t) => {
        const k = t.group ?? '标签'
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

  return (""")
io.open(p, 'w', encoding='utf-8').write(t)

p = 'src/parts/C02-AppRail/C02-AppRail.module.css'
c = io.open(p, encoding='utf-8').read()
c += '''
.pin {
  width: 4px;
  height: 4px;
  border-radius: var(--r-full);
  background: var(--c-accent);
  margin-right: 6px;
}

.pinned {
  font-weight: 500;
}

.tagCount {
  margin-left: auto;
  font-size: var(--fs-11);
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: var(--sp-2);
}

.groupHead {
  padding: 2px var(--sp-2) 2px 6px;
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.folderHead {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  height: 24px;
  padding: 0 6px;
  border-radius: 5px;
  color: var(--c-text-2);
  font-size: var(--fs-12);
  text-align: left;
}

.folderHead:hover {
  background: var(--c-sunken);
}

.folderName {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folderCount {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.nested {
  padding-left: var(--sp-5);
}
'''
io.open(p, 'w', encoding='utf-8').write(c)

# nav.ts 换成带结构的标签
p = 'src/lib/nav.ts'
t = io.open(p, encoding='utf-8').read()
t = t.replace("""export const TAGS = ['间隔重复', '记忆', '待读', 'FSRS']""",
"""export const TAGS: TagItem[] = [
  { name: '间隔重复', pinned: true, count: 38 },
  { name: 'FSRS', pinned: true, count: 12 },
  { name: '待验证', pinned: true, count: 7 },
  { name: '记忆', count: 24 },
  { name: '提取练习', count: 19 },
  { name: '合意困难', count: 11 },
  { name: '读书笔记', folder: '学习科学', count: 46 },
  { name: '论文摘要', folder: '学习科学', count: 22 },
  { name: '实验记录', folder: '学习科学', count: 9 },
  { name: '法语', folder: '语言', count: 31 },
  { name: '日语', folder: '语言', count: 14 },
  { name: '写作素材', folder: '输出', count: 27 },
]""")
t = t.replace("import type { AppItem } from '@/parts/C02-AppRail'",
              "import type { AppItem, TagItem } from '@/parts/C02-AppRail'")
io.open(p, 'w', encoding='utf-8').write(t)
print('apprail ok')
