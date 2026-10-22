import type { JSX, ReactNode } from 'react'
import s from './C01-AppShell.module.css'

export type AppShellProps = {
  leftWidth?: number
  rightWidth?: number
  rightOpen?: boolean
  left: ReactNode
  main: ReactNode
  right?: ReactNode
}

export function AppShell({
  leftWidth = 240,
  rightWidth = 360,
  rightOpen = true,
  left,
  main,
  right,
}: AppShellProps): JSX.Element {
  return (
    <div className={s.shell}>
      <aside className={s.left} style={{ width: leftWidth }}>
        {left}
      </aside>
      <main className={s.main}>{main}</main>
      <aside
        className={s.right}
        style={{ width: rightOpen ? rightWidth : 0 }}
        aria-hidden={!rightOpen}
      >
        <div className={s.rightInner} style={{ width: rightWidth }}>
          {right}
        </div>
      </aside>
    </div>
  )
}
