# -*- coding: utf-8 -*-
import io, os

def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, 'w', encoding='utf-8').write(content)

base = 'src/parts'

# ---------------- C51 FilterBar ----------------
w(base + '/C51-FilterBar/C51-FilterBar.tsx', '''import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C51-FilterBar.module.css'

export type FilterGroup = {
  id: string
  label: string
  options: { value: string; count: number }[]
}

export function FilterBar({
  groups,
  active,
  resultCount,
  onToggle,
  onClear,
}: {
  groups: FilterGroup[]
  active: Record<string, string[]>
  resultCount: number
  onToggle: (groupId: string, value: string) => void
  onClear: () => void
}): JSX.Element {
  const hasAny = Object.values(active).some((v) => v.length > 0)
  return (
    <div className={s.bar}>
      {groups.map((g) => (
        <div key={g.id} className={s.group}>
          <span className={s.groupLabel}>{g.label}</span>
          {g.options.map((o) => {
            const on = (active[g.id] ?? []).includes(o.value)
            return (
              <button
                key={o.value}
                type="button"
                className={on ? s.chipOn : s.chip}
                onClick={() => onToggle(g.id, o.value)}
              >
                {o.value}
                <span className={s.count}>{o.count}</span>
              </button>
            )
          })}
        </div>
      ))}
      <div className={s.tail}>
        {hasAny ? (
          <button type="button" className={s.clear} onClick={onClear}>
            <Icon name="close" size={12} />
            清空
          </button>
        ) : null}
        <span className={s.result}>{resultCount} 张</span>
      </div>
    </div>
  )
}
''')
w(base + '/C51-FilterBar/C51-FilterBar.module.css', '''.bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-2);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line);
}

.group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.groupLabel {
  width: 44px;
  font-size: var(--fs-11);
  color: var(--c-text-3);
  flex: none;
}

.chip,
.chipOn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--r-full);
  font-size: var(--fs-11);
  color: var(--c-text-2);
  background: var(--c-sunken);
}

.chip:hover {
  color: var(--c-text);
}

.chipOn {
  background: var(--c-accent-weak);
  color: var(--c-accent);
}

.count {
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
}

.tail {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-2);
}

.clear {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.clear:hover {
  color: var(--c-danger);
}

.result {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}
''')

