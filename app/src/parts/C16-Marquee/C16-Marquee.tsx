import type { JSX } from 'react'
import s from './C16-Marquee.module.css'

export function Marquee({
  rect,
}: {
  rect: { x: number; y: number; w: number; h: number } | null
}): JSX.Element | null {
  if (!rect || (rect.w < 2 && rect.h < 2)) return null
  return (
    <div
      className={s.box}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    />
  )
}
