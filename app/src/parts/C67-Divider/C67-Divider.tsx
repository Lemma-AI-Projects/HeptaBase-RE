import type { JSX } from 'react'
import s from './C67-Divider.module.css'

export function Divider({
  orientation = 'horizontal',
  inset = false,
}: {
  orientation?: 'horizontal' | 'vertical'
  inset?: boolean
}): JSX.Element {
  return (
    <div
      role="separator"
      className={`${s.line} ${s[orientation]} ${inset ? s.inset : ''}`}
    />
  )
}
