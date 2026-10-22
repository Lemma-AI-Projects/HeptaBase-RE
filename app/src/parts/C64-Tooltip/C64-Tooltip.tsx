import { useState, type JSX, type ReactNode } from 'react'
import s from './C64-Tooltip.module.css'

export type TooltipProps = {
  label: string
  shortcut?: string
  delay?: number
  placement?: 'top' | 'bottom' | 'right'
  open?: boolean
  children: ReactNode
}

export function Tooltip({
  label,
  shortcut,
  delay = 300,
  placement = 'bottom',
  open: forceOpen,
  children,
}: TooltipProps): JSX.Element {
  const [hover, setHover] = useState(false)
  const [timer, setTimer] = useState<number | undefined>(undefined)

  const show = () => {
    window.clearTimeout(timer)
    setTimer(window.setTimeout(() => setHover(true), delay))
  }
  const hide = () => {
    window.clearTimeout(timer)
    setHover(false)
  }
  const open = forceOpen ?? hover

  return (
    <span className={s.wrap} onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open && label ? (
        <span className={`${s.tip} ${s[placement]}`} role="tooltip">
          {label}
          {shortcut ? <span className={s.kbd}>{shortcut}</span> : null}
        </span>
      ) : null}
    </span>
  )
}
