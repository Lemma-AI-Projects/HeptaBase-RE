import type { JSX } from 'react'
import { Icon } from '@/icons'
import { CARD_COLORS } from '@/tokens'
import s from './C22-SelectionHUD.module.css'

export function SelectionHUD({
  rect,
  count,
  onColor,
  onFold,
  onAi,
  onMore,
  onAlign,
  onDistribute,
}: {
  rect: { x: number; y: number; w: number; h: number }
  count: number
  onColor?: (c: string) => void
  onFold?: () => void
  onAi?: () => void
  onMore?: () => void
  onAlign?: (mode: string) => void
  onDistribute?: (axis: 'h' | 'v') => void
}): JSX.Element {
  const showAlign = count > 1
  const width = showAlign ? 404 : 264
  const left = Math.min(Math.max(8, rect.x + rect.w / 2 - width / 2), window.innerWidth - width - 8)
  const top = rect.y > 52 ? rect.y - 42 : rect.y + rect.h + 8

  return (
    <div className={s.bar} style={{ left, top, width }} onPointerDown={(e) => e.stopPropagation()}>
      <span className={s.count}>{count > 1 ? `${count} 个` : '已选中'}</span>
      <span className={s.sep} />
      {showAlign ? (
        <>
          <div className={s.alignGrid}>
            {(
              [
                ['alignLeft', 'left'],
                ['alignCenterH', 'centerH'],
                ['alignRight', 'right'],
                ['alignTop', 'top'],
                ['alignCenterV', 'centerV'],
                ['alignBottom', 'bottom'],
              ] as const
            ).map(([icon, mode]) => (
              <button
                key={mode}
                type="button"
                className={s.icon}
                aria-label={mode}
                title={mode}
                onClick={() => onAlign?.(mode)}
              >
                <Icon name={icon} size={13} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={s.icon}
            aria-label="水平等距"
            title="水平等距"
            onClick={() => onDistribute?.('h')}
          >
            <Icon name="distributeH" size={13} />
          </button>
          <button
            type="button"
            className={s.icon}
            aria-label="垂直等距"
            title="垂直等距"
            onClick={() => onDistribute?.('v')}
          >
            <Icon name="distributeV" size={13} />
          </button>
          <span className={s.sep} />
        </>
      ) : null}
      <div className={s.colors}>
        {CARD_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={s.dot}
            style={{ background: `var(--c-${c}-solid)` }}
            aria-label={c}
            onClick={() => onColor?.(c)}
          />
        ))}
      </div>
      <span className={s.sep} />
      <button type="button" className={s.icon} onClick={onFold} aria-label="折叠">
        <Icon name="minus" size={14} />
      </button>
      <button type="button" className={s.icon} onClick={onAi} aria-label="AI 动作">
        <Icon name="sparkles" size={14} />
      </button>
      <button type="button" className={s.icon} onClick={onMore} aria-label="更多">
        <Icon name="more" size={14} />
      </button>
    </div>
  )
}
