import { useEffect, useLayoutEffect, useRef, useState, type JSX, type ReactNode } from 'react'
import s from './C63-Popover.module.css'

export type Placement = 'auto' | 'top' | 'bottom' | 'left' | 'right'

export type PopoverProps = {
  anchor: { x: number; y: number; w: number; h: number } | null
  open: boolean
  placement?: Placement
  modal?: boolean
  width?: number
  children: ReactNode
  onDismiss?: () => void
  onItemSelected?: (id: string) => void
}

const GAP = 6
const EDGE = 8

/** 浮层：四向翻转 + 贴边夹取；永不盖住锚点中心（V10） */
export function Popover({
  anchor,
  open,
  placement = 'auto',
  modal = false,
  width = 200,
  children,
  onDismiss,
}: PopoverProps): JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [resolved, setResolved] = useState<Exclude<Placement, 'auto'>>('bottom')

  useLayoutEffect(() => {
    if (!open || !anchor || !ref.current) return
    const el = ref.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const fits = {
      bottom: anchor.y + anchor.h + GAP + el.height <= vh - EDGE,
      top: anchor.y - GAP - el.height >= EDGE,
      right: anchor.x + anchor.w + GAP + el.width <= vw - EDGE,
      left: anchor.x - GAP - el.width >= EDGE,
    }
    const order: Exclude<Placement, 'auto'>[] =
      placement === 'auto'
        ? ['bottom', 'top', 'right', 'left']
        : [placement, ...(['bottom', 'top', 'right', 'left'] as const).filter((p) => p !== placement)]

    const dir = order.find((p) => fits[p]) ?? order[0]

    let x = 0
    let y = 0
    if (dir === 'bottom') {
      x = anchor.x
      y = anchor.y + anchor.h + GAP
    } else if (dir === 'top') {
      x = anchor.x
      y = anchor.y - el.height - GAP
    } else if (dir === 'right') {
      x = anchor.x + anchor.w + GAP
      y = anchor.y
    } else {
      x = anchor.x - el.width - GAP
      y = anchor.y
    }

    // 贴边夹取，但绝不压住锚点
    x = Math.min(Math.max(EDGE, x), Math.max(EDGE, vw - el.width - EDGE))
    y = Math.min(Math.max(EDGE, y), Math.max(EDGE, vh - el.height - EDGE))

    setPos({ x, y })
    setResolved(dir)
  }, [open, anchor, placement, width])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss?.()
    }
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss?.()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown, true)
    }
  }, [open, onDismiss])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={`${s.pop} ${modal ? s.modal : ''}`}
      style={{ left: pos.x, top: pos.y, width }}
      data-placement={resolved}
      role="dialog"
    >
      {children}
    </div>
  )
}
