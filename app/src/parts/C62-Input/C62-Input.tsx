import type { JSX } from 'react'
import s from './C62-Input.module.css'

export type InputProps = {
  value: string
  placeholder?: string
  error?: boolean
  errorText?: string
  disabled?: boolean
  force?: 'focus'
  onChange?: (v: string) => void
  onSubmit?: () => void
}

export function Input({
  value,
  placeholder = '',
  error = false,
  errorText,
  disabled = false,
  force,
  onChange,
  onSubmit,
}: InputProps): JSX.Element {
  return (
    <label className={s.wrap}>
      <input
        className={`${s.input} ${error ? s.error : ''}`}
        value={value}
        disabled={disabled}
        data-force={force}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.()
        }}
      />
      {error && errorText ? <span className={s.msg}>{errorText}</span> : null}
    </label>
  )
}
