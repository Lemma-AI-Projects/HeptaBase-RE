import { useEffect, useRef, type JSX } from 'react'
import { Icon, type IconName } from '@/icons'
import s from './C21-ContextMenu.module.css'

export type MenuItem = {
  id: string
  label: string
  icon?: IconName
  shortcut?: string
  danger?: boolean
  divider?: boolean
}

export function ContextMenu({
  x,
  y,
  items,
  onPick,
  onDismiss,
}: {
  x: number
  y: number
  items: MenuItem[]
  onPick: (id: string) => void
  onDismiss: () => void
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDismiss()
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown, true)
    }
  }, [onDismiss])

  // 贴边避让
  const w = 208
  const h = items.length * 30 + 12
  const left = Math.min(Math.max(8, x), window.innerWidth - w - 8)
  const top = Math.min(Math.max(8, y), window.innerHeight - h - 8)

  return (
    <div ref={ref} className={s.menu} style={{ left, top, width: w }} role="menu">
      {items.map((it) =>
        it.divider ? (
          <div key={it.id} className={s.sep} />
        ) : (
          <button
            key={it.id}
            type="button"
            className={`${s.item} ${it.danger ? s.danger : ''}`}
            onClick={() => onPick(it.id)}
          >
            {it.icon ? <Icon name={it.icon} size={14} /> : <span className={s.iconPad} />}
            <span className={s.label}>{it.label}</span>
            {it.shortcut ? <span className={s.kbd}>{it.shortcut}</span> : null}
          </button>
        )
      )}
    </div>
  )
}
