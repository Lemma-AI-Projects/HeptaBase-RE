import type { JSX, ReactNode } from 'react'
import s from './C13-TextNode.module.css'

export type TextNodeProps = {
  children: ReactNode
  x: number
  y: number
  width: number
  size?: 'display' | 'title' | 'body'
  tone?: 'strong' | 'muted'
  selected?: boolean
}

export function TextNode({
  children,
  x,
  y,
  width,
  size = 'body',
  tone = 'strong',
  selected = false,
}: TextNodeProps): JSX.Element {
  return (
    <div
      className={`${s.text} ${s[size]} ${s[tone]} ${selected ? s.selected : ''}`}
      style={{ left: x, top: y, width }}
    >
      {children}
    </div>
  )
}