# ---------------- C50 CardGrid ----------------
w(base + '/C50-CardGrid/C50-CardGrid.tsx', '''import type { JSX } from 'react'
import { MasteryBadge } from '../C41-MasteryBadge/C41-MasteryBadge'
import type { LibCard } from '@/lib/library'
import s from './C50-CardGrid.module.css'

export type ViewMode = 'grid' | 'list' | 'timeline'

function Check({ on }: { on: boolean }): JSX.Element {
  return <span className={s.check} data-on={on}>{on ? '✓' : ''}</span>
}

export function CardGrid({
  cards,
  view,
  selected,
  onToggle,
  onOpen,
}: {
  cards: LibCard[]
  view: ViewMode
  selected: string[]
  onToggle: (id: string) => void
  onOpen: (id: string) => void
}): JSX.Element {
  if (view === 'list') {
    return (
      <div className={s.list}>
        <div className={s.head}>
          <span />
          <span>标题</span>
          <span>标签</span>
          <span>状态</span>
          <span>来源</span>
          <span>更新</span>
        </div>
        {cards.map((c) => (
          <div
            key={c.id}
            className={s.row}
            data-selected={selected.includes(c.id)}
            onClick={() => onOpen(c.id)}
          >
            <button
              type="button"
              className={s.checkBtn}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(c.id)
              }}
            >
              <Check on={selected.includes(c.id)} />
            </button>
            <span className={s.rowTitle}>{c.title}</span>
            <span className={s.rowTags}>{c.tags.map((t) => '#' + t).join(' ')}</span>
            <span className={s.rowStatus}>{c.status}</span>
            <span className={s.rowSource}>{c.source}</span>
            <span className={s.rowDate}>{c.updatedAt}</span>
          </div>
        ))}
      </div>
    )
  }

  if (view === 'timeline') {
    const groups = cards.reduce<Record<string, LibCard[]>>((acc, c) => {
      acc[c.updatedAt] = acc[c.updatedAt] ?? []
      acc[c.updatedAt].push(c)
      return acc
    }, {})
    return (
      <div className={s.timeline}>
        {Object.entries(groups).map(([date, list]) => (
          <section key={date} className={s.dayGroup}>
            <div className={s.day}>
              <span className={s.dayLabel}>{date}</span>
              <span className={s.dayCount}>{list.length} 张</span>
            </div>
            <div className={s.dayList}>
              {list.map((c) => (
                <article key={c.id} className={s.tRow} onClick={() => onOpen(c.id)}>
                  <span className={s.tBar} style={{ background: `var(--c-${c.color}-fill)` }} />
                  <span className={s.tTitle}>{c.title}</span>
                  <span className={s.tTags}>{c.tags.map((t) => '#' + t).join(' ')}</span>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className={s.grid}>
      {cards.map((c) => (
        <article
          key={c.id}
          className={s.card}
          data-selected={selected.includes(c.id)}
          style={{ background: `var(--c-${c.color}-fill)` }}
          onClick={() => onOpen(c.id)}
        >
          <div className={s.cardTop}>
            <span className={s.title}>{c.title}</span>
            <button
              type="button"
              className={s.checkBtn}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(c.id)
              }}
            >
              <Check on={selected.includes(c.id)} />
            </button>
          </div>
          <p className={s.excerpt}>{c.excerpt}</p>
          <div className={s.meta}>
            <span className={s.tags}>{c.tags.map((t) => '#' + t).join(' ')}</span>
            <MasteryBadge level={c.mastery} />
          </div>
        </article>
      ))}
    </div>
  )
}
''')
w(base + '/C50-CardGrid/C50-CardGrid.module.css', '''.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
  gap: var(--sp-4);
}

.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 132px;
  padding: var(--sp-3);
  border-radius: var(--r-1);
  box-shadow: inset 0 0 0 1px var(--c-line), var(--sh-1);
  cursor: pointer;
}

.card[data-selected='true'] {
  box-shadow: inset 0 0 0 1.5px var(--c-accent), var(--sh-2);
}

.cardTop {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.title {
  flex: 1;
  font-size: var(--fs-13);
  line-height: var(--lh-13);
  font-weight: 500;
  color: var(--c-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.checkBtn {
  flex: none;
  padding: 0;
  margin-top: 1px;
}

.check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: color-mix(in oklab, var(--c-panel) 70%, transparent);
  box-shadow: inset 0 0 0 1px var(--c-line-strong);
  font-size: 9px;
  color: #fff;
  opacity: 0.55;
}

.card:hover .check,
.check[data-on='true'] {
  opacity: 1;
}

.check[data-on='true'] {
  background: var(--c-accent);
  box-shadow: inset 0 0 0 1px var(--c-accent);
}

.excerpt {
  margin: 0;
  font-size: var(--fs-11);
  line-height: 1.55;
  color: var(--c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  margin-top: auto;
}

.tags {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 列表 */
.list {
  display: flex;
  flex-direction: column;
}

.head,
.row {
  display: grid;
  grid-template-columns: 28px minmax(0, 2.2fr) minmax(0, 1.2fr) 64px minmax(0, 1fr) 76px;
  gap: var(--sp-2);
  align-items: center;
  padding: 0 var(--sp-2);
  height: 36px;
  border-bottom: 0.5px solid var(--c-line);
}

.head {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  height: 28px;
}

.row {
  font-size: var(--fs-12);
  cursor: pointer;
}

.row:hover {
  background: var(--c-sunken);
}

.row[data-selected='true'] {
  background: var(--c-accent-weak);
}

.rowTitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rowTags,
.rowSource,
.rowDate {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rowStatus {
  font-size: var(--fs-11);
  color: var(--c-text-2);
}

/* 时间线 */
.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.dayGroup {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--sp-3);
}

.day {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 2px;
}

.dayLabel {
  font-size: var(--fs-11);
  color: var(--c-text-2);
  font-variant-numeric: tabular-nums;
}

.dayCount {
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.dayList {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 0.5px solid var(--c-line);
  padding-left: var(--sp-3);
}

.tRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: 30px;
  padding: 0 var(--sp-2);
  border-radius: 6px;
  cursor: pointer;
}

.tRow:hover {
  background: var(--c-sunken);
}

.tBar {
  width: 3px;
  height: 14px;
  border-radius: var(--r-full);
  flex: none;
}

.tTitle {
  font-size: var(--fs-12);
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tTags {
  margin-left: auto;
  font-size: var(--fs-11);
  color: var(--c-text-3);
}
''')
print('ok')
