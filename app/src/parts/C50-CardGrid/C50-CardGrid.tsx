import type { JSX } from 'react'
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
