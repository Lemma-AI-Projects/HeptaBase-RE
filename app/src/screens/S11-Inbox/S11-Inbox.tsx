import { useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { InboxList, type InboxItem } from '@/parts/C56-InboxList'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS as NAV_TAGS } from '@/lib/nav'
import s from './S11-Inbox.module.css'

const ITEMS: InboxItem[] = [
  { id: 'i1', title: 'Why We Forget: the forgetting curve revisited', source: 'readwise.io', kind: '网页' },
  { id: 'i2', title: 'Bjork & Bjork 2011 · 第 3 页划线', source: 'Bjork & Bjork 2011.pdf', kind: 'PDF' },
  { id: 'i3', title: 'FSRS 参数拟合的三种做法', source: 'github.com/open-spaced-repetition', kind: '网页' },
  { id: 'i4', title: 'Anki 23.10 发布说明', source: 'apps.ankiweb.net', kind: '网页' },
  { id: 'i5', title: '间隔重复的对照组设计（截图）', source: 'Zhihu', kind: '图片' },
  { id: 'i6', title: 'Cepeda 2006 元分析摘要', source: 'PsycNET', kind: 'PDF' },
]

export function S11Inbox({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}): JSX.Element {
  const [items, setItems] = useState(ITEMS)
  const [selected, setSelected] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <AppShell
      left={
        <AppRail
          apps={APPS}
          activeId="inbox"
          tags={NAV_TAGS}
          onAppSelected={(id) => {
            if (id === 'today') navigate('/s01')
            if (id === 'board') navigate('/s02')
            if (id === 'library') navigate('/s08')
            if (id === 'tags') navigate('/s09')
          }}
        />
      }
      main={
        <>
          <AppTabs
            active="/s11"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={false}
            onToggleRight={() => undefined}
          />
          <div className={s.scroll}>
            <div className={s.inner}>
              <header className={s.head}>
                <h1>Inbox</h1>
                <p>先进来，再决定去哪。整理后从 Inbox 消失，不是删除。</p>
              </header>
              <InboxList
                items={items}
                selected={selected}
                onToggle={(id) =>
                  setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
                }
                onOrganize={(ids) => {
                  setItems((list) => list.filter((i) => !ids.includes(i.id)))
                  setSelected([])
                  flash(`已整理 ${ids.length} 条到白板`)
                }}
                onTag={(ids) => flash(`已给 ${ids.length} 条打标签 #待整理`)}
                onTodo={(ids) => flash(`已把 ${ids.length} 条转成待办`)}
              />
            </div>
          </div>
          {toast ? <div className={s.toast}>{toast}</div> : null}
        </>
      }
    />
  )
}
