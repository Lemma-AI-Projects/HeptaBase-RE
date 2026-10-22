import type { JSX } from 'react'
import { Icon, type IconName } from '@/icons'
import { Tooltip } from '../C64-Tooltip/C64-Tooltip'
import s from './C61-IconButton.module.css'

export type IconButtonProps = {
  icon: IconName
  active?: boolean
  disabled?: boolean
  tooltip?: string
  shortcut?: string
  size?: 'sm' | 'md'
  force?: 'hover'
  onClick?: () => void
}

export function IconButton({
  icon,
  active = false,
  disabled = false,
  tooltip,
  shortcut,
  size = 'md',
  force,
  onClick,
}: IconButtonProps): JSX.Element {
  const btn = (
    <button
      type="button"
      className={`${s.btn} ${s[size]} ${active ? s.active : ''}`}
      disabled={disabled}
      aria-label={tooltip ?? icon}
      aria-pressed={active}
      data-force={force}
      onClick={onClick}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : 20} />
    </button>
  )
  return tooltip ? (
    <Tooltip label={tooltip} shortcut={shortcut} placement="right">
      {btn}
    </Tooltip>
  ) : (
    btn
  )
}
