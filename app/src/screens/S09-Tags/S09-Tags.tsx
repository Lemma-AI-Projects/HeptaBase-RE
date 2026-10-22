import { useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { TagTable } from '@/parts/C52-TagTable'
import { Kanban } from '@/parts/C53-Kanban'
import { Divider } from '@/parts/C67-Divider'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS as NAV_TAGS } from '@/lib/nav'
import { getCards, updateCard, useLib, type LibCard, type Status } from '@/lib/library'
import s from './S09-Tags.module.css'

export function S09Tags({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}): JSX.Element {
  useLib()
  const [mode, setMode] = useState<'table' | 'kanban'>('table')
  const cards = getCards().slice(0, 40)

  return (
    <AppShell
      left={
        <AppRail
          apps={APPS}
          activeId="tags"
          tags={NAV_TAGS}
        />
      }
      main={
        <>
          <AppTabs
            active="/s09"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={false}
            onToggleRight={() => undefined}
            extra={
              <div className={s.seg}>
                <button type="button" className={mode === 'table' ? s.on : s.off} onClick={() => setMode('table')}>
                  表格
                </button>
                <button type="button" className={mode === 'kanban' ? s.on : s.off} onClick={() => setMode('kanban')}>
                  看板
                </button>
              </div>
            }
          />
          <div className={s.scroll}>
            <div className={s.inner}>
              <header className={s.head}>
                <h1>标签数据库</h1>
                <p>6 种属性；首列冻结；单元格直接改，改完即生效。</p>
              </header>
              {mode === 'table' ? (
                <TagTable
                  cards={cards}
                  onCell={(id: string, patch: Partial<LibCard>) => updateCard(id, patch)}
                />
              ) : (
                <Kanban
                  cards={cards}
                  onMove={(id: string, status: Status) => updateCard(id, { status })}
                  onOpen={() => navigate('/s03')}
                />
              )}
            </div>
          </div>
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>属性</div>
          <Divider />
          <div className={s.panelBody}>
            {['标题（冻结）', '状态', '掌握度', '标签', '来源', '更新'].map((x) => (
              <div key={x} className={s.prop}>{x}</div>
            ))}
            <Divider />
            <p className={s.note}>只展示前 40 行；1000 行滚动会拖慢原型，Stage 7 再处理虚拟滚动。</p>
          </div>
        </div>
      }
    />
  )
}
