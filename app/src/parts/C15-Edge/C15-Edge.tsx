import type { JSX, PointerEvent as ReactPointerEvent } from 'react'
import { bezierMid, curveControls, edgePath, type Side } from '@/lib/board-layout'
import s from './C15-Edge.module.css'

export type EdgeProps = {
  from: { x: number; y: number }
  to: { x: number; y: number }
  fromSide: Side
  toSide: Side
  shape?: 'curve' | 'ortho'
  direction?: 'one' | 'both'
  label?: string
  selected?: boolean
  disabled?: boolean
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
  onSelect,
  onHandleDown,
}: EdgeProps): JSX.Element {
  const d = edgePath(from, to, fromSide, toSide, shape)
  const { c1, c2 } = curveControls(from, to, fromSide, toSide)
  const endAngle = deg(c2, to)
  const startAngle = deg(c1, from)
  const mid = bezierMid(from, to, fromSide, toSide)
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
      {label ? (
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
        strokeWidth={14}
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onPointerDown={(e) => {
          e.stopPropagation()
          onSelect?.()
        }}
      />

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
