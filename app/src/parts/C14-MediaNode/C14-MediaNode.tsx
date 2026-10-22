import type { JSX, ReactNode } from 'react'
import s from './C14-MediaNode.module.css'

export type MediaNodeProps = {
  children: ReactNode
  x: number
  y: number
  width: number
  height: number
  caption?: string
  selected?: boolean
  disabled?: boolean
  onOpen?: () => void
}

export function MediaNode({
  children,
  x,
  y,
  width,
  height,
  caption,
  selected = false,
  disabled = false,
  onOpen,
}: MediaNodeProps): JSX.Element {
  return (
    <figure
      className={`${s.media} ${selected ? s.selected : ''} ${disabled ? s.disabled : ''}`}
      style={{ left: x, top: y, width, height }}
      onClick={onOpen}
    >
      <div className={s.frame}>{children}</div>
      {caption ? <figcaption className={s.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
