import { useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react'
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
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<Status | null>(null)
  const moved = useRef(false)

  /** 用指针拖：HTML5 的 DnD 在无头环境里没法验证，而且与白板的拖拽手感不一致 */
  const startDrag = (e: ReactPointerEvent<HTMLElement>, id: string) => {
    if (e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    moved.current = false

    const pointTo = (x: number, y: number): Status | null => {
      const el = document.elementFromPoint(x, y)?.closest('[data-status]') as HTMLElement | null
      return (el?.dataset.status as Status) ?? null
    }

    const track = (ev: PointerEvent) => {
      if (!moved.current && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return
      if (!moved.current) {
        moved.current = true
        setDragId(id)
      }
      setOverCol(pointTo(ev.clientX, ev.clientY))
    }

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', track)
      window.removeEventListener('pointerup', onUp)
      if (moved.current) {
        const target = pointTo(ev.clientX, ev.clientY)
        if (target) onMove(id, target)
      }
      setDragId(null)
      setOverCol(null)
    }

    window.addEventListener('pointermove', track)
    window.addEventListener('pointerup', onUp)
  }

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
            <div
              className={s.colBody}
              data-status={col}
              data-over={overCol === col && dragId ? 'true' : undefined}
            >
              {list.slice(0, 12).map((c) => (
                <article
                  key={c.id}
                  className={s.card}
                  data-dragging={dragId === c.id ? 'true' : undefined}
                  onPointerDown={(e) => startDrag(e, c.id)}
                  onClick={() => {
                    if (moved.current) {
                      moved.current = false
                      return
                    }
                    onOpen(c.id)
                  }}
                >
                  <span className={s.title}>{c.title}</span>
                  <div className={s.foot}>
                    <span className={s.tags}>{c.tags.map((t) => '#' + t).join(' ')}</span>
                    <button
                      type="button"
                      className={s.move}
                      aria-label="推到下一列"
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
              {list.length === 0 ? <div className={s.empty}>拖一张过来</div> : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
