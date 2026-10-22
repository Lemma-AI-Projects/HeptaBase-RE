# -*- coding: utf-8 -*-
import io, os

def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, 'w', encoding='utf-8').write(content)

# ---------------- S08 Library ----------------
w('src/screens/S08-Library/S08-Library.tsx', '''import { useMemo, useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { CardGrid, type ViewMode } from '@/parts/C50-CardGrid'
import { FilterBar, type FilterGroup } from '@/parts/C51-FilterBar'
import { Button } from '@/parts/C60-Button'
import { Divider } from '@/parts/C67-Divider'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS as NAV_TAGS } from '@/lib/nav'
import {
  TAGS,
  clearSelected,
  deleteSelected,
  getCards,
  getSelected,
  tagSelected,
  toggleSelected,
  undoLib,
  useLib,
} from '@/lib/library'
import s from './S08-Library.module.css'

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'grid', label: '网格' },
  { id: 'list', label: '列表' },
  { id: 'timeline', label: '时间线' },
]

export function S08Library({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}): JSX.Element {
  useLib()
  const cards = getCards()
  const selected = getSelected()
  const [view, setView] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<Record<string, string[]>>({ 状态: [], 标签: [] })
  const [limit, setLimit] = useState(120)
  const [toast, setToast] = useState<string | null>(null)

  const groups: FilterGroup[] = useMemo(() => {
    const statusCount = (v: string) => cards.filter((c) => c.status === v).length
    const tagCount = (v: string) => cards.filter((c) => c.tags.includes(v)).length
    return [
      {
        id: '状态',
        label: '状态',
        options: ['未开始', '在学', '已掌握'].map((v) => ({ value: v, count: statusCount(v) })),
      },
      {
        id: '标签',
        label: '标签',
        options: TAGS.slice(0, 10).map((v) => ({ value: v, count: tagCount(v) })),
      },
    ]
  }, [cards])

  const filtered = useMemo(() => {
    const st = filters['状态'] ?? []
    const tg = filters['标签'] ?? []
    return cards.filter(
      (c) => (st.length === 0 || st.includes(c.status)) && (tg.length === 0 || tg.some((t) => c.tags.includes(t)))
    )
  }, [cards, filters])

  const toggle = (g: string, v: string) =>
    setFilters((f) => {
      const cur = f[g] ?? []
      return { ...f, [g]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }
    })

  const batch = (kind: 'tag' | 'delete' | 'undo') => {
    if (kind === 'tag') {
      const n = tagSelected('待整理')
      setToast(`已给 ${n} 张加标签`)
    }
    if (kind === 'delete') {
      const n = deleteSelected()
      setToast(`已删除 ${n} 张 · ⌘Z 可撤销`)
    }
    if (kind === 'undo') {
      undoLib()
      setToast('已撤销')
    }
  }

  return (
    <AppShell
      left={
        <AppRail
          apps={APPS}
          activeId="library"
          tags={NAV_TAGS}
          onAppSelected={(id) => {
            if (id === 'board') navigate('/s02')
            if (id === 'today') navigate('/s01')
            if (id === 'tags') navigate('/s09')
            if (id === 'inbox') navigate('/s11')
          }}
        />
      }
      main={
        <>
          <AppTabs
            active="/s08"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={false}
            onToggleRight={() => undefined}
            extra={
              <div className={s.views}>
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={view === v.id ? s.viewOn : s.viewOff}
                    onClick={() => setView(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            }
          />
          <div className={s.scroll}>
            <div className={s.inner}>
              <FilterBar
                groups={groups}
                active={filters}
                resultCount={filtered.length}
                onToggle={toggle}
                onClear={() => setFilters({ 状态: [], 标签: [] })}
              />

              {selected.length > 0 ? (
                <div className={s.batchBar}>
                  <span className={s.batchCount}>已选 {selected.length}</span>
                  <Button label="加标签" size="sm" onClick={() => batch('tag')} />
                  <Button label="删除" variant="danger" size="sm" onClick={() => batch('delete')} />
                  <Button label="撤销" variant="ghost" size="sm" onClick={() => batch('undo')} />
                  <button type="button" className={s.clearSel} onClick={clearSelected}>
                    取消选择
                  </button>
                </div>
              ) : null}

              <CardGrid
                cards={filtered.slice(0, limit)}
                view={view}
                selected={selected}
                onToggle={toggleSelected}
                onOpen={() => navigate('/s03')}
              />

              {filtered.length > limit ? (
                <div className={s.more}>
                  <Button label={`显示更多（还有 ${filtered.length - limit} 张）`} onClick={() => setLimit((n) => n + 200)} />
                </div>
              ) : null}
            </div>
          </div>
          {toast ? <div className={s.toast}>{toast}</div> : null}
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>卡片库</div>
          <Divider />
          <div className={s.panelBody}>
            <div className={s.stat}><span>总数</span><span>{cards.length}</span></div>
            <div className={s.stat}><span>当前筛选</span><span>{filtered.length}</span></div>
            <div className={s.stat}><span>已选</span><span>{selected.length}</span></div>
            <Divider />
            <p className={s.note}>
              1000 张卡是造出来的压力数据（40 块板 / 20 个标签）。筛选与批量操作都在这份数据上跑。
            </p>
          </div>
        </div>
      }
    />
  )
}
''')
w('src/screens/S08-Library/S08-Library.module.css', '''.scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--sp-4) var(--sp-4) 96px;
  background: var(--c-canvas);
}

.inner {
  width: min(1040px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.views {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--r-2);
  background: var(--c-sunken);
}

.viewOn,
.viewOff {
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: var(--fs-11);
}

.viewOn {
  background: var(--c-panel);
  color: var(--c-text);
  box-shadow: var(--sh-1);
}

.viewOff {
  color: var(--c-text-2);
}

.batchBar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--r-2);
  background: var(--c-accent-weak);
}

.batchCount {
  font-size: var(--fs-12);
  color: var(--c-accent);
  margin-right: auto;
}

.clearSel {
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.more {
  display: flex;
  justify-content: center;
  padding: var(--sp-4) 0;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 76px;
  transform: translateX(-50%);
  z-index: 80;
  height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 var(--sp-3);
  border-radius: var(--r-full);
  background: var(--c-text);
  color: var(--c-panel);
  font-size: var(--fs-12);
}

.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panelHead {
  padding: var(--sp-3);
  font-size: var(--fs-13);
  font-weight: 500;
}

.panelBody {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-3);
}

.stat {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-12);
  color: var(--c-text-2);
  font-variant-numeric: tabular-nums;
}

.note {
  margin: 0;
  font-size: var(--fs-11);
  line-height: 1.7;
  color: var(--c-text-3);
}
''')

