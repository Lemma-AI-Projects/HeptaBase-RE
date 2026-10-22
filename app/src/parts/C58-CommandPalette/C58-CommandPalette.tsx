import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
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
