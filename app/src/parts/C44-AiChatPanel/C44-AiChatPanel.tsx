import { useEffect, useRef, useState, type JSX } from 'react'
import { AiMessage, type Citation } from '../C45-AiMessage/C45-AiMessage'
import { IconButton } from '../C61-IconButton/C61-IconButton'
import s from './C44-AiChatPanel.module.css'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  citations?: Citation[]
}

export function AiChatPanel({
  messages,
  streaming,
  onSend,
  onCite,
  onExcerpt,
  onQuiz,
}: {
  messages: ChatMessage[]
  streaming: boolean
  onSend: (text: string) => void
  onCite: (c: Citation) => void
  onExcerpt: (m: ChatMessage) => void
  onQuiz: () => void
}): JSX.Element {
  const [draft, setDraft] = useState('')
  const [revealed, setRevealed] = useState(0)
  const last = messages[messages.length - 1]
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!streaming || !last) {
      setRevealed(Number.POSITIVE_INFINITY)
      return
    }
    setRevealed(0)
    const full = last.text.length
    const tick = 30
    const perTick = Math.max(1, Math.ceil(full / (1200 / tick)))
    const id = window.setInterval(() => {
      setRevealed((r) => {
        if (r >= full) {
          window.clearInterval(id)
          return r
        }
        return r + perTick
      })
    }, tick)
    return () => window.clearInterval(id)
  }, [streaming, last?.id, last?.text])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [messages.length, revealed])

  return (
    <div className={s.panel}>
      <header className={s.head}>
        <span>AI 导师</span>
        <div className={s.headActions}>
          <button type="button" className={s.quiz} onClick={onQuiz}>
            出题考我
          </button>
          <IconButton icon="more" size="sm" tooltip="更多" />
        </div>
      </header>

      <div className={s.list} ref={scroller}>
        {messages.map((m) => (
          <AiMessage
            key={m.id}
            role={m.role}
            text={
              streaming && m.id === last?.id && Number.isFinite(revealed)
                ? m.text.slice(0, revealed)
                : m.text
            }
            citations={m.citations}
            streaming={streaming && m.id === last?.id}
            onCite={onCite}
            onDragOut={() => onExcerpt(m)}
            onCopy={() => navigator.clipboard?.writeText(m.text)}
          />
        ))}
      </div>

      <form
        className={s.inputRow}
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          onSend(draft.trim())
          setDraft('')
        }}
      >
        <input
          className={s.input}
          value={draft}
          placeholder="问这张板上的东西…"
          onChange={(e) => setDraft(e.target.value)}
        />
        <IconButton icon="sparkles" size="sm" tooltip="发送" />
        <button type="submit" className={s.send} aria-label="发送">
          ↑
        </button>
      </form>
    </div>
  )
}
