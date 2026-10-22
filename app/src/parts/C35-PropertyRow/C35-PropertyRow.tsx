import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C35-PropertyRow.module.css'

export type PropertyType = '文本' | '数字' | '单选' | '多选' | '日期' | '复选'

export function PropertyRow({
  label,
  type,
  value,
  editable = false,
}: {
  label: string
  type: PropertyType
  value: string
  editable?: boolean
}): JSX.Element {
  return (
    <div className={s.row} data-type={type}>
      <span className={s.label}>{label}</span>
      <span className={s.value}>
        {type === '复选' ? (
          <span className={s.check} data-on={value === '是'}>
            {value === '是' ? <Icon name="check" size={12} /> : null}
          </span>
        ) : null}
        {type === '多选' ? (
          value.split('·').map((v) => (
            <span key={v} className={s.chip}>
              {v.trim()}
            </span>
          ))
        ) : type === '日期' ? (
          <>
            <Icon name="calendar" size={13} />
            <span>{value}</span>
          </>
        ) : (
          <span className={value ? undefined : s.empty}>{value || '空'}</span>
        )}
        {editable && type !== '复选' ? <span className={s.pencil}>✎</span> : null}
      </span>
      <span className={s.type}>{type}</span>
    </div>
  )
}
