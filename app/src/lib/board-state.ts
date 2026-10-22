import { useCallback, useMemo, useState } from 'react'
import { layoutBoard, type EdgeData, type Rect, type Side } from './board-layout'
import { EDGES, LOOSE_CARDS, MEDIA, NOTES, SECTIONS, BOARD } from '@/fixtures/board-spaced-repetition'
import type { CardColor } from '@/tokens'

export type Kind = 'card' | 'text' | 'media'

export type Obj = {
  id: string
  kind: Kind
  x: number
  y: number
  w: number
  h: number
  folded?: boolean
  color?: CardColor
  title?: string
  lines?: string[]
  text?: string
  media?: 'curves' | 'fsrs'
  caption?: string
  sectionId?: string
}

export type Sec = {
  id: string
  title: string
  color: CardColor
  x: number
  y: number
  w: number
  h: number
  collapsed?: boolean
}

export type Board = {
  objs: Obj[]
  sections: Sec[]
  edges: EdgeData[]
}

export type Guide = { axis: 'x' | 'y'; pos: number; from: number; to: number }

const SNAP = 6

export function initBoard(stress = false): Board {
  const laid = layoutBoard(SECTIONS)
  const objs: Obj[] = []

  for (const sec of laid.sections) {
    for (const c of sec.cards) {
      objs.push({
        id: c.data.id,
        kind: 'card',
        x: c.rect.x,
        y: c.rect.y,
        w: c.rect.w,
        h: c.rect.h,
        folded: c.data.folded,
        color: c.data.color,
        title: c.data.title,
        lines: c.data.lines,
        sectionId: sec.data.id,
      })
    }
  }

  for (const l of LOOSE_CARDS) {
    objs.push({
      id: l.id,
      kind: 'card',
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
      color: l.color,
      title: l.title,
      lines: l.lines,
    })
  }

  objs.push({
    id: 'T1',
    kind: 'text',
    x: 60,
    y: 96,
    w: 720,
    h: 34,
    text: BOARD.title,
  })
  objs.push({
    id: 'T2',
    kind: 'text',
    x: 60,
    y: 136,
    w: 720,
    h: 22,
    text: BOARD.subtitle,
  })
  for (const n of NOTES) {
    objs.push({ id: n.id, kind: 'text', x: n.x, y: n.y, w: n.w, h: 22, text: n.text })
  }
  for (const m of MEDIA) {
    objs.push({
      id: m.id,
      kind: 'media',
      x: m.x,
      y: m.y,
      w: m.w,
      h: m.h,
      media: m.kind,
      caption: m.caption,
    })
  }

  const sections: Sec[] = laid.sections.map((s) => ({
    id: s.data.id,
    title: s.data.title,
    color: s.data.color,
    x: s.rect.x,
    y: s.rect.y,
    w: s.rect.w,
    h: s.rect.h,
  }))

  let board: Board = { objs, sections, edges: EDGES.map((e) => ({ ...e })) }

  if (stress) {
    // 压力板：150 张卡铺成 12 列的密板，专看拖拽与缩放
    const cols = 12
    const grid: Obj[] = []
    for (let i = 0; i < 150; i++) {
      const src = objs[i % objs.length]
      grid.push({
        id: `S${i + 1}`,
        kind: 'card',
        x: 60 + (i % cols) * 300,
        y: 120 + Math.floor(i / cols) * 190,
        w: 240,
        h: 140,
        color: src.color ?? 'gray',
        title: src.title ?? '卡片',
        lines: (src.lines ?? []).slice(0, 2),
      })
    }
    return { objs: grid, sections: [], edges: [] }
  }

  return board
}

const clone = (b: Board): Board => ({
  objs: b.objs.map((o) => ({ ...o })),
  sections: b.sections.map((s) => ({ ...s })),
  edges: b.edges.map((e) => ({ ...e })),
})

export function boundsOf(b: Board) {
  let maxX = 0
  let maxY = 0
  for (const o of b.objs) {
    maxX = Math.max(maxX, o.x + o.w)
    maxY = Math.max(maxY, o.y + o.h)
  }
  for (const s of b.sections) {
    maxX = Math.max(maxX, s.x + s.w)
    maxY = Math.max(maxY, s.y + s.h)
  }
  return { minX: 0, minY: 0, maxX, maxY }
}

