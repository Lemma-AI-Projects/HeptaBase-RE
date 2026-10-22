import type { JSX } from 'react'
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
              <span className={s.masteryText}>
                {c.mastery === 'solid' ? '掌握' : c.mastery === 'fuzzy' ? '模糊' : '未评'}
              </span>
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
