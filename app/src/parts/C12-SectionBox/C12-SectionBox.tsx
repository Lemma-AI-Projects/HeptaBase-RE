import type { JSX } from 'react'
import type { CardColor } from '@/tokens'
import s from './C12-SectionBox.module.css'

export type SectionBoxProps = {
  title: string
  color: CardColor
  rect: { x: number; y: number; w: number; h: number }
  count: number
  collapsed?: boolean
  selected?: boolean
  force?: 'default' | 'hover' | 'selected' | 'disabled' | 'empty'
}

export function SectionBox({
  title,
  color,
  rect,
  count,
  collapsed = false,
  selected = false,
  force,
}: SectionBoxProps): JSX.Element {
  const cls = [
    s.box,
    selected ? s.selected : '',
    collapsed ? s.collapsed : '',
    force ? s[`force_${force}`] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cls}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: collapsed ? 44 : rect.h,
        // @ts-expect-error CSS 变量
        '--sec-fill': `var(--c-${color}-fill)`,
        '--sec-solid': `var(--c-${color}-solid)`,
      }}
    >
      <span className={s.capsule}>
        <span className={s.name}>{title || '未命名分区'}</span>
        <span className={s.count}>{count}</span>
      </span>
      {collapsed ? <span className={s.collapsedHint}>{count} 张 · 已折叠</span> : null}
    </div>
  )
}
