import { useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { WeekStrip, type Day } from '@/parts/C54-WeekStrip'
import { TodoBlock, type Todo } from '@/parts/C55-TodoBlock'
import { Divider } from '@/parts/C67-Divider'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS as NAV_TAGS } from '@/lib/nav'
import s from './S10-Journal.module.css'

const DAYS: Day[] = [
  { date: '2026-10-19', label: '一', day: 19, hasNote: true },
  { date: '2026-10-20', label: '二', day: 20, hasNote: true },
  { date: '2026-10-21', label: '三', day: 21, hasNote: true },
  { date: '2026-10-22', label: '四', day: 22, today: true, hasNote: true },
  { date: '2026-10-23', label: '五', day: 23 },
  { date: '2026-10-24', label: '六', day: 24 },
  { date: '2026-10-25', label: '日', day: 25 },
]

const START_TODOS: Todo[] = [
  { id: 't1', text: '把 A 区的标题卡改成问题卡', done: false, carried: true },
  { id: 't2', text: '补三条「不看原文能答吗」检查', done: false, carried: true },
  { id: 't3', text: '读完 Bjork 2011 第 3 页', done: true },
  { id: 't4', text: '整理 Inbox 里的 8 条剪藏', done: false },
]

export function S10Journal({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}): JSX.Element {
  const [active, setActive] = useState('2026-10-22')
  const [todos, setTodos] = useState(START_TODOS)

  return (
    <AppShell
      left={
        <AppRail
          apps={APPS}
          activeId="today"
          tags={NAV_TAGS}
          onAppSelected={(id) => {
            if (id === 'today') navigate('/s01')
            if (id === 'board') navigate('/s02')
            if (id === 'library') navigate('/s08')
          }}
        />
      }
      main={
        <>
          <AppTabs
            active="/s10"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={false}
            onToggleRight={() => undefined}
          />
          <div className={s.scroll}>
            <div className={s.inner}>
              <WeekStrip days={DAYS} active={active} onSelect={setActive} />

              <header className={s.dayHead}>
                <h1>10 月 22 日 · 周四</h1>
                <span className={s.dayMeta}>4 条待办 · 2 条来自昨天</span>
              </header>

              <TodoBlock
                todos={todos}
                onToggle={(id) =>
                  setTodos((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
                }
              />

              <section className={s.notes}>
                <h2 className={s.h2}>今天的记录</h2>
                <p className={s.note}>
                  把「间隔效应」和「合意困难」合成了一张卡：两者都在讲同一件事——让提取变难一点，长期才留得住。
                </p>
                <p className={s.note}>
                  发现 FSRS 的稳定度 S 和 SM-2 的 EF 不是一回事：S 有单位（天），EF 只是个倍数。这张卡要重写。
                </p>
                <p className={s.mutedNote}>昨天写了一半的两条已带到今天，未完成。</p>
              </section>
            </div>
          </div>
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>本周</div>
          <Divider />
          <div className={s.panelBody}>
            <div className={s.stat}><span>新增卡片</span><span>26</span></div>
            <div className={s.stat}><span>完成复习</span><span>41</span></div>
            <div className={s.stat}><span>连续天数</span><span>4</span></div>
          </div>
        </div>
      }
    />
  )
}
