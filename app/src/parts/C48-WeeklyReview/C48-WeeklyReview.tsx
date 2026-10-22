import type { JSX } from 'react'
import s from './C48-WeeklyReview.module.css'

export type DayCount = { d: string; n: number; today?: boolean; future?: boolean }

export function WeeklyReview({
  days,
  lastWeek,
  lastAssessment,
  note,
}: {
  days: DayCount[]
  lastWeek: number
  /** 待评/待整理的卡数，0 时不显示这条 */
  lastAssessment?: number
  note?: string
}): JSX.Element {
  const total = days.reduce((a, b) => a + b.n, 0)
  const max = Math.max(1, ...days.map((d) => d.n))
  const gapDay = days.find((d) => d.n === 0 && !d.future)
  const delta = total - lastWeek
  const best = [...days].sort((a, b) => b.n - a.n)[0]

  return (
    <div className={s.wrap}>
      <div className={s.chart} role="img" aria-label={`本周 ${total} 张`}>
        {days.map((d, i) => (
          <div
            key={i}
            className={s.col}
            data-today={d.today ? 'true' : undefined}
            data-future={d.future ? 'true' : undefined}
          >
            <span className={s.n}>{d.n > 0 ? d.n : ''}</span>
            <span className={s.track}>
              {d.future ? (
                <span className={s.futureBar} />
              ) : d.n > 0 ? (
                <span
                  className={s.bar}
                  style={{ height: `${Math.max(8, (d.n / max) * 100)}%` }}
                  data-today={d.today ? 'true' : undefined}
                />
              ) : (
                <span className={s.void} />
              )}
            </span>
            <span className={s.d}>{d.d}</span>
          </div>
        ))}
      </div>

      <div className={s.side}>
        <p className={s.main}>
          本周 <b>{total}</b> 张，
          <span data-tone={delta >= 0 ? 'up' : 'down'}>
            {delta >= 0 ? `比上周多 ${delta}` : `比上周少 ${-delta}`}
          </span>
        </p>
        <p className={s.sub}>
          {gapDay ? `${gapDay.d}断了一天；` : ''}
          {best.n > 0 ? `最多的一天 ${best.n} 张。` : ''}
        </p>
        {lastAssessment && lastAssessment > 0 ? (
          <p className={s.advice}>还有 {lastAssessment} 张没评，先过一遍再开新板。</p>
        ) : null}
        {note ? <p className={s.note}>{note}</p> : null}
      </div>
    </div>
  )
}
