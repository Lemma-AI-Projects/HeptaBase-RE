import type { JSX } from 'react'
import { InlineLines } from '@/lib/renderInline'
import type { CardColor } from '@/tokens'
import s from './C11-CardNode.module.css'

export type CardNodeData = {
  id: string
  title: string
  lines: string[]
  color: CardColor
  folded?: boolean
}

export type CardNodeProps = {
  card: CardNodeData
  selected?: boolean
  hovered?: boolean
  readonly?: boolean
  mastery?: 'none' | 'fuzzy' | 'solid'
  density?: 'canvas' | 'grid' | 'review'
  width?: number
  height?: number
  force?: 'default' | 'hover' | 'selected' | 'disabled' | 'empty'
  onClick?: (id: string) => void
}

export function CardNode({
  card,
  selected = false,
  hovered = false,
  readonly = true,
  mastery = 'none',
  density = 'canvas',
  width = 240,
  height,
  force,
  onClick,
}: CardNodeProps): JSX.Element {
  const folded = card.folded ?? false
  const cls = [
    s.card,
    s[density],
    selected ? s.selected : '',
    hovered ? s.hovered : '',
    folded ? s.folded : '',
    force ? s[`force_${force}`] : '',
    card.color !== 'gray' ? s.tinted : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cls}
      style={{
        width,
        height: folded ? 40 : height,
        // @ts-expect-error CSS 变量
        '--card-color': `var(--c-${card.color}-fill)`,
      }}
      data-readonly={readonly}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(card.id)}
    >
      {card.color !== 'gray' ? <span className={s.colorBar} /> : null}
      <h3 className={s.title}>{card.title || '无标题'}</h3>
      {!folded ? (
        <div className={s.body}>
          <InlineLines lines={card.lines} className={s.lines} />
        </div>
      ) : null}
      {folded ? <span className={s.foldMark} aria-hidden="true" /> : null}
      {mastery !== 'none' ? (
        <span className={`${s.mastery} ${s[mastery]}`} aria-label={mastery} />
      ) : null}
    </div>
  )
}
