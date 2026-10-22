import { useEffect, useMemo, useState, type JSX } from 'react'
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
  setSelected as setSelectedIds,
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
  const [filters, setFilters] = useState<Record<string, string[]>>(() => {
    const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
    const tag = q.get('tag')
    return { 状态: [], 标签: tag ? [tag] : [] }
  })
  const [limit, setLimit] = useState(120)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!window.location.hash.includes('demo=batch')) return
    setSelectedIds(cards.slice(0, 5).map((c) => c.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
              1000 张卡是造出来的压力数据（40 块板 / 61 个标签）。筛选与批量操作都在这份数据上跑。
            </p>
          </div>
        </div>
      }
    />
  )
}
