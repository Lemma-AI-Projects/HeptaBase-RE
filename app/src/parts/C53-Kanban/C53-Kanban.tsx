import type { JSX } from 'react'
import type { LibCard, Status } from '@/lib/library'
import s from './C53-Kanban.module.css'

const COLS: Status[] = ['未开始', '在学', '已掌握']

export function Kanban({
  cards,
  onMove,
  onOpen,
}: {
  cards: LibCard[]
  onMove: (id: string, status: Status) => void
  onOpen: (id: string) => void
}): JSX.Element {
  return (
    <div className={s.board}>
      {COLS.map((col) => {
        const list = cards.filter((c) => c.status === col)
        return (
          <section key={col} className={s.col}>
            <header className={s.colHead}>
              <span>{col}</span>
              <span className={s.count}>{list.length}</span>
            </header>
            <div className={s.colBody}>
              {list.slice(0, 12).map((c) => (
                <article key={c.id} className={s.card} onClick={() => onOpen(c.id)}>
                  <span className={s.title}>{c.title}</span>
                  <div className={s.foot}>
                    <span className={s.tags}>{c.tags.map((t) => '#' + t).join(' ')}</span>
                    <button
                      type="button"
                      className={s.move}
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = COLS[(COLS.indexOf(col) + 1) % COLS.length]
                        onMove(c.id, next)
                      }}
                    >
                      →
                    </button>
                  </div>
                </article>
              ))}
              {list.length > 12 ? <div className={s.more}>还有 {list.length - 12} 张</div> : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
