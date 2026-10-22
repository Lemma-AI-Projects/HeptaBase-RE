/**
 * tokens/index.ts · 与 styles/tokens.css 同名同值
 * 只导出"需要在 TS 里拼字符串"的部分；数值本身在 CSS 里。
 */

export const CARD_COLORS = [
  'green',
  'blue',
  'orange',
  'purple',
  'red',
  'yellow',
  'gray',
] as const

export type CardColor = (typeof CARD_COLORS)[number]

export const fillOf = (color: CardColor) => `var(--c-${color}-fill)`
export const solidOf = (color: CardColor) => `var(--c-${color}-solid)`

export const EASE = {
  out: 'var(--ease-out)',
  inout: 'var(--ease-inout)',
  snap: 'var(--ease-snap)',
} as const

export const DUR = {
  micro: 'var(--dur-1)',
  panel: 'var(--dur-2)',
  move: 'var(--dur-3)',
} as const

export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 4
