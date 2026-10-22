import { useCallback, useEffect, useRef, useState, type JSX, type ReactNode } from 'react'
import { ZOOM_MAX, ZOOM_MIN } from '@/tokens'
import s from './C10-CanvasViewport.module.css'

export type Viewport = { x: number; y: number; zoom: number }

export type CanvasViewportProps = {
  viewport: Viewport
  tool?: 'select' | 'hand'
  readonly?: boolean
  children: ReactNode
  onViewportChange: (v: Viewport) => void
  onBlankDoubleClick?: (p: { x: number; y: number }) => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function CanvasViewport({
  viewport,
  tool = 'select',
  readonly = true,
  children,
  onViewportChange,
  onBlankDoubleClick,
}: CanvasViewportProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)
  const [spaceDown, setSpaceDown] = useState(false)
  const drag = useRef<{ id: number; x: number; y: number; vx: number; vy: number } | null>(null)

  /* 视口以 ref 为准：同一帧内的多个 wheel 事件依次累加，不再互相覆盖 */
  const vpRef = useRef(viewport)
  vpRef.current = viewport
  const cbRef = useRef(onViewportChange)
  cbRef.current = onViewportChange

  const commit = (next: { x: number; y: number; zoom: number }) => {
    vpRef.current = next
    cbRef.current(next)
  }

  const zoomAtRef = useRef((factor: number, clientX: number, clientY: number) => {
    const el = rootRef.current
    if (!el) return
    const v = vpRef.current
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left
    const py = clientY - rect.top
    const next = clamp(v.zoom * factor, ZOOM_MIN, ZOOM_MAX)
    const world = { x: (px - v.x) / v.zoom, y: (py - v.y) / v.zoom }
    commit({ zoom: next, x: px - world.x * next, y: py - world.y * next })
  })

  // 只在挂载时绑一次；父组件每次重渲染不再解绑重绑
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const v = vpRef.current
      if (e.ctrlKey || e.metaKey) {
        zoomAtRef.current(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY)
        return
      }
      const step = e.deltaMode === 1 ? 16 : 1
      if (e.shiftKey) {
        commit({ ...v, x: v.x - e.deltaY * step })
        return
      }
      commit({ ...v, y: v.y - e.deltaY * step })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target as HTMLElement)?.closest('input,textarea')) {
        e.preventDefault()
        setSpaceDown(true)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const panning = tool === 'hand' || spaceDown

  return (
    <div
      ref={rootRef}
      className={`${s.root} ${panning ? s.grab : ''}`}
      data-readonly={readonly}
      onPointerDown={(e) => {
        if (!panning && e.button !== 1) return
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          vx: vpRef.current.x,
          vy: vpRef.current.y,
        }
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || d.id !== e.pointerId) return
        commit({
          ...vpRef.current,
          x: d.vx + (e.clientX - d.x),
          y: d.vy + (e.clientY - d.y),
        })
      }}
      onPointerUp={() => {
        drag.current = null
      }}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-object]')) return
        const rect = rootRef.current!.getBoundingClientRect()
        onBlankDoubleClick?.({
          x: (e.clientX - rect.left - viewport.x) / viewport.zoom,
          y: (e.clientY - rect.top - viewport.y) / viewport.zoom,
        })
      }}
    >
      <div
        className={s.layer}
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
          // @ts-expect-error CSS 变量
          '--zoom': viewport.zoom,
        }}
      >
        {children}
      </div>
    </div>
  )
}
