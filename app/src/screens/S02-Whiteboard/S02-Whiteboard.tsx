import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { CanvasViewport, type Viewport } from '@/parts/C10-CanvasViewport'
import { CardNode } from '@/parts/C11-CardNode'
import { SectionBox } from '@/parts/C12-SectionBox'
import { Breadcrumb } from '@/parts/C07-Breadcrumb'
import { TextNode } from '@/parts/C13-TextNode'
import { MediaNode } from '@/parts/C14-MediaNode'
import { Edge } from '@/parts/C15-Edge'
import { Marquee } from '@/parts/C16-Marquee'
import { SnapGuides } from '@/parts/C17-SnapGuide'
import { Minimap } from '@/parts/C18-Minimap'
import { ContextMenu, type MenuItem } from '@/parts/C21-ContextMenu'
import { SelectionHUD } from '@/parts/C22-SelectionHUD'
import { EdgeHUD } from '@/parts/C23-EdgeHUD'
import { AiChatPanel, type ChatMessage } from '@/parts/C44-AiChatPanel'
import { AI_SCRIPT, addQuestion } from '@/lib/learning'
import { addExcerptCard } from '@/lib/store'
import { CanvasToolbar, type ToolId } from '@/parts/C19-CanvasToolbar'
import { ZoomDock } from '@/parts/C20-ZoomDock'
import { StatusDock } from '@/parts/C08-StatusDock'
import { IconButton } from '@/parts/C61-IconButton'
import { Divider } from '@/parts/C67-Divider'
import { AppTabs } from '../AppTabs'
import { BOARD } from '@/fixtures/board-spaced-repetition'
import { CurvesSvg, FsrsSvg } from '@/fixtures/assets/CurvesSvg'
import { anchorOf, boundsOf, initBoard, snapMove, useBoard, type Guide, type Obj } from '@/lib/board-state'
import { bezierMid, edgePath, type Side } from '@/lib/board-layout'
import { APPS, TAGS } from '@/lib/nav'
import { saveViewport, loadViewport } from '@/lib/store'
import { navigate } from '@/lib/hash-route'
import type { CardColor } from '@/tokens'
import s from './S02-Whiteboard.module.css'

type Interaction =
  | { type: 'drag'; ids: string[]; sx: number; sy: number; dx: number; dy: number; moved: boolean }
  | { type: 'marquee'; sx: number; sy: number; ex: number; ey: number; base: string[]; mode: 'replace' | 'add' | 'sub' }
  | null

