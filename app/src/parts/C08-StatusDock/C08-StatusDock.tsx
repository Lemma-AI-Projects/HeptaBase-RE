import type { JSX } from 'react'
import s from './C08-StatusDock.module.css'

export function StatusDock({
  zoom,
  selectionCount,
  unsaved = false,
  readonly = false,
  onZoomRequested,
}: {
  zoom: number
  selectionCount: number
  unsaved?: boolean
  readonly?: boolean
  onZoomRequested?: (z: number) => void
}): JSX.Element {
  return (
    <div className={s.dock}>
      <button
        type="button"
        className={s.zoom}
        onClick={() => onZoomRequested?.(zoom >= 1 ? 0.6 : 1)}
        title="切换 60% / 100%"
      >
        {Math.round(zoom * 100)}%
      </button>
      <span className={s.dot} />
      <span>{selectionCount > 0 ? `已选 ${selectionCount}` : '未选中'}</span>
      <span className={s.dot} />
      <span>{readonly ? '只读' : '编辑'}</span>
      {unsaved ? (
        <>
          <span className={s.dot} />
          <span className={s.warn}>未保存</span>
        </>
      ) : null}
    </div>
  )
}
