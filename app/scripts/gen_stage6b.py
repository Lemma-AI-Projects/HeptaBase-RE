# -*- coding: utf-8 -*-
import io, os

def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, 'w', encoding='utf-8').write(content)

b = 'src/parts'

# ---------------- C52 TagTable ----------------
w(b + '/C52-TagTable/C52-TagTable.tsx', '''import type { JSX } from 'react'
import { MasteryBadge } from '../C41-MasteryBadge/C41-MasteryBadge'
import type { LibCard, Status } from '@/lib/library'
import s from './C52-TagTable.module.css'

const STATUSES: Status[] = ['未开始', '在学', '已掌握']

export function TagTable({
  cards,
  onCell,
}: {
  cards: LibCard[]
  onCell: (id: string, patch: Partial<LibCard>) => void
}): JSX.Element {
  return (
    <div className={s.wrap}>
      <div className={s.head}>
        <span className={s.sticky}>标题</span>
        <span>状态</span>
        <span>掌握度</span>
        <span>标签</span>
        <span>来源</span>
        <span>更新</span>
      </div>
      {cards.map((c) => (
        <div key={c.id} className={s.row}>
          <span className={`${s.sticky} ${s.title}`}>{c.title}</span>
          <span>
            <select
              className={s.select}
              value={c.status}
              onChange={(e) => onCell(c.id, { status: e.target.value as Status })}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </span>
          <span>
            <button
              type="button"
              className={s.mastery}
              onClick={() =>
                onCell(c.id, {
                  mastery: c.mastery === 'none' ? 'fuzzy' : c.mastery === 'fuzzy' ? 'solid' : 'none',
                })
              }
            >
              <MasteryBadge level={c.mastery} />
            </button>
          </span>
          <span className={s.tags}>
            {c.tags.map((t) => (
              <span key={t} className={s.tag}>
                {t}
              </span>
            ))}
            <button
              type="button"
              className={s.addTag}
              onClick={() => onCell(c.id, { tags: [...c.tags, '待整理'] })}
            >
              +
            </button>
          </span>
          <span className={s.dim}>{c.source}</span>
          <span className={s.dim}>{c.updatedAt}</span>
        </div>
      ))}
    </div>
  )
}
''')
w(b + '/C52-TagTable/C52-TagTable.module.css', '''.wrap {
  border-radius: var(--r-1);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line);
  overflow: auto;
}

.head,
.row {
  display: grid;
  grid-template-columns: minmax(240px, 2fr) 96px 84px minmax(160px, 1.2fr) minmax(150px, 1fr) 84px;
  align-items: center;
  min-width: 900px;
  padding-right: var(--sp-3);
}

.head {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 32px;
  background: var(--c-panel);
  border-bottom: 0.5px solid var(--c-line);
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.row {
  height: 40px;
  border-bottom: 0.5px solid var(--c-line);
  font-size: var(--fs-12);
}

.row:hover {
  background: var(--c-sunken);
}

.row > span {
  padding: 0 var(--sp-2);
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.sticky {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--c-panel);
  padding-left: var(--sp-3) !important;
}

.row:hover .sticky {
  background: var(--c-sunken);
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select {
  height: 24px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  font-size: var(--fs-11);
  color: var(--c-text);
  outline: none;
}

.select:hover {
  border-color: var(--c-line-strong);
}

.mastery {
  padding: 2px 4px;
  border-radius: 4px;
}

.mastery:hover {
  background: var(--c-sunken);
}

.tags {
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  height: 18px;
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  border-radius: var(--r-full);
  background: var(--c-sunken);
  font-size: 10px;
  color: var(--c-text-2);
}

.addTag {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: var(--c-text-3);
  font-size: 11px;
}

.addTag:hover {
  background: var(--c-sunken);
}

.dim {
  color: var(--c-text-3);
  font-size: var(--fs-11);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
''')

# ---------------- C53 Kanban ----------------
w(b + '/C53-Kanban/C53-Kanban.tsx', '''import type { JSX } from 'react'
import type { LibCard, Status } from '@/lib/library'
import s from './C53-Kanban.module.css'

const COLS: Status[] = ['未开始', '在学', '已掌握']

export function Kanban({
  cards,
  onMove,
  onOpen,
}: {
  cards: LibCard[]
  onMove: (id: string, status: Status) => void
  onOpen: (id: string) => void
}): JSX.Element {
  return (
    <div className={s.board}>
      {COLS.map((col) => {
        const list = cards.filter((c) => c.status === col)
        return (
          <section key={col} className={s.col}>
            <header className={s.colHead}>
              <span>{col}</span>
              <span className={s.count}>{list.length}</span>
            </header>
            <div className={s.colBody}>
              {list.slice(0, 12).map((c) => (
                <article key={c.id} className={s.card} onClick={() => onOpen(c.id)}>
                  <span className={s.title}>{c.title}</span>
                  <div className={s.foot}>
                    <span className={s.tags}>{c.tags.map((t) => '#' + t).join(' ')}</span>
                    <button
                      type="button"
                      className={s.move}
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = COLS[(COLS.indexOf(col) + 1) % COLS.length]
                        onMove(c.id, next)
                      }}
                    >
                      →
                    </button>
                  </div>
                </article>
              ))}
              {list.length > 12 ? <div className={s.more}>还有 {list.length - 12} 张</div> : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
''')
w(b + '/C53-Kanban/C53-Kanban.module.css', '''.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-3);
}

.col {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-2);
  border-radius: var(--r-2);
  background: var(--c-sunken);
}

.colHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--sp-1);
  font-size: var(--fs-12);
  color: var(--c-text-2);
}

.count {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.colBody {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--sp-2);
  border-radius: var(--r-1);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line);
  cursor: pointer;
}

.card:hover {
  box-shadow: inset 0 0 0 1px var(--c-line-strong), var(--sh-1);
}

.title {
  font-size: var(--fs-12);
  color: var(--c-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.tags {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.move {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: var(--c-text-3);
  font-size: 11px;
}

.move:hover {
  background: var(--c-sunken);
  color: var(--c-accent);
}

.more {
  padding: 4px;
  font-size: var(--fs-11);
  color: var(--c-text-3);
  text-align: center;
}
''')
print('ok')
