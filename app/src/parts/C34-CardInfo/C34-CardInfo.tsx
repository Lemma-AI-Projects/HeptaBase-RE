import { useState, type JSX } from 'react'
import { Icon } from '@/icons'
import s from './C34-CardInfo.module.css'

export type CardInfoProps = {
  title: string
  created: string
  words: number
  source: string
  tags: string[]
  board: string
  editable?: boolean
  onTitleChange?: (v: string) => void
  onBoardOpened?: () => void
}

export function CardInfo({
  title,
  created,
  words,
  source,
  tags,
  board,
  editable = false,
  onTitleChange,
  onBoardOpened,
}: CardInfoProps): JSX.Element {
  const [adding, setAdding] = useState(false)
  const [extra, setExtra] = useState<string[]>([])
  const [draft, setDraft] = useState('')

  const commitTag = () => {
    const v = draft.trim().replace(/^#/, '')
    if (v && !tags.includes(v) && !extra.includes(v)) setExtra((x) => [...x, v])
    setDraft('')
    setAdding(false)
  }

  return (
    <header className={s.head}>
      {editable ? (
        <input
          className={s.titleInput}
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          aria-label="卡片标题"
        />
      ) : (
        <h1 className={s.title}>{title}</h1>
      )}

      <div className={s.meta}>
        <span>{created}</span>
        <span className={s.dot} />
        <span>{words} 字</span>
        <span className={s.dot} />
        <span>{source}</span>
      </div>

      <div className={s.tags}>
        {[...tags, ...extra].map((t) => (
          <span key={t} className={s.tag}>
            #{t}
          </span>
        ))}
        {adding ? (
          <input
            className={s.tagInput}
            autoFocus
            value={draft}
            placeholder="标签名"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitTag}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTag()
              if (e.key === 'Escape') {
                setDraft('')
                setAdding(false)
              }
            }}
          />
        ) : (
          <button
            type="button"
            className={s.addTag}
            aria-label="加标签"
            onClick={() => setAdding(true)}
          >
            +
          </button>
        )}
      </div>

      <button type="button" className={s.board} onClick={onBoardOpened}>
        <Icon name="board" size={14} />
        <span>{board}</span>
        <Icon name="chevronRight" size={14} />
      </button>
    </header>
  )
}
