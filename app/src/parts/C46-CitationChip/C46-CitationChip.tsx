import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C46-CitationChip.module.css'

export function CitationChip({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}): JSX.Element {
  return (
    <button type="button" className={s.chip} onClick={onClick} title="跳到原文">
      <Icon name="pdf" size={12} />
      <span>{label}</span>
    </button>
  )
}
