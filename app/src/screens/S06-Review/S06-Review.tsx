import { useEffect, useRef, useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { ReviewSession } from '@/parts/C43-ReviewSession'
import { Button } from '@/parts/C60-Button'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS } from '@/lib/nav'
import { QUESTIONS, rateQuestion, resetReview, useReview } from '@/lib/learning'
import s from './S06-Review.module.css'

export function S06Review({
  theme,
  onToggleTheme,
  startFlipped = false,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  startFlipped?: boolean
}): JSX.Element {
  const queue = useReview()
  const [flipped, setFlipped] = useState(startFlipped)
  const [answered, setAnswered] = useState(0)
  const total = useRef(Math.max(1, queue.length))
  const current = QUESTIONS.find((q) => q.id === queue[0])

  const rate = (r: 'solid' | 'fuzzy') => {
    if (!current) return
    rateQuestion(current.id, r)
    setAnswered((n) => n + 1)
    setFlipped(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((v) => !v)
      }
      if (e.key === '1' && flipped) rate('fuzzy')
      if (e.key === '2' && flipped) rate('solid')
      if (e.key === 'Escape') navigate('/s01')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <AppShell
      left={<AppRail apps={APPS} activeId="today" tags={TAGS} />}
      main={
        <>
          <AppTabs
            active="/s01"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={false}
            onToggleRight={() => undefined}
          />
          <div className={s.stage}>
            {current ? (
              <ReviewSession
                question={current}
                index={answered}
                total={total.current}
                flipped={flipped}
                onFlip={() => setFlipped((v) => !v)}
                onRate={rate}
                onExit={() => navigate('/s01')}
                onSourceOpened={() => navigate('/s05')}
              />
            ) : (
              <div className={s.done}>
                <p className={s.doneTitle}>今天够了</p>
                <p className={s.doneSub}>
                  这一轮回答 {answered} 次，剩下 0 张。模糊的卡会在下一轮先出现。
                </p>
                <div className={s.doneActions}>
                  <Button label="回今日" variant="primary" onClick={() => navigate('/s01')} />
                  <Button label="再翻一遍" onClick={() => { resetReview(); setAnswered(0); setFlipped(false) }} />
                </div>
              </div>
            )}
          </div>
        </>
      }
    />
  )
}
