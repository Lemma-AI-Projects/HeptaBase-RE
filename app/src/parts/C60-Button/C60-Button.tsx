import type { JSX } from 'react'
import s from './C60-Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export type ButtonProps = {
  label: string
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  loading?: boolean
  disabled?: boolean
  disabledReason?: string
  force?: 'hover' | 'active'
  onClick?: () => void
}

export function Button({
  label,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  disabledReason,
  force,
  onClick,
}: ButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={`${s.btn} ${s[variant]} ${s[size]} ${disabled ? s.off : ''}`}
      disabled={disabled || loading}
      data-force={force}
      title={disabled ? disabledReason : undefined}
      onClick={onClick}
    >
      {loading ? <span className={s.spinner} /> : null}
      <span>{loading ? '处理中' : label}</span>
    </button>
  )
}
