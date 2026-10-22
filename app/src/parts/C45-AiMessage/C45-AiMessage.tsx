import type { JSX } from 'react'
import { IconButton } from '../C61-IconButton/C61-IconButton'
import { CitationChip } from '../C46-CitationChip/C46-CitationChip'
import s from './C45-AiMessage.module.css'

export type Citation = { file: string; page: number; paragraph: string; label: string }

export function AiMessage({
  role,
  text,
  citations,
  streaming,
  onCite,
  onDragOut,
  onCopy,
}: {
  role: 'user' | 'assistant'
  text: string
  citations?: Citation[]
  streaming?: boolean
  onCite?: (c: Citation) => void
  onDragOut?: () => void
  onCopy?: () => void
}): JSX.Element {
  if (role === 'user') {
    return (
      <div className={s.userRow}>
        <div className={s.user}>{text}</div>
      </div>
    )
  }
  return (
    <div className={s.ai}>
      <div className={s.body}>
        {text}
        {streaming ? <span className={s.caret} /> : null}
      </div>
      {citations && citations.length > 0 && !streaming ? (
        <div className={s.cites}>
          {citations.map((c) => (
            <CitationChip key={c.label} label={c.label} onClick={() => onCite?.(c)} />
          ))}
        </div>
      ) : null}
      {!streaming ? (
        <div className={s.actions}>
          <button type="button" className={s.link} onClick={onDragOut}>
            拖成卡
          </button>
          <span className={s.sep} />
          <IconButton icon="library" size="sm" tooltip="复制" onClick={onCopy} />
        </div>
      ) : null}
    </div>
  )
}
