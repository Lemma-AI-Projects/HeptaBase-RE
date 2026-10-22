import { useState, type JSX } from 'react'
import { Icon } from '@/icons'
import s from './C40-PathBar.module.css'

export type PathStep = { id: string; title: string; done?: boolean; criteria: string[] }

export function PathBar({
  steps,
  current,
  onStepClicked,
}: {
  steps: PathStep[]
  current: number
  onStepClicked?: (i: number) => void
}): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div className={s.bar} data-collapsed={collapsed}>
      <button
        type="button"
        className={s.toggle}
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? '展开路径' : '折叠路径'}
      >
        <Icon name={collapsed ? 'chevronRight' : 'chevronDown'} size={14} />
      </button>

      {collapsed ? (
        <button type="button" className={s.collapsedLine} onClick={() => setCollapsed(false)}>
          第 {current + 1} / {steps.length} 阶 · {steps[current]?.title}
          <span className={s.miniBar}>
            <span style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
          </span>
        </button>
      ) : (
        <ol className={s.steps}>
          {steps.map((st, i) => (
            <li key={st.id} className={s.step}>
              <button
                type="button"
                className={`${s.node} ${i === current ? s.current : ''} ${st.done ? s.done : ''}`}
                onClick={() => onStepClicked?.(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className={s.dot}>{st.done ? <Icon name="check" size={10} /> : i + 1}</span>
                <span className={s.title}>{st.title}</span>
              </button>
              {i < steps.length - 1 ? <span className={s.link} /> : null}
              {hover === i ? (
                <span className={s.tip}>
                  {st.criteria.map((c) => (
                    <span key={c} className={s.crit}>
                      {c}
                    </span>
                  ))}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