/** 同轴吸附：6px 阈值，一次到位 */
export function snapMove(
  board: Board,
  movedIds: string[],
  dx: number,
  dy: number,
  zoom: number
): { dx: number; dy: number; guides: Guide[] } {
  const moved = board.objs.filter((o) => movedIds.includes(o.id))
  const movedSecs = board.sections.filter((s) => movedIds.includes(s.id))
  if (moved.length === 0 && movedSecs.length === 0) return { dx, dy, guides: [] }

  const boxes: Rect[] = [
    ...moved.map((o) => ({ x: o.x + dx, y: o.y + dy, w: o.w, h: o.h })),
    ...movedSecs.map((s) => ({ x: s.x + dx, y: s.y + dy, w: s.w, h: s.h })),
  ]
  const box = {
    l: Math.min(...boxes.map((b) => b.x)),
    t: Math.min(...boxes.map((b) => b.y)),
    r: Math.max(...boxes.map((b) => b.x + b.w)),
    b: Math.max(...boxes.map((b) => b.y + b.h)),
  }

  const others: Rect[] = [
    ...board.objs.filter((o) => !movedIds.includes(o.id)).map((o) => ({ x: o.x, y: o.y, w: o.w, h: o.h })),
    ...board.sections.filter((s) => !movedIds.includes(s.id)).map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h })),
  ]

  const th = SNAP / zoom
  let bestX: { d: number; pos: number } | null = null
  let bestY: { d: number; pos: number } | null = null

  const xTargets = [box.l, (box.l + box.r) / 2, box.r]
  const yTargets = [box.t, (box.t + box.b) / 2, box.b]

  for (const r of others) {
    for (const tx of [r.x, r.x + r.w / 2, r.x + r.w]) {
      for (const m of xTargets) {
        const d = tx - m
        if (Math.abs(d) <= th && (!bestX || Math.abs(d) < Math.abs(bestX.d))) {
          bestX = { d, pos: tx }
        }
      }
    }
    for (const ty of [r.y, r.y + r.h / 2, r.y + r.h]) {
      for (const m of yTargets) {
        const d = ty - m
        if (Math.abs(d) <= th && (!bestY || Math.abs(d) < Math.abs(bestY.d))) {
          bestY = { d, pos: ty }
        }
      }
    }
  }

  const guides: Guide[] = []
  const outX = bestX?.d ?? 0
  const outY = bestY?.d ?? 0
  if (bestX) {
    const near = others.filter((r) => Math.abs(r.x - bestX!.pos) < 1 || Math.abs(r.x + r.w - bestX!.pos) < 1 || Math.abs(r.x + r.w / 2 - bestX!.pos) < 1)
    guides.push({
      axis: 'x',
      pos: bestX.pos,
      from: Math.min(box.t + outY, ...near.map((r) => r.y)),
      to: Math.max(box.b + outY, ...near.map((r) => r.y + r.h)),
    })
  }
  if (bestY) {
    const near = others.filter((r) => Math.abs(r.y - bestY!.pos) < 1 || Math.abs(r.y + r.h - bestY!.pos) < 1 || Math.abs(r.y + r.h / 2 - bestY!.pos) < 1)
    guides.push({
      axis: 'y',
      pos: bestY.pos,
      from: Math.min(box.l + outX, ...near.map((r) => r.x)),
      to: Math.max(box.r + outX, ...near.map((r) => r.x + r.w)),
    })
  }

  return { dx: dx + outX, dy: dy + outY, guides }
}

export function useBoard(initial: Board) {
  const [board, setBoard] = useState<Board>(initial)
  const [past, setPast] = useState<Board[]>([])
  const [future, setFuture] = useState<Board[]>([])

  const run = useCallback(
    (fn: (b: Board) => Board, record = true) => {
      setBoard((cur) => {
        if (record) setPast((p) => [...p.slice(-49), clone(cur)])
        setFuture([])
        return fn(clone(cur))
      })
    },
    []
  )

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p
      setBoard((cur) => {
        setFuture((f) => [clone(cur), ...f].slice(0, 50))
        return p[p.length - 1]
      })
      return p.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      setBoard((cur) => {
        setPast((p) => [...p.slice(-49), clone(cur)])
        return f[0]
      })
      return f.slice(1)
    })
  }, [])

  return useMemo(
    () => ({ board, run, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 }),
    [board, run, undo, redo, past.length, future.length]
  )
}

export function anchorOf(o: Obj | Sec, side: Side) {
  switch (side) {
    case 't':
      return { x: o.x + o.w / 2, y: o.y - 4 }
    case 'b':
      return { x: o.x + o.w / 2, y: o.y + o.h + 4 }
    case 'l':
      return { x: o.x - 4, y: o.y + o.h / 2 }
    default:
      return { x: o.x + o.w + 4, y: o.y + o.h / 2 }
  }
}
