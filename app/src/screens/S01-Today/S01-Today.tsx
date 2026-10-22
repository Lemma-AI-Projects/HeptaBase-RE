import { useEffect, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { PathBar } from '@/parts/C40-PathBar'
import { ProgressRing } from '@/parts/C47-ProgressRing'
import { MasteryBadge } from '@/parts/C41-MasteryBadge'
import { Button } from '@/parts/C60-Button'
import { CardNode } from '@/parts/C11-CardNode'
import { Divider } from '@/parts/C67-Divider'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS } from '@/lib/nav'
import { PATH, QUESTIONS, useRatings, useReview } from '@/lib/learning'
import s from './S01-Today.module.css'

const RECENT_BOARDS = [
  { id: 'b1', name: '间隔重复：为什么、怎么排、哪里可疑', meta: '32 卡 · 6 连线', cards: 3 },
  { id: 'b2', name: 'Bjork 2011 精读', meta: '18 卡 · 2 分区', cards: 2 },
]

const NEW_CARDS = QUESTIONS.slice(0, 3)

export function S01Today({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}): JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') navigate('/s06')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const queue = useReview()
  const ratings = useRatings()
  const solid = Object.values(ratings).filter((r) => r === 'solid').length

  return (
    <AppShell
      left={
        <AppRail
          apps={APPS}
          activeId="today"
          tags={TAGS}
          onAppSelected={(id) => {
            if (id === 'board') navigate('/s02')
            if (id === 'library') navigate('/s03')
            if (id === 'highlight') navigate('/s05')
          }}
        />
      }
      main={
        <>
          <AppTabs
            active="/s01"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen
            onToggleRight={() => undefined}
          />
          <div className={s.scroll}>
            <div className={s.inner}>
              <PathBar steps={PATH} current={2} onStepClicked={() => undefined} />

              <section className={s.block}>
                <h2 className={s.h2}>继续上次</h2>
                <div className={s.boards}>
                  {RECENT_BOARDS.map((b) => (
                    <button key={b.id} type="button" className={s.board} onClick={() => navigate('/s02')}>
                      <div className={s.preview} aria-hidden="true">
                        {Array.from({ length: b.cards }).map((_, i) => (
                          <span key={i} className={s.mini} style={{ left: 12 + i * 44, top: 14 + (i % 2) * 26 }} />
                        ))}
                      </div>
                      <span className={s.boardName}>{b.name}</span>
                      <span className={s.boardMeta}>{b.meta}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className={s.block}>
                <h2 className={s.h2}>今日新增</h2>
                <div className={s.cards}>
                  {NEW_CARDS.map((q) => (
                    <div key={q.id} className={s.cardCell}>
                      <CardNode
                        card={{ id: q.id, title: q.front, lines: [q.back.slice(0, 34) + '…'], color: 'yellow' }}
                        width={240}
                        height={116}
                        mastery={ratings[q.id] ?? 'none'}
                        onClick={() => navigate('/s03')}
                      />
                      <span className={s.cellMeta}>
                        <MasteryBadge level={ratings[q.id] ?? 'none'} />
                        <span>{q.tag}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={s.block}>
                <h2 className={s.h2}>本周进度</h2>
                <div className={s.week}>
                  <ProgressRing value={solid} total={QUESTIONS.length} />
                  <div className={s.weekText}>
                    <p className={s.weekMain}>已掌握 {solid} 张，还剩 {queue.length} 张要复习</p>
                    <p className={s.weekSub}>连续 4 天有复习；比上周多 6 张。</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span>今日复习</span>
            <span className={s.count}>{queue.length}</span>
          </div>
          <Divider />
          {queue.length === 0 ? (
            <div className={s.zero}>
              <p>今天没有要复习的。</p>
              <Button label="随便翻一张" onClick={() => navigate('/s03')} />
            </div>
          ) : (
            <div className={s.queue}>
              <p className={s.queueHint}>
                队列按「上次判定 + 间隔」排好，直接开始就行，不用选范围。
              </p>
              {queue.slice(0, 6).map((id) => {
                const q = QUESTIONS.find((x) => x.id === id)
                if (!q) return null
                return (
                  <div key={id} className={s.queueItem}>
                    <span className={s.queueTag}>#{q.tag}</span>
                    <span className={s.queueText}>{q.front}</span>
                  </div>
                )
              })}
              <Button label={`开始复习 · ${queue.length} 张`} variant="primary" onClick={() => navigate('/s06')} />
              <p className={s.queueKeys}>按 R 也能直接开始</p>
            </div>
          )}
        </div>
      }
    />
  )
}
