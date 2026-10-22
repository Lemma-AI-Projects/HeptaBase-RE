import type { JSX } from 'react'
import type { Question } from '@/lib/learning'
import { CitationChip } from '../C46-CitationChip/C46-CitationChip'
import s from './C42-ReviewCard.module.css'

export function ReviewCard({
  question,
  flipped,
  onFlip,
  onSourceOpened,
}: {
  question: Question
  flipped: boolean
  onFlip: () => void
  onSourceOpened?: () => void
}): JSX.Element {
  return (
    <div className={s.card} data-flipped={flipped} onClick={onFlip} role="button" tabIndex={0}>
      <div className={s.tag}>#{question.tag}</div>
      <p className={s.front}>{question.front}</p>
      {flipped ? (
        <>
          <div className={s.rule} />
          <p className={s.back}>{question.back}</p>
          <div className={s.source}>
            <CitationChip
              label={`p.${question.source.page} · ${question.source.paragraph}`}
              onClick={onSourceOpened}
            />
            <span className={s.file}>{question.source.file}</span>
          </div>
        </>
      ) : (
        <div className={s.hint}>空格 / 点击翻面</div>
      )}
    </div>
  )
}
