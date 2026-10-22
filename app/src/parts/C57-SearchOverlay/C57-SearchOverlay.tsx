import { useEffect, useRef, useState, type JSX } from 'react'
import { Icon } from '@/icons'
import { BOARD_LIST, searchCards, TAGS, type LibCard } from '@/lib/library'
import s from './C57-SearchOverlay.module.css'

export function SearchOverlay({
  open,
  onClose,
  onOpenCard,
  onOpenBoard,
}: {
  open: boolean
  onClose: () => void
  onOpenCard: (id: string) => void
  onOpenBoard: (name: string) => void
}): JSX.Element | null {
  const [q, setQ] = useState(() => (window.location.hash.includes('demo=search') ? '间隔' : ''))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQ('')
      window.setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const cards: LibCard[] = searchCards(q)
  const boards = q ? BOARD_LIST.filter((b) => b.includes(q)).slice(0, 4) : []
  const tags = q ? TAGS.filter((t) => t.includes(q)).slice(0, 6) : []

  return (
    <div className={s.scrim} onPointerDown={onClose}>
      <div className={s.panel} onPointerDown={(e) => e.stopPropagation()} role="dialog">
        <div className={s.inputRow}>
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            className={s.input}
            value={q}
            placeholder="搜卡片、白板、标签…"
            onChange={(e) => setQ(e.target.value)}
          />
          <span className={s.esc}>⌘O</span>
        </div>

        <div className={s.body}>
          {!q ? <div className={s.hint}>输入两个字就能搜；结果按 卡片 / 白板 / 标签 分组。</div> : null}

          {boards.length > 0 ? (
            <section className={s.group}>
              <div className={s.groupName}>白板</div>
              {boards.map((b) => (
                <button key={b} type="button" className={s.row} onClick={() => onOpenBoard(b)}>
                  <Icon name="board" size={14} />
                  <span className={s.rowTitle}>{b}</span>
                </button>
              ))}
            </section>
          ) : null}

          {cards.length > 0 ? (
            <section className={s.group}>
              <div className={s.groupName}>卡片 · {cards.length}</div>
              {cards.slice(0, 8).map((c) => (
                <button key={c.id} type="button" className={s.row} onClick={() => onOpenCard(c.id)}>
                  <Icon name="card" size={14} />
                  <span className={s.rowTitle}>{c.title}</span>
                  <span className={s.rowMeta}>{c.board}</span>
                </button>
              ))}
            </section>
          ) : null}

          {tags.length > 0 ? (
            <section className={s.group}>
              <div className={s.groupName}>标签</div>
              <div className={s.tags}>
                {tags.map((t) => (
                  <span key={t} className={s.tag}>
                    #{t}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {q && cards.length === 0 && boards.length === 0 && tags.length === 0 ? (
            <div className={s.hint}>没有结果。试试标签名，或按 ⌘K 用命令新建。</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
