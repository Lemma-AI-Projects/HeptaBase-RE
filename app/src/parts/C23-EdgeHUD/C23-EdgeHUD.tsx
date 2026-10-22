import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C23-EdgeHUD.module.css'

export function EdgeHUD({
  x,
  y,
  shape,
  direction,
  label,
  onShape,
  onDirection,
  onLabel,
  onDelete,
}: {
  x: number
  y: number
  shape: 'curve' | 'ortho'
  direction: 'one' | 'both'
  label?: string
  onShape: (v: 'curve' | 'ortho') => void
  onDirection: (v: 'one' | 'both') => void
  onLabel: (v: string) => void
  onDelete: () => void
}): JSX.Element {
  const width = 372
  const left = Math.min(Math.max(8, x - width / 2), window.innerWidth - width - 8)
  const top = Math.max(8, y - 46)

  return (
    <div className={s.bar} style={{ left, top, width }} onPointerDown={(e) => e.stopPropagation()}>
      <div className={s.seg}>
        <button type="button" className={shape === 'curve' ? s.on : s.off} onClick={() => onShape('curve')}>
          曲线
        </button>
        <button type="button" className={shape === 'ortho' ? s.on : s.off} onClick={() => onShape('ortho')}>
          直角
        </button>
      </div>
      <span className={s.sep} />
      <div className={s.seg}>
        <button type="button" className={direction === 'one' ? s.on : s.off} onClick={() => onDirection('one')}>
          →
        </button>
        <button type="button" className={direction === 'both' ? s.on : s.off} onClick={() => onDirection('both')}>
          ↔
        </button>
      </div>
      <span className={s.sep} />
      <input
        className={s.input}
        value={label ?? ''}
        placeholder="连线标签"
        onChange={(e) => onLabel(e.target.value)}
      />
      <button type="button" className={s.del} onClick={onDelete} aria-label="删除连线">
        <Icon name="close" size={14} />
      </button>
    </div>
  )
}
