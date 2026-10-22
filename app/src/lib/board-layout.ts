import type { CardColor } from '@/tokens'

export type Rect = { x: number; y: number; w: number; h: number }
export type Side = 't' | 'r' | 'b' | 'l'

export type CardData = {
  id: string
  title: string
  lines: string[]
  color: CardColor
  w?: number
  h: number
  folded?: boolean
}

export type SectionData = {
  id: string
  title: string
  color: CardColor
  x: number
  y: number
  w: number
  cards: CardData[]
}

export type EdgeData = {
  id: string
  from: string
  to: string
  shape: 'curve' | 'ortho'
  direction: 'one' | 'both'
  fromSide: Side
  toSide: Side
  label?: string
}

export type LaidCard = { data: CardData; rect: Rect; sectionId: string }
export type LaidSection = {
  data: SectionData
  rect: Rect
  cards: LaidCard[]
}

export const CARD_W = 240
export const WIDE_W = 528
export const GAP = 24
export const PAD = 16

/** 两列瀑布流，可复现（Plan/Stage2/03-S02内容.md §6） */
export function layoutBoard(sections: SectionData[]): {
  sections: LaidSection[]
  cards: Map<string, LaidCard>
} {
  const cards = new Map<string, LaidCard>()
  const out: LaidSection[] = []

  for (const section of sections) {
    const colX = [section.x + PAD, section.x + PAD + CARD_W + GAP]
    let cursorY = [section.y + PAD, section.y + PAD]
    const placed: LaidCard[] = []

    for (const card of section.cards) {
      let x: number
      let y: number
      if (card.w && card.w > CARD_W) {
        y = Math.max(cursorY[0], cursorY[1])
        x = section.x + PAD
        cursorY = [y + card.h + GAP, y + card.h + GAP]
      } else {
        const i = cursorY[0] <= cursorY[1] ? 0 : 1
        x = colX[i]
        y = cursorY[i]
        cursorY[i] = y + card.h + GAP
      }
      const laid: LaidCard = {
        data: card,
        rect: { x, y, w: card.w ?? CARD_W, h: card.h },
        sectionId: section.id,
      }
      placed.push(laid)
      cards.set(card.id, laid)
    }

    const height = Math.max(cursorY[0], cursorY[1]) - GAP + PAD - section.y
    out.push({
      data: section,
      rect: { x: section.x, y: section.y, w: section.w, h: height },
      cards: placed,
    })
  }

  return { sections: out, cards }
}

export function anchor(rect: Rect, side: Side): { x: number; y: number } {
  switch (side) {
    case 't':
      return { x: rect.x + rect.w / 2, y: rect.y - 4 }
    case 'b':
      return { x: rect.x + rect.w / 2, y: rect.y + rect.h + 4 }
    case 'l':
      return { x: rect.x - 4, y: rect.y + rect.h / 2 }
    default:
      return { x: rect.x + rect.w + 4, y: rect.y + rect.h / 2 }
  }
}

const normal = (side: Side) => {
  switch (side) {
    case 't':
      return { x: 0, y: -1 }
    case 'b':
      return { x: 0, y: 1 }
    case 'l':
      return { x: -1, y: 0 }
    default:
      return { x: 1, y: 0 }
  }
}

export function curveControls(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromSide: Side,
  toSide: Side
): { c1: { x: number; y: number }; c2: { x: number; y: number } } {
  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  const k = Math.max(40, dist * 0.4)
  const n1 = normal(fromSide)
  const n2 = normal(toSide)
  return {
    c1: { x: from.x + n1.x * k, y: from.y + n1.y * k },
    c2: { x: to.x + n2.x * k, y: to.y + n2.y * k },
  }
}

export function edgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromSide: Side,
  toSide: Side,
  shape: 'curve' | 'ortho'
): string {
  if (shape === 'ortho') {
    const mid = fromSide === 'l' || fromSide === 'r' ? (from.x + to.x) / 2 : (from.y + to.y) / 2
    const a = fromSide === 'l' || fromSide === 'r' ? `L ${mid} ${from.y}` : `L ${from.x} ${mid}`
    const b = toSide === 'l' || toSide === 'r' ? `L ${mid} ${to.y}` : `L ${to.x} ${mid}`
    return `M ${from.x} ${from.y} ${a} ${b} L ${to.x} ${to.y}`
  }
  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  const k = Math.max(40, dist * 0.4)
  const n1 = normal(fromSide)
  const n2 = normal(toSide)
  const c1 = { x: from.x + n1.x * k, y: from.y + n1.y * k }
  const c2 = { x: to.x + n2.x * k, y: to.y + n2.y * k }
  return `M ${from.x} ${from.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`
}

export function bezierMid(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromSide: Side,
  toSide: Side
): { x: number; y: number; angle: number } {
  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  const k = Math.max(40, dist * 0.4)
  const n1 = normal(fromSide)
  const n2 = normal(toSide)
  const c1 = { x: from.x + n1.x * k, y: from.y + n1.y * k }
  const c2 = { x: to.x + n2.x * k, y: to.y + n2.y * k }
  // t = 0.5 处的点与切线
  const p = {
    x: (from.x + 3 * c1.x + 3 * c2.x + to.x) / 8,
    y: (from.y + 3 * c1.y + 3 * c2.y + to.y) / 8,
  }
  const dx = 3 * (c2.x - c1.x) + 3 * (to.x - from.x)
  const dy = 3 * (c2.y - c1.y) + 3 * (to.y - from.y)
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI
  return { ...p, angle }
}
