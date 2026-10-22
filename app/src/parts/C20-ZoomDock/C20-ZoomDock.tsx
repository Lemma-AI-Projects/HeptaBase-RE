import type { JSX } from 'react'
import { Icon } from '@/icons'
import s from './C20-ZoomDock.module.css'

export function ZoomDock({
  zoom,
  min = 0.1,
  max = 4,
  disabled = false,
  onZoomChanged,
  onFitRequested,
}: {
  zoom: number
  min?: number
  max?: number
  disabled?: boolean
  onZoomChanged?: (z: number) => void
  onFitRequested?: () => void
}): JSX.Element {
  const step = (dir: 1 | -1) => {
    const next = Math.min(max, Math.max(min, zoom * (dir > 0 ? 1.2 : 1 / 1.2)))
    onZoomChanged?.(Math.round(next * 100) / 100)
  }

  return (
    <div className={s.dock} data-disabled={disabled}>
      <button type="button" className={s.pct} disabled={disabled} onClick={() => onZoomChanged?.(1)} title="回到 100%">
        {Math.round(zoom * 100)}%
      </button>
      <span className={s.sep} />
      <button type="button" className={s.step} disabled={disabled} onClick={() => step(-1)} aria-label="缩小">
        <Icon name="minus" size={16} />
      </button>
      <button type="button" className={s.step} disabled={disabled} onClick={() => step(1)} aria-label="放大">
        <Icon name="plus" size={16} />
      </button>
      <span className={s.sep} />
      <button type="button" className={s.step} disabled={disabled} onClick={onFitRequested} aria-label="适配">
        <Icon name="fit" size={16} />
      </button>
    </div>
  )
}
