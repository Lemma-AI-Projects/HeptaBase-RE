# -*- coding: utf-8 -*-
import io, os

def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, 'w', encoding='utf-8').write(content)

b = 'src/parts'

# ---------------- C54 WeekStrip ----------------
w(b + '/C54-WeekStrip/C54-WeekStrip.tsx', '''import type { JSX } from 'react'
import s from './C54-WeekStrip.module.css'

export type Day = { date: string; label: string; day: number; today?: boolean; hasNote?: boolean }

export function WeekStrip({
  days,
  active,
  onSelect,
}: {
  days: Day[]
  active: string
  onSelect: (date: string) => void
}): JSX.Element {
  return (
    <div className={s.strip}>
      {days.map((d) => (
        <button
          key={d.date}
          type="button"
          className={active === d.date ? s.dayOn : s.day}
          data-today={d.today}
          onClick={() => onSelect(d.date)}
        >
          <span className={s.label}>{d.label}</span>
          <span className={s.num}>{d.day}</span>
          <span className={s.dot} data-on={!!d.hasNote} />
        </button>
      ))}
    </div>
  )
}
''')
w(b + '/C54-WeekStrip/C54-WeekStrip.module.css', '''.strip {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 4px;
  border-radius: var(--r-2);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line);
}

.day,
.dayOn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0 4px;
  border-radius: var(--r-1);
  color: var(--c-text-2);
}

.day:hover {
  background: var(--c-sunken);
}

.dayOn {
  background: var(--c-accent-weak);
}

.label {
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.num {
  font-size: var(--fs-14);
  font-variant-numeric: tabular-nums;
  color: var(--c-text);
}

.dayOn .num {
  color: var(--c-accent);
  font-weight: 600;
}

.dot {
  width: 3px;
  height: 3px;
  border-radius: var(--r-full);
}

.dot[data-on='true'] {
  background: var(--c-text-3);
}

.dayOn .dot[data-on='true'] {
  background: var(--c-accent);
}
''')

# ---------------- C55 TodoBlock ----------------
w(b + '/C55-TodoBlock/C55-TodoBlock.tsx', '''import type { JSX } from 'react'
import s from './C55-TodoBlock.module.css'

export type Todo = { id: string; text: string; done: boolean; carried?: boolean }

export function TodoBlock({
  todos,
  onToggle,
}: {
  todos: Todo[]
  onToggle: (id: string) => void
}): JSX.Element {
  const left = todos.filter((t) => !t.done).length
  return (
    <div className={s.wrap}>
      <header className={s.head}>
        <span>今日待办</span>
        <span className={s.count}>{left} 项未完成</span>
      </header>
      <ul className={s.list}>
        {todos.map((t) => (
          <li key={t.id} className={s.item} data-done={t.done}>
            <button
              type="button"
              className={s.box}
              aria-label={t.done ? '取消完成' : '标记完成'}
              onClick={() => onToggle(t.id)}
            >
              {t.done ? '✓' : ''}
            </button>
            <span className={s.text}>{t.text}</span>
            {t.carried ? <span className={s.badge}>昨日未完成</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
''')
w(b + '/C55-TodoBlock/C55-TodoBlock.module.css', '''.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-3);
  border-radius: var(--r-2);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fs-12);
  color: var(--c-text);
}

.count {
  font-size: var(--fs-11);
  color: var(--c-text-3);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 30px;
  font-size: var(--fs-13);
}

.item[data-done='true'] .text {
  color: var(--c-text-3);
  text-decoration: line-through;
}

.box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--c-line-strong);
  font-size: 9px;
  color: var(--c-accent);
  flex: none;
}

.text {
  flex: 1;
  color: var(--c-text);
}

.badge {
  padding: 1px 6px;
  border-radius: var(--r-full);
  background: var(--c-sunken);
  font-size: 10px;
  color: var(--c-text-3);
}
''')

# ---------------- C56 InboxList ----------------
w(b + '/C56-InboxList/C56-InboxList.tsx', '''import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C56-InboxList.module.css'

export type InboxItem = { id: string; title: string; source: string; kind: '网页' | 'PDF' | '图片' }

export function InboxList({
  items,
  selected,
  onToggle,
  onOrganize,
  onTag,
  onTodo,
}: {
  items: InboxItem[]
  selected: string[]
  onToggle: (id: string) => void
  onOrganize: (ids: string[]) => void
  onTag: (ids: string[]) => void
  onTodo: (ids: string[]) => void
}): JSX.Element {
  const ids = selected.length > 0 ? selected : items.map((i) => i.id)
  return (
    <div className={s.wrap}>
      <div className={s.actions}>
        <span className={s.count}>{selected.length > 0 ? `选中 ${selected.length}` : `${items.length} 条待整理`}</span>
        <button type="button" className={s.btn} onClick={() => onOrganize(ids)}>
          <Icon name="board" size={14} /> 整理到板
        </button>
        <button type="button" className={s.btn} onClick={() => onTag(ids)}>
          <Icon name="tag" size={14} /> 打标签
        </button>
        <button type="button" className={s.btn} onClick={() => onTodo(ids)}>
          <Icon name="todo" size={14} /> 转待办
        </button>
      </div>
      <ul className={s.list}>
        {items.map((it) => (
          <li key={it.id} className={s.item} data-selected={selected.includes(it.id)}>
            <button type="button" className={s.check} data-on={selected.includes(it.id)} onClick={() => onToggle(it.id)}>
              {selected.includes(it.id) ? '✓' : ''}
            </button>
            <span className={s.kind}>{it.kind}</span>
            <span className={s.title}>{it.title}</span>
            <span className={s.source}>{it.source}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
''')
w(b + '/C56-InboxList/C56-InboxList.module.css', '''.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.count {
  font-size: var(--fs-11);
  color: var(--c-text-3);
  margin-right: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 var(--sp-2);
  border-radius: var(--r-2);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line-strong);
  font-size: var(--fs-12);
  color: var(--c-text-2);
}

.btn:hover {
  background: var(--c-sunken);
  color: var(--c-text);
}

.list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--r-1);
  background: var(--c-panel);
  box-shadow: inset 0 0 0 1px var(--c-line);
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: 44px;
  padding: 0 var(--sp-3);
  border-bottom: 0.5px solid var(--c-line);
  font-size: var(--fs-13);
}

.item:last-child {
  border-bottom: 0;
}

.item:hover {
  background: var(--c-sunken);
}

.item[data-selected='true'] {
  background: var(--c-accent-weak);
}

.check {
  width: 15px;
  height: 15px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px var(--c-line-strong);
  font-size: 9px;
  color: #fff;
  flex: none;
}

.check[data-on='true'] {
  background: var(--c-accent);
  box-shadow: inset 0 0 0 1px var(--c-accent);
}

.kind {
  flex: none;
  padding: 1px 6px;
  border-radius: var(--r-full);
  background: var(--c-sunken);
  font-size: 10px;
  color: var(--c-text-3);
}

.title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--c-text);
}

.source {
  font-size: var(--fs-11);
  color: var(--c-text-3);
}
''')
print('ok')