# ---------------- S09 Tags ----------------
w('src/screens/S09-Tags/S09-Tags.tsx', '''import { useState, type JSX } from 'react'
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
          onAppSelected={(id) => {
            if (id === 'board') navigate('/s02')
            if (id === 'library') navigate('/s08')
            if (id === 'today') navigate('/s01')
            if (id === 'inbox') navigate('/s11')
          }}
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
''')
w('src/screens/S09-Tags/S09-Tags.module.css', '''.scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--sp-4) var(--sp-4) 96px;
  background: var(--c-canvas);
}

.inner {
  width: min(1080px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.head h1 {
  margin: 0;
  font-size: var(--fs-18);
  line-height: var(--lh-18);
  font-weight: 600;
}

.head p {
  margin: 2px 0 0;
  font-size: var(--fs-12);
  color: var(--c-text-2);
}

.seg {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--r-2);
  background: var(--c-sunken);
}

.on,
.off {
  height: 22px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: var(--fs-11);
}

.on {
  background: var(--c-panel);
  color: var(--c-text);
  box-shadow: var(--sh-1);
}

.off {
  color: var(--c-text-2);
}

.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panelHead {
  padding: var(--sp-3);
  font-size: var(--fs-13);
  font-weight: 500;
}

.panelBody {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--sp-3);
}

.prop {
  font-size: var(--fs-12);
  color: var(--c-text-2);
  padding: 4px 0;
  border-bottom: 0.5px solid var(--c-line);
}

.note {
  margin: 0;
  font-size: var(--fs-11);
  line-height: 1.7;
  color: var(--c-text-3);
}
''')
print('ok')