export function S02Whiteboard({
  theme,
  onToggleTheme,
  initialZoom,
  autoFit,
  stress = false,
  demo,
  sub,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  initialZoom?: number
  autoFit?: boolean
  stress?: boolean
  demo?: string
  sub?: string
}): JSX.Element {
  const stageRef = useRef<HTMLDivElement>(null)
  const { board, run, undo, redo } = useBoard(useMemo(() => initBoard(stress), [stress]))
  const [viewport, setViewport] = useState<Viewport>(
    loadViewport() ?? { ...BOARD.initialViewport, zoom: initialZoom ?? BOARD.initialViewport.zoom }
  )
  const [tool, setTool] = useState<ToolId>('select')
  const [selected, setSelected] = useState<string[]>([])
  const [interaction, setInteraction] = useState<Interaction>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [menu, setMenu] = useState<{ x: number; y: number; target: 'blank' | 'object' } | null>(null)
  const [rightOpen, setRightOpen] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [edgeDrag, setEdgeDrag] = useState<{ id: string; which: 'from' | 'to'; x: number; y: number } | null>(null)
  const [link, setLink] = useState<{
    from: string
    side: Side
    x: number
    y: number
    to: string | null
    toSide: Side
  } | null>(null)
  const linkRef = useRef<typeof link>(null)
  linkRef.current = link
  const linkStart = useRef({ x: 0, y: 0 })
  const [bendDrag, setBendDrag] = useState<{ id: string; bend: { x: number; y: number } } | null>(null)
  const [resize, setResize] = useState<{ id: string; w: number; h: number; x: number; y: number } | null>(null)
  const [editing, setEditing] = useState<{ id: string; title: string; body: string } | null>(null)
  const editingRef = useRef(editing)
  editingRef.current = editing
  const resizeRef = useRef<{
    id: string
    dir: string
    x: number
    y: number
    w: number
    h: number
    ox: number
    oy: number
  } | null>(null)
  const resizeCur = useRef<typeof resize>(null)
  resizeCur.current = resize
  const bendRef = useRef<typeof bendDrag>(null)
  bendRef.current = bendDrag
  const zoomRef = useRef(viewport.zoom)
  zoomRef.current = viewport.zoom

  const elsRef = useRef<HTMLElement[]>([])
  const dragDelta = useRef({ dx: 0, dy: 0, moved: false })
  const dragInfo = useRef<{ ids: string[]; sx: number; sy: number } | null>(null)
  const panComp = useRef({ x: 0, y: 0 })
  const pointerPos = useRef({ x: 0, y: 0 })
  const panRaf = useRef(0)
  const vpRefS02 = useRef(viewport)
  vpRefS02.current = viewport
  const liveGuidesRef = useRef<SVGGElement>(null)

  const commitEditing = () => {
    const cur = editingRef.current
    if (!cur) return
    setEditing(null)
    run((b) => {
      const o = b.objs.find((x) => x.id === cur.id)
      if (o) {
        o.title = cur.title
        o.lines = cur.body
          .split(String.fromCharCode(10))
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return b
    })
  }

  const alignSelected = (mode: string) => {
    run((bd) => {
      const items = [...bd.objs, ...bd.sections].filter((o) => selected.includes(o.id))
      if (items.length < 2) return bd
      const l = Math.min(...items.map((o) => o.x))
      const tp = Math.min(...items.map((o) => o.y))
      const r = Math.max(...items.map((o) => o.x + o.w))
      const bm = Math.max(...items.map((o) => o.y + o.h))
      for (const o of items) {
        if (mode === 'left') o.x = l
        else if (mode === 'centerH') o.x = Math.round((l + r) / 2 - o.w / 2)
        else if (mode === 'right') o.x = r - o.w
        else if (mode === 'top') o.y = tp
        else if (mode === 'centerV') o.y = Math.round((tp + bm) / 2 - o.h / 2)
        else if (mode === 'bottom') o.y = bm - o.h
      }
      return bd
    })
  }

  const distributeSelected = (axis: 'h' | 'v') => {
    run((bd) => {
      const items = [...bd.objs, ...bd.sections].filter((o) => selected.includes(o.id))
      if (items.length < 3) return bd
      const size = (o: { w: number; h: number }) => (axis === 'h' ? o.w : o.h)
      const sorted = [...items].sort((p, q) => (axis === 'h' ? p.x - q.x : p.y - q.y))
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const span = axis === 'h' ? last.x + last.w - first.x : last.y + last.h - first.y
      const sum = sorted.reduce((a, o) => a + size(o), 0)
      const gap = (span - sum) / (sorted.length - 1)
      // 空间不足（卡片比跨度还宽）时不动，避免越点越乱
      if (gap < 8) return bd
      let cur = axis === 'h' ? first.x : first.y
      for (const o of sorted) {
        if (axis === 'h') o.x = Math.round(cur)
        else o.y = Math.round(cur)
        cur += size(o) + gap
      }
      return bd
    })
  }

  const startResize = (e: React.PointerEvent, id: string, dir: string) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    const o = board.objs.find((x) => x.id === id)
    if (!o) return
    resizeRef.current = { id, dir, x: e.clientX, y: e.clientY, w: o.w, h: o.h, ox: o.x, oy: o.y }
    setResize({ id, w: o.w, h: o.h, x: o.x, y: o.y })
  }

  useEffect(() => {
    if (!resize) return
    const onMove = (e: PointerEvent) => {
      const r = resizeRef.current
      if (!r) return
      const z = zoomRef.current
      const dx = (e.clientX - r.x) / z
      const dy = (e.clientY - r.y) / z
      let w = r.w
      let h = r.h
      let ox = r.ox
      let oy = r.oy
      if (r.dir.includes('e')) w = r.w + dx
      if (r.dir.includes('s')) h = r.h + dy
      if (r.dir.includes('w')) {
        w = r.w - dx
        ox = r.ox + dx
      }
      if (r.dir.includes('n')) {
        h = r.h - dy
        oy = r.oy + dy
      }
      w = Math.max(120, Math.round(w))
      h = Math.max(80, Math.round(h))
      if (r.dir.includes('w')) ox = r.ox + (r.w - w)
      if (r.dir.includes('n')) oy = r.oy + (r.h - h)
      setResize({ id: r.id, w, h, x: ox, y: oy })
    }
    const onUp = () => {
      const cur = resizeCur.current
      const r = resizeRef.current
      setResize(null)
      resizeRef.current = null
      if (!cur || !r) return
      run((b) => {
        const o = b.objs.find((x) => x.id === cur.id)
        if (o) {
          o.x = cur.x
          o.y = cur.y
          o.w = cur.w
          o.h = cur.h
        }
        return b
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resize !== null, run])

  /** 拖动位移的唯一出口：pointermove 和 auto-pan 都走它 */
  const applyDrag = (cx: number, cy: number) => {
    const info = dragInfo.current
    if (!info) return
    const z = zoomRef.current
    const rawDx = (cx - info.sx) / z + panComp.current.x
    const rawDy = (cy - info.sy) / z + panComp.current.y
    if (!dragDelta.current.moved && Math.hypot(rawDx, rawDy) < 3) return
    dragDelta.current.moved = true
    const snapped = snapMove(board, info.ids, rawDx, rawDy, z)
    dragDelta.current.dx = snapped.dx
    dragDelta.current.dy = snapped.dy
    for (const el of elsRef.current) {
      el.style.setProperty('--dx', `${snapped.dx}px`)
      el.style.setProperty('--dy', `${snapped.dy}px`)
    }
    paintGuides(snapped.guides)
  }

  /** 拖到视口边缘时自动平移；平移量反向补偿到拖拽增量里，卡片仍跟手 */
  const tickAutoPan = () => {
    const info = dragInfo.current
    const stage = stageRef.current
    if (!info || !stage) {
      panRaf.current = 0
      return
    }
    const rect = stage.getBoundingClientRect()
    const p = pointerPos.current
    const EDGE = 48
    let fx = 0
    let fy = 0
    if (p.x < rect.left + EDGE) fx = -(1 - Math.max(0, p.x - rect.left) / EDGE)
    else if (p.x > rect.right - EDGE) fx = 1 - Math.max(0, rect.right - p.x) / EDGE
    if (p.y < rect.top + EDGE) fy = -(1 - Math.max(0, p.y - rect.top) / EDGE)
    else if (p.y > rect.bottom - EDGE) fy = 1 - Math.max(0, rect.bottom - p.y) / EDGE

    if (Math.abs(fx) > 0.01 || Math.abs(fy) > 0.01) {
      const SPEED = 12
      const v = vpRefS02.current
      const z = zoomRef.current
      const next = { ...v, x: v.x - fx * SPEED, y: v.y - fy * SPEED }
      vpRefS02.current = next
      setViewport(next)
      panComp.current.x += (fx * SPEED) / z
      panComp.current.y += (fy * SPEED) / z
      applyDrag(p.x, p.y)
    }
    panRaf.current = requestAnimationFrame(tickAutoPan)
  }

  /** 拖动中的吸附线直接写 DOM，不触发 React 重渲染 */
  const paintGuides = (gs: Guide[]) => {
    const g = liveGuidesRef.current
    if (!g) return
    while (g.firstChild) g.removeChild(g.firstChild)
    for (const gd of gs) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      if (gd.axis === 'x') {
        l.setAttribute('x1', String(gd.pos))
        l.setAttribute('y1', String(gd.from))
        l.setAttribute('x2', String(gd.pos))
        l.setAttribute('y2', String(gd.to))
      } else {
        l.setAttribute('x1', String(gd.from))
        l.setAttribute('y1', String(gd.pos))
        l.setAttribute('x2', String(gd.to))
        l.setAttribute('y2', String(gd.pos))
      }
      g.appendChild(l)
    }
  }
  const [rightTab, setRightTab] = useState<'info' | 'ai'>('info')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm0', role: 'user', text: '这三张卡的共同前提是什么？' },
  ])
  const [aiStreaming, setAiStreaming] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    saveViewport(viewport)
  }, [viewport])

  const stageSize = () => {
    const el = stageRef.current
    return { w: el?.clientWidth ?? 1200, h: el?.clientHeight ?? 860 }
  }

  const bounds = useMemo(() => {
    const b = boundsOf(board)
    return { x: -20, y: 40, w: b.maxX + 60, h: b.maxY + 60 }
  }, [board])

  const fit = useCallback(() => {
    const { w, h } = stageSize()
    const z = Math.min(2, Math.max(0.1, Math.min((w - 64) / bounds.w, (h - 64) / bounds.h)))
    setViewport({
      zoom: z,
      x: (w - bounds.w * z) / 2 - bounds.x * z,
      y: (h - bounds.h * z) / 2 - bounds.y * z,
    })
  }, [bounds])

  const zoomTo = useCallback(
    (next: number) => {
      const { w, h } = stageSize()
      const z = Math.min(4, Math.max(0.1, next))
      const world = { x: (w / 2 - viewport.x) / viewport.zoom, y: (h / 2 - viewport.y) / viewport.zoom }
      setViewport({ zoom: z, x: w / 2 - world.x * z, y: h / 2 - world.y * z })
    },
    [viewport]
  )

  useEffect(() => {
    if (subSec) {
      const { w, h } = stageSize()
      const box = { x: subSec.x, y: subSec.y - 28, w: subSec.w, h: subSec.h + 28 }
      const z = Math.min(1.4, Math.max(0.2, Math.min((w - 96) / box.w, (h - 140) / box.h)))
      setViewport({
        zoom: z,
        x: (w - box.w * z) / 2 - box.x * z,
        y: (h - box.h * z) / 2 - box.y * z + 16,
      })
      return
    }
    if (autoFit) {
      fit()
      return
    }
    if (initialZoom) {
      const { w, h } = stageSize()
      const cx = bounds.x + bounds.w / 2
      const cy = bounds.y + bounds.h / 2
      setViewport({ zoom: initialZoom, x: w / 2 - cx * initialZoom, y: h / 2 - cy * initialZoom })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toWorld = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect()
    return { x: (clientX - r.left - viewport.x) / viewport.zoom, y: (clientY - r.top - viewport.y) / viewport.zoom }
  }

  /* ---------- 指针交互 ---------- */

  useEffect(() => {
    if (!interaction) return
    const onMove = (e: PointerEvent) => {
      if (interaction.type === 'drag') {
        pointerPos.current = { x: e.clientX, y: e.clientY }
        applyDrag(e.clientX, e.clientY)
        return
      }

      const p = toWorld(e.clientX, e.clientY)
      const rect = {
        x: Math.min(interaction.sx, p.x),
        y: Math.min(interaction.sy, p.y),
        w: Math.abs(p.x - interaction.sx),
        h: Math.abs(p.y - interaction.sy),
      }
      setInteraction({ ...interaction, ex: p.x, ey: p.y })
      const hits = board.objs
        .filter((o) => o.kind === 'card' && overlaps(o, rect))
        .map((o) => o.id)
        .concat(
          board.sections.filter((sec) => overlaps(sec, rect)).map((sec) => sec.id)
        )
      const base = interaction.base
      if (interaction.mode === 'sub') {
        setSelected(base.filter((id) => !hits.includes(id)))
      } else if (interaction.mode === 'add') {
        setSelected(Array.from(new Set([...base, ...hits])))
      } else {
        setSelected(hits)
      }
    }
    const onUp = () => {
      if (interaction.type === 'drag') {
        const { moved, dx, dy } = dragDelta.current
        for (const el of elsRef.current) {
          el.removeAttribute('data-dragging')
          el.style.removeProperty('--dx')
          el.style.removeProperty('--dy')
        }
        elsRef.current = []
        dragInfo.current = null
        if (panRaf.current) {
          cancelAnimationFrame(panRaf.current)
          panRaf.current = 0
        }
        paintGuides([])
        dragDelta.current = { dx: 0, dy: 0, moved: false }
        if (!moved) {
          setInteraction(null)
          setGuides([])
          return
        }
        const ids = interaction.ids
        run((b) => {
          for (const o of b.objs) {
            if (ids.includes(o.id)) {
              o.x += dx
              o.y += dy
            }
          }
          for (const sec of b.sections) {
            if (ids.includes(sec.id)) {
              sec.x += dx
              sec.y += dy
            }
          }
          // 拖进分区即归组，分区随内容长高
          for (const o of b.objs) {
            if (o.kind !== 'card' || !ids.includes(o.id)) continue
            const cx = o.x + o.w / 2
            const cy = o.y + o.h / 2
            const host = b.sections.find((sec) => cx > sec.x && cx < sec.x + sec.w && cy > sec.y && cy < sec.y + sec.h)
            o.sectionId = host?.id
          }
          for (const sec of b.sections) {
            const inside = b.objs.filter((o) => o.sectionId === sec.id)
            if (inside.length === 0) continue
            const bottom = Math.max(...inside.map((o) => o.y + o.h))
            const right = Math.max(...inside.map((o) => o.x + o.w))
            sec.h = Math.max(sec.h, bottom - sec.y + 16)
            sec.w = Math.max(sec.w, right - sec.x + 16)
          }
          return b
        })
      }
      setInteraction(null)
      setGuides([])
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [interaction, board, run, viewport.zoom])

  const startDrag = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return
    e.stopPropagation()
    const withShift = e.shiftKey
    let ids = selected
    if (withShift) {
      ids = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
      setSelected(ids)
    } else if (!selected.includes(id)) {
      ids = [id]
      setSelected(ids)
    }
    setMenu(null)
    dragDelta.current = { dx: 0, dy: 0, moved: false }
    dragInfo.current = { ids, sx: e.clientX, sy: e.clientY }
    panComp.current = { x: 0, y: 0 }
    pointerPos.current = { x: e.clientX, y: e.clientY }
    if (!panRaf.current) panRaf.current = requestAnimationFrame(tickAutoPan)
    elsRef.current = ids
      .map((id) => document.querySelector(`[data-objid="${id}"]`) as HTMLElement | null)
      .filter((x): x is HTMLElement => !!x)
    elsRef.current.forEach((el) => el.setAttribute('data-dragging', '1'))
    setInteraction({ type: 'drag', ids, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false })
  }

  const startLink = (e: React.PointerEvent, fromId: string, side: Side) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    const p = toWorld(e.clientX, e.clientY)
    setMenu(null)
    setSelected([])
    linkStart.current = { x: p.x, y: p.y }
    setLink({ from: fromId, side, x: p.x, y: p.y, to: null, toSide: side })
  }

  const startMarquee = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const p = toWorld(e.clientX, e.clientY)
    const mode = e.shiftKey ? 'add' : e.altKey ? 'sub' : 'replace'
    if (mode === 'replace') setSelected([])
    setInteraction({ type: 'marquee', sx: p.x, sy: p.y, ex: p.x, ey: p.y, base: selected, mode })
    setMenu(null)
  }

  useEffect(() => {
    if (!demo) return
    if (demo === 'menu') {
      setSelected(['A1'])
      setMenu({ x: 520, y: 320, target: 'object' })
      return
    }
    if (demo === 'ai') {
      setRightTab('ai')
      setMessages([
        { id: 'm0', role: 'user', text: '这三张卡的共同前提是什么？' },
        {
          id: 'm1',
          role: 'assistant',
          text: '共同前提是「提取本身就是学习事件」。间隔效应、测试效应、合意困难三条，都建立在同一个动作上：把答案从记忆里重新拽出来一次。差别只在变量——间隔效应改变时间，测试效应改变方式，合意困难改变难度。',
          citations: [
            { file: 'Bjork & Bjork 2011.pdf', page: 1, paragraph: 'p3', label: 'p.1 §3' },
            { file: 'Bjork & Bjork 2011.pdf', page: 2, paragraph: 'p2', label: 'p.2 §2' },
          ],
        },
      ])
      return
    }
    if (demo === 'multi') {
      setSelected(['A1', 'B1', 'C1'])
      return
    }
    if (demo === 'handles') {
      setSelected(['A1'])
      return
    }
    if (demo === 'anchors') {
      setSelected([])
      return
    }
    if (demo === 'link') {
      const a = board.objs.find((o) => o.id === 'A1')
      const b2 = board.objs.find((o) => o.id === 'B4')
      if (a && b2) {
        setLink({
          from: 'A1',
          side: 'r',
          x: b2.x - 40,
          y: b2.y + 40,
          to: 'B4',
          toSide: 'l',
        })
      }
      return
    }
    if (demo === 'newcard') {
      const id = `N${Date.now()}`
      const cx = (-viewport.x + stageSize().w / 2) / viewport.zoom
      const cy = (-viewport.y + stageSize().h / 2) / viewport.zoom
      run((b) => {
        b.objs.push({
          id,
          kind: 'card',
          x: Math.round(cx - 120),
          y: Math.round(cy - 66),
          w: 240,
          h: 132,
          color: 'yellow',
          title: '新卡片',
          lines: ['双击开始写'],
        })
        return b
      })
      setSelected([id])
      return
    }
    if (demo === 'edge') {
      setSelected(['E1'])
      return
    }
    if (demo === 'drag') {
      setSelected(['A2'])
      const snapped = snapMove(board, ['A2'], 120, 96, viewport.zoom)
      setInteraction({ type: 'drag', ids: ['A2'], sx: 0, sy: 0, dx: snapped.dx, dy: snapped.dy, moved: true })
      setGuides(snapped.guides)
      return
    }
    setSelected(['A1', 'A2'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo])

  useEffect(() => {
    if (!edgeDrag) return
    const onMove = (e: PointerEvent) => {
      const p = toWorld(e.clientX, e.clientY)
      setEdgeDrag({ ...edgeDrag, x: p.x, y: p.y })
    }
    const onUp = (e: PointerEvent) => {
      const p = toWorld(e.clientX, e.clientY)
      const targets = [...board.objs.filter((o) => o.kind === 'card'), ...board.sections]
      const hit = targets.find((o) => p.x > o.x && p.x < o.x + o.w && p.y > o.y && p.y < o.y + o.h)
      const { id, which } = edgeDrag
      setEdgeDrag(null)
      if (!hit) return
      const sides = (['l', 'r', 't', 'b'] as const).map((side) => {
        const m =
          side === 'l'
            ? { x: hit.x, y: hit.y + hit.h / 2 }
            : side === 'r'
              ? { x: hit.x + hit.w, y: hit.y + hit.h / 2 }
              : side === 't'
                ? { x: hit.x + hit.w / 2, y: hit.y }
                : { x: hit.x + hit.w / 2, y: hit.y + hit.h }
        return { side, d: Math.hypot(m.x - p.x, m.y - p.y) }
      })
      sides.sort((a, b) => a.d - b.d)
      const side = sides[0].side
      run((b) => {
        b.edges = b.edges.map((ed) =>
          ed.id === id
            ? which === 'from'
              ? { ...ed, from: hit.id, fromSide: side }
              : { ...ed, to: hit.id, toSide: side }
            : ed
        )
        return b
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [edgeDrag, board, run])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(id)
  }, [toast])

  const askAi = (text: string) => {
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text }])
    window.setTimeout(() => {
      const answer = AI_SCRIPT[1]
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: 'assistant', text: answer.text, citations: answer.citations },
      ])
      setAiStreaming(true)
      window.setTimeout(() => setAiStreaming(false), 1300)
    }, 320)
  }

  const excerptFromAi = (text: string) => {
    addExcerptCard({
      quote: text.slice(0, 80),
      title: '来自 AI 的回答',
      source: { file: 'AI 对话', page: 0, paragraph: 'board' },
      color: 'blue',
    })
    setToast('已拖到白板 · 新摘录')
  }

  const quizMe = () => {
    const id = `g${Date.now()}`
    addQuestion({
      id,
      front: '目标保留率从 80% 提到 90%，复习量大概翻几倍？',
      back: '约两倍。可提取性每次都要被拉回目标值，目标越高，间隔越短、次数越多；这是成本旋钮，不是越高越好。',
      source: { file: 'FSRS 文档', page: 1, paragraph: 'p1' },
      tag: '排程',
    })
    setToast('已加入复习队列 · 1 张')
  }

  useEffect(() => {
    if (!link) return
    const onMove = (e: PointerEvent) => {
      const l = linkRef.current
      if (!l) return
      const p = toWorld(e.clientX, e.clientY)
      // 只连卡片：拖到分区空白处算空白，会在那里新建一张卡并归入该分区
      const targets: { id: string; x: number; y: number; w: number; h: number }[] =
        board.objs.filter((o) => o.kind === 'card')
      // 给 8px 容差：拖到卡片边缘或锚点上也能吸附
      const pad = 8 / Math.max(0.2, zoomRef.current)
      const hit = targets.find(
        (o) =>
          o.id !== l.from &&
          p.x > o.x - pad &&
          p.x < o.x + o.w + pad &&
          p.y > o.y - pad &&
          p.y < o.y + o.h + pad
      )
      let side: Side = 'l'
      if (hit) {
        const cands: [Side, number][] = [
          ['l', Math.abs(p.x - hit.x)],
          ['r', Math.abs(p.x - (hit.x + hit.w))],
          ['t', Math.abs(p.y - hit.y)],
          ['b', Math.abs(p.y - (hit.y + hit.h))],
        ]
        cands.sort((a, b2) => a[1] - b2[1])
        side = cands[0][0]
      }
      setLink({ ...l, x: p.x, y: p.y, to: hit?.id ?? null, toSide: side })
    }
    const onUp = (e: PointerEvent) => {
      const l = linkRef.current
      setLink(null)
      if (!l) return
      const p = toWorld(e.clientX, e.clientY)
      const moved =
        Math.hypot(p.x - linkStart.current.x, p.y - linkStart.current.y) > 2 || l.to !== null
      const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
      if (l.to) {
        const target = l.to
        run((b) => {
          b.edges.push({
            id: `E${stamp}`,
            from: l.from,
            to: target,
            fromSide: l.side,
            toSide: l.toSide,
            shape: 'curve',
            direction: 'none',
          })
          return b
        })
        return
      }
      if (!moved) return
      // 空白处松手：新建一张卡并连上
      const id = `N${stamp}`
      const opposite: Side = l.side === 'l' ? 'r' : l.side === 'r' ? 'l' : l.side === 't' ? 'b' : 't'
      run((b) => {
        const host = b.sections.find(
          (sec) => p.x > sec.x && p.x < sec.x + sec.w && p.y > sec.y && p.y < sec.y + sec.h
        )
        b.objs.push({
          id,
          kind: 'card',
          x: Math.round(p.x - 120),
          y: Math.round(p.y - 66),
          w: 240,
          h: 132,
          color: 'yellow',
          title: '新卡片',
          lines: ['双击开始写'],
          sectionId: host?.id,
        })
        b.edges.push({
          id: `E${stamp}`,
          from: l.from,
          to: id,
          fromSide: l.side,
          toSide: opposite,
          shape: 'curve',
          direction: 'none',
        })
        return b
      })
      setSelected([id])
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [link !== null, board, run])

  useEffect(() => {
    if (!bendDrag) return
    const onMove = (e: PointerEvent) => {
      const cur = bendRef.current
      if (!cur) return
      const ed = board.edges.find((x) => x.id === cur.id)
      if (!ed) return
      const from =
        board.objs.find((o) => o.id === ed.from) ?? board.sections.find((o) => o.id === ed.from)
      const to =
        board.objs.find((o) => o.id === ed.to) ?? board.sections.find((o) => o.id === ed.to)
      if (!from || !to) return
      const p = toWorld(e.clientX, e.clientY)
      const mid0 = bezierMid(
        anchorOf(from, ed.fromSide),
        anchorOf(to, ed.toSide),
        ed.fromSide,
        ed.toSide
      )
      setBendDrag({ id: cur.id, bend: { x: p.x - mid0.x, y: p.y - mid0.y } })
    }
    const onUp = () => {
      const cur = bendRef.current
      setBendDrag(null)
      if (!cur) return
      run((b) => {
        const e2 = b.edges.find((x) => x.id === cur.id)
        if (e2) e2.bend = cur.bend
        return b
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [bendDrag !== null, board, run])

  /* ---------- 键盘 ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if (mod && e.key === '0') {
        e.preventDefault()
        fit()
      }
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        zoomTo(viewport.zoom * 1.2)
      }
      if (mod && e.key === '-') {
        e.preventDefault()
        zoomTo(viewport.zoom / 1.2)
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selected.length > 0) {
        e.preventDefault()
        run((b) => {
          b.objs = b.objs.filter((o) => !selected.includes(o.id))
          b.sections = b.sections.filter((sec) => !selected.includes(sec.id))
          b.edges = b.edges.filter(
            (ed) => !selected.includes(ed.id) && !selected.includes(ed.from) && !selected.includes(ed.to)
          )
          return b
        })
        setSelected([])
      }
      if (e.key === 'Escape' && editingRef.current) {
        e.preventDefault()
        commitEditing()
        return
      }
      if (e.key === 'Escape') {
        setSelected([])
        setMenu(null)
        setFocusMode(false)
      }
      if (e.key.toLowerCase() === 'f' && selected.length > 0) setFocusMode((v) => !v)
      if (e.code === 'Digit2' && e.shiftKey) {
        e.preventDefault()
        const objs = [...board.objs, ...board.sections].filter((o) => selected.includes(o.id))
        const box = objs.length
          ? {
              x: Math.min(...objs.map((o) => o.x)),
              y: Math.min(...objs.map((o) => o.y)),
              w: Math.max(...objs.map((o) => o.x + o.w)) - Math.min(...objs.map((o) => o.x)),
              h: Math.max(...objs.map((o) => o.y + o.h)) - Math.min(...objs.map((o) => o.y)),
            }
          : bounds
        const { w, h } = stageSize()
        const z = Math.min(4, Math.max(0.1, Math.min((w - 80) / box.w, (h - 80) / box.h)))
        setViewport({
          zoom: z,
          x: (w - box.w * z) / 2 - box.x * z,
          y: (h - box.h * z) / 2 - box.y * z,
        })
      }
      if (e.key.startsWith('Arrow') && selected.length > 0) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        run((b) => {
          for (const o of b.objs) {
            if (selected.includes(o.id)) {
              o.x += dx
              o.y += dy
            }
          }
          for (const sec of b.sections) {
            if (selected.includes(sec.id)) {
              sec.x += dx
              sec.y += dy
            }
          }
          return b
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, run, undo, redo, fit, zoomTo, viewport.zoom])

  /* ---------- 菜单动作 ---------- */

  const colorOf = (ids: string[], color: CardColor) =>
    run((b) => {
      for (const o of b.objs) if (ids.includes(o.id)) o.color = color
      return b
    })

  const foldOf = (ids: string[]) =>
    run((b) => {
      for (const o of b.objs) {
        if (!ids.includes(o.id) || o.kind !== 'card') continue
        if (!o.folded) {
          o.folded = true
          o.h = 40
        } else {
          o.folded = false
          o.h = 132
        }
      }
      return b
    })

  const deleteOf = (ids: string[]) => {
    run((b) => {
      b.objs = b.objs.filter((o) => !ids.includes(o.id))
      b.sections = b.sections.filter((sec) => !ids.includes(sec.id))
      b.edges = b.edges.filter((ed) => !ids.includes(ed.from) && !ids.includes(ed.to))
      return b
    })
    setSelected([])
  }

  const menuItems: MenuItem[] =
    menu?.target === 'object'
      ? [
          { id: 'open', label: '打开卡片', icon: 'card', shortcut: 'Enter' },
          { id: 'fold', label: '折叠 / 展开', icon: 'minus', shortcut: 'F' },
          { id: 'focus', label: focusMode ? '退出聚焦' : '聚焦所选', icon: 'cursor' },
          { id: 'divider1', label: '', divider: true },
          { id: 'delete', label: `删除 ${selected.length} 个对象`, icon: 'close', danger: true, shortcut: '⌫' },
        ]
      : [
          { id: 'newCard', label: '新建卡片', icon: 'card', shortcut: 'N' },
          { id: 'newSection', label: '新建分区', icon: 'frame', shortcut: 'S' },
          { id: 'divider1', label: '', divider: true },
          { id: 'fit', label: '适配全板', icon: 'fit', shortcut: '⌘0' },
          { id: 'undo', label: '撤销', icon: 'minus', shortcut: '⌘Z' },
        ]

  const onMenuPick = (id: string) => {
    const at = menu ? toWorld(menu.x, menu.y) : { x: 0, y: 0 }
    if (id === 'delete') deleteOf(selected)
    if (id === 'fold') foldOf(selected)
    if (id === 'focus') setFocusMode((v) => !v)
    if (id === 'fit') fit()
    if (id === 'undo') undo()
    if (id === 'newCard')
      run((b) => {
        b.objs.push({
          id: `N${Date.now()}`,
          kind: 'card',
          x: at.x,
          y: at.y,
          w: 240,
          h: 120,
          color: 'gray',
          title: '新卡片',
          lines: ['双击空白也能新建'],
        })
        return b
      })
    if (id === 'newSection')
      run((b) => {
        b.sections.push({
          id: `NS${Date.now()}`,
          title: '新分区',
          color: 'gray',
          x: at.x,
          y: at.y,
          w: 320,
          h: 220,
        })
        return b
      })
    setMenu(null)
  }

  /* ---------- 渲染 ---------- */

  const selObjs = board.objs.filter((o) => selected.includes(o.id))
  const selSecs = board.sections.filter((sec) => selected.includes(sec.id))
  const selRect = useMemo(() => {
    const all = [...selObjs, ...selSecs]
    if (all.length === 0) return null
    const l = Math.min(...all.map((o) => o.x))
    const t = Math.min(...all.map((o) => o.y))
    const r = Math.max(...all.map((o) => o.x + o.w))
    const b = Math.max(...all.map((o) => o.y + o.h))
    const rect = stageRef.current!.getBoundingClientRect()
    return {
      x: rect.left + viewport.x + l * viewport.zoom,
      y: rect.top + viewport.y + t * viewport.zoom,
      w: (r - l) * viewport.zoom,
      h: (b - t) * viewport.zoom,
    }
  }, [selObjs, selSecs, viewport])

  const selectedEdge = useMemo(() => {
    if (selected.length !== 1) return null
    const ed = board.edges.find((x) => x.id === selected[0])
    if (!ed) return null
    const from = board.objs.find((o) => o.id === ed.from) ?? board.sections.find((o) => o.id === ed.from)
    const to = board.objs.find((o) => o.id === ed.to) ?? board.sections.find((o) => o.id === ed.to)
    if (!from || !to) return null
    const a = anchorOf(from, ed.fromSide)
    const b = anchorOf(to, ed.toSide)
    const rect = stageRef.current?.getBoundingClientRect()
    return {
      edge: ed,
      screen: {
        x: (rect?.left ?? 0) + viewport.x + ((a.x + b.x) / 2) * viewport.zoom,
        y: (rect?.top ?? 0) + viewport.y + ((a.y + b.y) / 2) * viewport.zoom,
      },
    }
  }, [selected, board, viewport])

  const subSec = sub ? board.sections.find((x) => x.id === sub) ?? null : null
  const visSections = subSec ? [] : board.sections
  const visObjs = subSec ? board.objs.filter((o) => o.sectionId === subSec.id) : board.objs
  const visEdges = subSec ? [] : board.edges

  const { w: stageW, h: stageH } = stageSize()
  const view = {
    x: -viewport.x / viewport.zoom,
    y: -viewport.y / viewport.zoom,
    w: stageW / viewport.zoom,
    h: stageH / viewport.zoom,
  }

  const dim = (id: string) => {
    if (!focusMode || selected.includes(id)) return 1
    return 0.15
  }

  // 拖动位移改由 CSS 变量 + data-dragging 驱动，不经过 React
  const dragOf = (_id: string): undefined => undefined

  return (
    <AppShell
      rightOpen={rightOpen}
      left={
        <AppRail apps={APPS} activeId="board" tags={TAGS} />
      }
      main={
        <>
          <AppTabs
            active="/s02"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={rightOpen}
            onToggleRight={() => setRightOpen((v) => !v)}
            extra={
              <span className={s.hint}>
                ⌘Z 撤销 · 空格平移 · 右键菜单
              </span>
            }
          />
          <div className={s.stage} ref={stageRef} data-show-anchors={demo === 'anchors' ? '1' : undefined}>
            {subSec ? (
              <div className={s.crumb}>
                <Breadcrumb
                  items={[
                    { label: '白板', onClick: () => navigate('/s02') },
                    { label: '间隔重复：为什么、怎么排、哪里可疑', onClick: () => navigate('/s02') },
                    { label: subSec.title, current: true },
                  ]}
                />
              </div>
            ) : null}
            <CanvasViewport
              viewport={viewport}
              tool="select"
              onViewportChange={setViewport}
              onBlankDoubleClick={(pt) => {
                const id = `N${Date.now().toString(36)}`
                const host = board.sections.find(
                  (sec) => pt.x > sec.x && pt.x < sec.x + sec.w && pt.y > sec.y && pt.y < sec.y + sec.h
                )
                run((b) => {
                  b.objs.push({
                    id,
                    kind: 'card',
                    x: Math.round(pt.x - 120),
                    y: Math.round(pt.y - 66),
                    w: 240,
                    h: 132,
                    color: 'yellow',
                    title: '新卡片',
                    lines: ['双击开始写'],
                    sectionId: host?.id,
                  })
                  return b
                })
                setSelected([id])
              }}
            >
              <div
                className={s.bg}
                data-canvas-bg
                onPointerDown={startMarquee}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setSelected([])
                  setMenu({ x: e.clientX, y: e.clientY, target: 'blank' })
                }}
              />

              <SnapGuides guides={guides} />

              <svg className={s.edgeLayer} width={3200} height={2400} aria-hidden="true">
                {visEdges.map((ed) => {
                  const from = board.objs.find((o) => o.id === ed.from) ?? board.sections.find((o) => o.id === ed.from)
                  const to = board.objs.find((o) => o.id === ed.to) ?? board.sections.find((o) => o.id === ed.to)
                  if (!from || !to) return null
                  const dragging = edgeDrag?.id === ed.id
                  const pa = anchorOf(from, ed.fromSide)
                  const pb = anchorOf(to, ed.toSide)
                  return (
                    <Edge
                      key={ed.id}
                      from={dragging && edgeDrag.which === 'from' ? { x: edgeDrag.x, y: edgeDrag.y } : pa}
                      to={dragging && edgeDrag.which === 'to' ? { x: edgeDrag.x, y: edgeDrag.y } : pb}
                      fromSide={ed.fromSide}
                      toSide={ed.toSide}
                      shape={ed.shape}
                      direction={ed.direction}
                      label={ed.label}
                      zoom={viewport.zoom}
                      hideLabel
                      bend={bendDrag?.id === ed.id ? bendDrag.bend : ed.bend}
                      onBendDown={(e) => {
                        e.stopPropagation()
                        setBendDrag({ id: ed.id, bend: ed.bend ?? { x: 0, y: 0 } })
                      }}
                      onBendReset={() =>
                        run((b) => {
                          const e2 = b.edges.find((x) => x.id === ed.id)
                          if (e2) delete e2.bend
                          return b
                        })
                      }
                      selected={selected.includes(ed.id)}
                      onSelect={() => setSelected([ed.id])}
                      onHandleDown={(which, e) => {
                        const pt = toWorld(e.clientX, e.clientY)
                        setEdgeDrag({ id: ed.id, which, x: pt.x, y: pt.y })
                      }}
                    />
                  )
                })}
                {link
                  ? (() => {
                      const f =
                        board.objs.find((x) => x.id === link.from) ??
                        board.sections.find((x) => x.id === link.from)
                      if (!f) return null
                      return (
                        <path
                          d={edgePath(
                            anchorOf(f, link.side),
                            { x: link.x, y: link.y },
                            link.side,
                            link.toSide,
                            'curve'
                          )}
                          fill="none"
                          stroke="var(--c-accent)"
                          strokeWidth={1.5}
                          strokeDasharray="4 3"
                          pointerEvents="none"
                        />
                      )
                    })()
                  : null}
                <g ref={liveGuidesRef} className={s.liveGuides} />
              </svg>

              {/* 标签单独一层，压在卡片之上，线在卡片之下 */}
              <svg className={s.labelLayer} width={3200} height={2400} aria-hidden="true">
                {visEdges.map((ed) => {
                  if (!ed.label) return null
                  const from =
                    board.objs.find((o) => o.id === ed.from) ??
                    board.sections.find((o) => o.id === ed.from)
                  const to =
                    board.objs.find((o) => o.id === ed.to) ??
                    board.sections.find((o) => o.id === ed.to)
                  if (!from || !to) return null
                  const mid = bezierMid(
                    anchorOf(from, ed.fromSide),
                    anchorOf(to, ed.toSide),
                    ed.fromSide,
                    ed.toSide
                  )
                  const w = ed.label.length * 13 + 16
                  return (
                    <g key={ed.id} className={s.edgeLabel} transform={`translate(${mid.x} ${mid.y})`}>
                      <rect x={-w / 2} y={-9} width={w} height={18} rx={8} />
                      <text textAnchor="middle" dominantBaseline="central">
                        {ed.label}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {visSections.map((sec) => (
                <div
                  key={sec.id}
                  className={s.secHit}
                  data-objid={sec.id}
                  data-link-target={link?.to === sec.id ? '1' : undefined}
                  style={{
                    left: sec.x,
                    top: sec.y - 28,
                    width: sec.w,
                    height: (sec.collapsed ? 44 : sec.h) + 28,
                    opacity: dim(sec.id),
                    transform: dragOf(sec.id),
                  }}
                  onPointerDown={(e) => startDrag(e, sec.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    navigate(`/s02?sub=${sec.id}`)
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelected([sec.id])
                    setMenu({ x: e.clientX, y: e.clientY, target: 'object' })
                  }}
                >
                  <SectionBox
                    title={sec.title}
                    color={sec.color}
                    rect={{ x: 0, y: 28, w: sec.w, h: sec.collapsed ? 44 : sec.h }}
                    count={board.objs.filter((o) => o.sectionId === sec.id).length}
                    collapsed={sec.collapsed}
                    selected={selected.includes(sec.id)}
                  />
                  <span className={s.anchors} aria-hidden="true">
                    {(['t', 'r', 'b', 'l'] as const).map((sd) => (
                      <i key={sd} data-side={sd} onPointerDown={(e) => startLink(e, sec.id, sd)} />
                    ))}
                  </span>
                </div>
              ))}

              {visObjs.map((o) => {
                const hidden = o.sectionId
                  ? board.sections.find((sec) => sec.id === o.sectionId)?.collapsed
                  : false
                if (hidden) return null
                const isCard = o.kind === 'card'
                return (
                  <div
                    key={o.id}
                    className={s.obj}
                    data-objid={o.id}
                    data-object={o.kind}
                    data-link-target={link?.to === o.id ? '1' : undefined}
                    data-selected={selected.includes(o.id) ? '1' : undefined}
                    style={{
                      left: resize?.id === o.id ? resize.x : o.x,
                      top: resize?.id === o.id ? resize.y : o.y,
                      opacity: dim(o.id),
                      transform: dragOf(o.id),
                      transformOrigin: '0 0',
                    }}
                    onPointerDown={(e) => startDrag(e, o.id)}
                    onDoubleClick={() => {
                      if (!isCard) return
                      setEditing({
                        id: o.id,
                        title: o.title ?? '',
                        body: (o.lines ?? []).join(String.fromCharCode(10)),
                      })
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!selected.includes(o.id)) setSelected([o.id])
                      setMenu({ x: e.clientX, y: e.clientY, target: 'object' })
                    }}
                  >
                    {editing && editing.id === o.id ? (
                      <div
                        className={s.cardEditor}
                        style={{ width: 380, minHeight: 220 }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        <input
                          className={s.editorTitle}
                          value={editing.title}
                          autoFocus
                          placeholder="标题"
                          onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        />
                        <textarea
                          className={s.editorBody}
                          value={editing.body}
                          placeholder="正文，一行一段"
                          onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.preventDefault()
                              commitEditing()
                            }
                          }}
                        />
                        <div className={s.editorFoot}>
                          <span>Esc 收起 · 内容自动存</span>
                          <button type="button" onClick={commitEditing}>
                            完成
                          </button>
                        </div>
                      </div>
                    ) : isCard ? (
                      <CardNode
                        card={{
                          id: o.id,
                          title: o.title ?? '',
                          lines: o.lines ?? [],
                          color: o.color ?? 'gray',
                          folded: o.folded,
                        }}
                        width={resize?.id === o.id ? resize.w : o.w}
                        height={resize?.id === o.id ? resize.h : o.h}
                        selected={selected.includes(o.id)}
                        readonly={false}
                      />
                    ) : o.kind === 'text' ? (
                      <TextNode
                        x={0}
                        y={0}
                        width={o.w}
                        size={o.id === 'T1' ? 'display' : 'body'}
                        tone={o.id === 'T1' ? 'strong' : 'muted'}
                        selected={selected.includes(o.id)}
                      >
                        {o.text}
                      </TextNode>
                    ) : (
                      <MediaNode
                        x={0}
                        y={0}
                        width={o.w}
                        height={o.h}
                        caption={o.caption}
                        selected={selected.includes(o.id)}
                      >
                        {o.media === 'curves' ? <CurvesSvg /> : <FsrsSvg />}
                      </MediaNode>
                    )}
                    <span className={s.anchors} aria-hidden="true">
                      {(['t', 'r', 'b', 'l'] as const).map((sd) => (
                        <i key={sd} data-side={sd} onPointerDown={(e) => startLink(e, o.id, sd)} />
                      ))}
                    </span>
                    {selected.length === 1 && selected[0] === o.id && isCard ? (
                      <span className={s.handles}>
                        {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((hd) => (
                          <i
                            key={hd}
                            data-resize={hd}
                            onPointerDown={(e) => startResize(e, o.id, hd)}
                          />
                        ))}
                      </span>
                    ) : null}
                  </div>
                )
              })}

              <Marquee
                rect={
                  interaction?.type === 'marquee'
                    ? {
                        x: Math.min(interaction.sx, interaction.ex),
                        y: Math.min(interaction.sy, interaction.ey),
                        w: Math.abs(interaction.ex - interaction.sx),
                        h: Math.abs(interaction.ey - interaction.sy),
                      }
                    : null
                }
              />
            </CanvasViewport>

            <CanvasToolbar tool={tool} onToolSelected={setTool} />
            <StatusDock zoom={viewport.zoom} selectionCount={selected.length} readonly={false} />
            <ZoomDock zoom={viewport.zoom} onZoomChanged={zoomTo} onFitRequested={fit} />
            <Minimap
              bounds={{ x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h }}
              view={view}
              sections={visSections}
              objects={visObjs.filter((o) => o.kind === 'card')}
              onJump={(p) =>
                setViewport({
                  ...viewport,
                  x: stageSize().w / 2 - p.x * viewport.zoom,
                  y: stageSize().h / 2 - p.y * viewport.zoom,
                })
              }
            />

            {selectedEdge && !interaction && menu === null ? (
              <EdgeHUD
                x={selectedEdge.screen.x}
                y={selectedEdge.screen.y}
                shape={selectedEdge.edge.shape}
                direction={selectedEdge.edge.direction}
                label={selectedEdge.edge.label}
                onShape={(v) =>
                  run((b) => {
                    b.edges = b.edges.map((ed) => (ed.id === selectedEdge.edge.id ? { ...ed, shape: v } : ed))
                    return b
                  })
                }
                onDirection={(v) =>
                  run((b) => {
                    b.edges = b.edges.map((ed) =>
                      ed.id === selectedEdge.edge.id ? { ...ed, direction: v } : ed
                    )
                    return b
                  })
                }
                onLabel={(v) =>
                  run((b) => {
                    b.edges = b.edges.map((ed) => (ed.id === selectedEdge.edge.id ? { ...ed, label: v } : ed))
                    return b
                  }, false)
                }
                onDelete={() =>
                  run((b) => {
                    b.edges = b.edges.filter((ed) => ed.id !== selectedEdge.edge.id)
                    return b
                  })
                }
              />
            ) : null}

            {selRect && !interaction && menu === null && !selectedEdge ? (
              <SelectionHUD
                rect={selRect}
                count={selected.length}
                onColor={(c) => colorOf(selected, c as CardColor)}
                onFold={() => foldOf(selected)}
                onAlign={alignSelected}
                onDistribute={distributeSelected}
                onMore={() => setMenu({ x: selRect.x + selRect.w, y: selRect.y, target: 'object' })}
                onAi={() => undefined}
              />
            ) : null}

            {toast ? <div className={s.toast}>{toast}</div> : null}

            {menu ? (
              <ContextMenu x={menu.x} y={menu.y} items={menuItems} onPick={onMenuPick} onDismiss={() => setMenu(null)} />
            ) : null}
          </div>
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>
            <div className={s.segs}>
              <button
                type="button"
                className={rightTab === 'info' ? s.segOn : s.segOff}
                onClick={() => setRightTab('info')}
              >
                信息
              </button>
              <button
                type="button"
                className={rightTab === 'ai' ? s.segOn : s.segOff}
                onClick={() => setRightTab('ai')}
              >
                AI
              </button>
            </div>
            <IconButton icon="close" size="sm" tooltip="收起" onClick={() => setRightOpen(false)} />
          </div>
          <Divider />
          {rightTab === 'ai' ? (
            <AiChatPanel
              messages={messages}
              streaming={aiStreaming}
              onSend={askAi}
              onCite={() => navigate('/s05')}
              onExcerpt={(m) => excerptFromAi(m.text)}
              onQuiz={quizMe}
            />
          ) : null}
          <div className={s.panelBody} style={rightTab === 'ai' ? { display: 'none' } : undefined}>
            <div className={s.field}>
              <span className={s.label}>对象</span>
              <span className={s.value}>
                {board.objs.length} 个 · 选中 {selected.length}
              </span>
            </div>
            <div className={s.field}>
              <span className={s.label}>分区</span>
              <span className={s.value}>{board.sections.length} 个</span>
            </div>
            <div className={s.field}>
              <span className={s.label}>缩放</span>
              <span className={s.value}>{Math.round(viewport.zoom * 100)}%</span>
            </div>
            <Divider />
            <div className={s.note}>
              {focusMode ? '聚焦模式：只亮选中与邻居。按 Esc 退出。' : '拖拽、框选、右键、折叠、撤销都已接上；连线编辑留到下一轮。'}
            </div>
            <div className={s.keys}>
              <div><kbd>拖拽</kbd>　移动 / 同轴吸附</div>
              <div><kbd>拖空白</kbd>　框选（Shift 加 / Alt 减）</div>
              <div><kbd>右键</kbd>　对象菜单 / 空白菜单</div>
              <div><kbd>⌘Z</kbd>　撤销　<kbd>⇧⌘Z</kbd> 重做</div>
              <div><kbd>F</kbd>　聚焦　<kbd>⌫</kbd> 删除</div>
            </div>
          </div>
        </div>
      }
    />
  )
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
