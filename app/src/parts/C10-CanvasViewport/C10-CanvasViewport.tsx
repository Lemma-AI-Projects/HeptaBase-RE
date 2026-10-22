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

  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = clientX - rect.left
      const py = clientY - rect.top
      const next = clamp(viewport.zoom * factor, ZOOM_MIN, ZOOM_MAX)
      const world = {
        x: (px - viewport.x) / viewport.zoom,
        y: (py - viewport.y) / viewport.zoom,
      }
      onViewportChange({
        zoom: next,
        x: px - world.x * next,
        y: py - world.y * next,
      })
    },
    [viewport, onViewportChange]
  )

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY)
        return
      }
      if (e.shiftKey) {
        onViewportChange({ ...viewport, x: viewport.x - e.deltaY })
        return
      }
      onViewportChange({ ...viewport, y: viewport.y - e.deltaY })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [viewport, onViewportChange, zoomAt])

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
          vx: viewport.x,
          vy: viewport.y,
        }
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || d.id !== e.pointerId) return
        onViewportChange({
          ...viewport,
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
