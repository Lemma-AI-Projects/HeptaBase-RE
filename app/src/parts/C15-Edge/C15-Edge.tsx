import type { JSX, PointerEvent as ReactPointerEvent } from 'react'
import { bezierMid, curveControls, edgePath, type Side } from '@/lib/board-layout'
import s from './C15-Edge.module.css'

export type EdgeProps = {
  from: { x: number; y: number }
  to: { x: number; y: number }
  fromSide: Side
  toSide: Side
  shape?: 'curve' | 'ortho'
  direction?: 'one' | 'both' | 'none'
  label?: string
  selected?: boolean
  disabled?: boolean
  /** 当前缩放，用来把命中区换算成屏幕上恒定的宽度 */
  zoom?: number
  /** 标签由上层单独渲染时，这里不画 */
  hideLabel?: boolean
  bend?: { x: number; y: number }
  onBendDown?: (e: ReactPointerEvent) => void
  onBendReset?: () => void
  onSelect?: () => void
  onHandleDown?: (which: 'from' | 'to', e: ReactPointerEvent) => void
}

const deg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI

export function Edge({
  from,
  to,
  fromSide,
  toSide,
  shape = 'curve',
  direction = 'one',
  label,
  selected = false,
  disabled = false,
  zoom = 1,
  hideLabel = false,
  bend,
  onBendDown,
  onBendReset,
  onSelect,
  onHandleDown,
}: EdgeProps): JSX.Element {
  const d = edgePath(from, to, fromSide, toSide, shape, bend)
  const { c1, c2 } = curveControls(from, to, fromSide, toSide)
  const bx = bend?.x ?? 0
  const by = bend?.y ?? 0
  const endAngle = deg({ x: c2.x + bx, y: c2.y + by }, to)
  const startAngle = deg({ x: c1.x + bx, y: c1.y + by }, from)
  const mid = bezierMid(from, to, fromSide, toSide, bend)
  const color = selected ? 'var(--c-accent)' : 'var(--c-line-strong)'

  return (
    <g className={s.edge} opacity={disabled ? 0.45 : 1}>
      <path d={d} fill="none" stroke={color} strokeWidth={selected ? 1.5 : 1} strokeLinecap="round" />
      {direction === 'one' || direction === 'both' ? (
        <g transform={`translate(${to.x} ${to.y}) rotate(${endAngle}) translate(-7 0)`} fill={color}>
          <path d="M0 0 L7 3.2 L0 6.4 Z" />
        </g>
      ) : null}
      {direction === 'both' ? (
        <g transform={`translate(${from.x} ${from.y}) rotate(${startAngle}) translate(-7 0)`} fill={color}>
          <path d="M0 0 L7 3.2 L0 6.4 Z" />
        </g>
      ) : null}
      {label && !hideLabel ? (
        <g transform={`translate(${mid.x} ${mid.y})`}>
          <rect x={-(label.length * 6 + 8)} y={-9} width={label.length * 12 + 16} height={18} rx={8} fill="var(--c-canvas)" />
          <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="var(--c-text-2)">
            {label}
          </text>
        </g>
      ) : null}

      {/* 命中区：只在线上生效，宽 14 */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={16 / Math.max(0.05, zoom)}
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onPointerDown={(e) => {
          e.stopPropagation()
          onSelect?.()
        }}
      />

      {selected && onBendDown ? (
        <circle
          data-edge-bend="1"
          cx={mid.x}
          cy={mid.y}
          r={5}
          fill="var(--c-panel)"
          stroke="var(--c-accent)"
          strokeWidth={1.5}
          style={{ cursor: 'move', pointerEvents: 'auto' }}
          onPointerDown={onBendDown}
          onDoubleClick={(e) => {
            e.stopPropagation()
            onBendReset?.()
          }}
        />
      ) : null}

      {selected ? (
        <>
          <circle
            data-edge-handle="from"
            cx={from.x}
            cy={from.y}
            r={5}
            fill="var(--c-panel)"
            stroke="var(--c-accent)"
            strokeWidth={1.5}
            style={{ pointerEvents: 'all', cursor: 'crosshair' }}
            onPointerDown={(e) => {
              e.stopPropagation()
              onHandleDown?.('from', e)
            }}
          />
          <circle
            data-edge-handle="to"
            cx={to.x}
            cy={to.y}
            r={5}
            fill="var(--c-panel)"
            stroke="var(--c-accent)"
            strokeWidth={1.5}
            style={{ pointerEvents: 'all', cursor: 'crosshair' }}
            onPointerDown={(e) => {
              e.stopPropagation()
              onHandleDown?.('to', e)
            }}
          />
        </>
      ) : null}
    </g>
  )
}
