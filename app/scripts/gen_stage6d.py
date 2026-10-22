# -*- coding: utf-8 -*-
import io, os

def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, 'w', encoding='utf-8').write(content)

b = 'src/parts'

w(b + '/C58-CommandPalette/C58-CommandPalette.tsx', '''import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { Icon } from '@/icons'
import s from './C58-CommandPalette.module.css'

export type Command = {
  id: string
  label: string
  group: string
  shortcut?: string
  disabled?: boolean
  reason?: string
}

export function CommandPalette({
  open,
  commands,
  onRun,
  onClose,
}: {
  open: boolean
  commands: Command[]
  onRun: (id: string) => void
  onClose: () => void
}): JSX.Element | null {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
      window.setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  const list = useMemo(() => {
    const key = q.trim().toLowerCase()
    return commands.filter((c) => !key || c.label.toLowerCase().includes(key) || c.group.includes(key))
  }, [q, commands])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIdx((i) => Math.min(list.length - 1, i + 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIdx((i) => Math.max(0, i - 1))
      }
      if (e.key === 'Enter') {
        const item = list[idx]
        if (item && !item.disabled) onRun(item.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, list, idx, onRun, onClose])

  if (!open) return null

  return (
    <div className={s.scrim} onPointerDown={onClose}>
      <div className={s.panel} onPointerDown={(e) => e.stopPropagation()} role="dialog">
        <div className={s.inputRow}>
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            className={s.input}
            value={q}
            placeholder="输入命令…"
            onChange={(e) => {
              setQ(e.target.value)
              setIdx(0)
            }}
          />
          <span className={s.esc}>esc</span>
        </div>
        <div className={s.list}>
          {list.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`${s.item} ${i === idx ? s.active : ''}`}
              data-disabled={c.disabled}
              onMouseEnter={() => setIdx(i)}
              onClick={() => !c.disabled && onRun(c.id)}
            >
              <span className={s.group}>{c.group}</span>
              <span className={s.label}>{c.label}</span>
              {c.disabled ? <span className={s.reason}>{c.reason}</span> : null}
              {c.shortcut ? <span className={s.kbd}>{c.shortcut}</span> : null}
            </button>
          ))}
          {list.length === 0 ? <div className={s.empty}>没有匹配的命令</div> : null}
        </div>
        <div className={s.foot}>
          <span>↑↓ 选择 · ↵ 执行</span>
          <span>{list.length} 个动作</span>
        </div>
      </div>
    </div>
  )
}
''')
w(b + '/C58-CommandPalette/C58-CommandPalette.module.css', '''.scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: color-mix(in oklab, var(--c-text) 18%, transparent);
  display: flex;
  justify-content: center;
  padding-top: 120px;
  animation: fade var(--dur-2) var(--ease-out);
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

.panel {
  width: 560px;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  border-radius: var(--r-2);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line), var(--sh-3);
  overflow: hidden;
}

.inputRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-3);
  height: 46px;
  border-bottom: 0.5px solid var(--c-line);
  color: var(--c-text-3);
}

.input {
  flex: 1;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: var(--fs-14);
  color: var(--c-text);
}

.esc {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--c-sunken);
  color: var(--c-text-3);
}

.list {
  flex: 1;
  overflow: auto;
  padding: var(--sp-1);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: 34px;
  padding: 0 var(--sp-2);
  border-radius: 6px;
  text-align: left;
  font-size: var(--fs-13);
  color: var(--c-text);
}

.item:hover {
  background: var(--c-sunken);
}

.active {
  background: var(--c-accent-weak);
}

.item[data-disabled='true'] {
  color: var(--c-text-3);
  cursor: not-allowed;
}

.group {
  width: 64px;
  font-size: var(--fs-11);
  color: var(--c-text-3);
  flex: none;
}

.label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reason {
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.kbd {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.empty {
  padding: var(--sp-4);
  text-align: center;
  font-size: var(--fs-12);
  color: var(--c-text-3);
}

.foot {
  display: flex;
  justify-content: space-between;
  padding: 6px var(--sp-3);
  border-top: 0.5px solid var(--c-line);
  font-size: var(--fs-11);
  color: var(--c-text-3);
}
''')

w(b + '/C57-SearchOverlay/C57-SearchOverlay.tsx', '''import { useEffect, useRef, useState, type JSX } from 'react'
import { Icon } from '@/icons'
import { BOARDS, searchCards, TAGS, type LibCard } from '@/lib/library'
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
  const [q, setQ] = useState('')
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
  const boards = q ? BOARDS.filter((b) => b.includes(q)).slice(0, 4) : []
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
''')
w(b + '/C57-SearchOverlay/C57-SearchOverlay.module.css', '''.scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: color-mix(in oklab, var(--c-text) 18%, transparent);
  display: flex;
  justify-content: center;
  padding-top: 120px;
}

.panel {
  width: 600px;
  max-height: 460px;
  display: flex;
  flex-direction: column;
  border-radius: var(--r-2);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line), var(--sh-3);
  overflow: hidden;
}

.inputRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-3);
  height: 46px;
  border-bottom: 0.5px solid var(--c-line);
  color: var(--c-text-3);
}

.input {
  flex: 1;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: var(--fs-14);
  color: var(--c-text);
}

.esc {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--c-sunken);
  color: var(--c-text-3);
}

.body {
  flex: 1;
  overflow: auto;
  padding: var(--sp-2) var(--sp-1) var(--sp-3);
}

.hint {
  padding: var(--sp-4);
  font-size: var(--fs-12);
  color: var(--c-text-3);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: var(--sp-2);
}

.groupName {
  padding: var(--sp-1) var(--sp-2);
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: 34px;
  padding: 0 var(--sp-2);
  border-radius: 6px;
  text-align: left;
  font-size: var(--fs-13);
  color: var(--c-text);
  min-width: 0;
}

.row:hover {
  background: var(--c-sunken);
}

.rowTitle {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rowMeta {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 var(--sp-2);
}

.tag {
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: var(--r-full);
  background: var(--c-sunken);
  font-size: var(--fs-11);
  color: var(--c-text-2);
}
''')
print('ok')
