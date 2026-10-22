import type { JSX } from 'react'
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
