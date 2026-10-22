import type { JSX } from 'react'
import type { Question } from '@/lib/learning'
import { IconButton } from '../C61-IconButton/C61-IconButton'
import { Button } from '../C60-Button/C60-Button'
import { ReviewCard } from '../C42-ReviewCard/C42-ReviewCard'
import s from './C43-ReviewSession.module.css'

export function ReviewSession({
  question,
  index,
  total,
  flipped,
  onFlip,
  onRate,
  onExit,
  onSourceOpened,
}: {
  question: Question
  index: number
  total: number
  flipped: boolean
  onFlip: () => void
  onRate: (r: 'solid' | 'fuzzy') => void
  onExit: () => void
  onSourceOpened?: () => void
}): JSX.Element {
  return (
    <div className={s.wrap}>
      <header className={s.head}>
        <span className={s.progress}>
          {index + 1} / {total}
        </span>
        <span className={s.bar}>
          <span style={{ width: `${(index / Math.max(1, total)) * 100}%` }} />
        </span>
        <IconButton icon="close" tooltip="退出复习" onClick={onExit} />
      </header>

      <ReviewCard question={question} flipped={flipped} onFlip={onFlip} onSourceOpened={onSourceOpened} />

      <footer className={s.foot}>
        {flipped ? (
          <>
            <Button label="还是模糊" variant="secondary" onClick={() => onRate('fuzzy')} />
            <Button label="懂了" variant="primary" onClick={() => onRate('solid')} />
          </>
        ) : (
          <Button label="翻面" variant="primary" onClick={onFlip} />
        )}
      </footer>
      <p className={s.keys}>空格翻面 · 1 模糊 · 2 懂了</p>
    </div>
  )
}
