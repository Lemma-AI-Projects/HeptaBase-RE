import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { CanvasViewport, type Viewport } from '@/parts/C10-CanvasViewport'
import { CardNode } from '@/parts/C11-CardNode'
import { SectionBox } from '@/parts/C12-SectionBox'
import { TextNode } from '@/parts/C13-TextNode'
import { MediaNode } from '@/parts/C14-MediaNode'
import { Edge } from '@/parts/C15-Edge'
import { Marquee } from '@/parts/C16-Marquee'
import { SnapGuides } from '@/parts/C17-SnapGuide'
import { Minimap } from '@/parts/C18-Minimap'
import { ContextMenu, type MenuItem } from '@/parts/C21-ContextMenu'
import { SelectionHUD } from '@/parts/C22-SelectionHUD'
import { EdgeHUD } from '@/parts/C23-EdgeHUD'
import { CanvasToolbar, type ToolId } from '@/parts/C19-CanvasToolbar'
import { ZoomDock } from '@/parts/C20-ZoomDock'
import { StatusDock } from '@/parts/C08-StatusDock'
import { IconButton } from '@/parts/C61-IconButton'
import { Divider } from '@/parts/C67-Divider'
import { AppTabs } from '../AppTabs'
import { BOARD } from '@/fixtures/board-spaced-repetition'
import { CurvesSvg, FsrsSvg } from '@/fixtures/assets/CurvesSvg'
import { anchorOf, boundsOf, initBoard, snapMove, useBoard, type Guide, type Obj } from '@/lib/board-state'
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
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  initialZoom?: number
  autoFit?: boolean
  stress?: boolean
  demo?: string
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
        const dx = (e.clientX - interaction.sx) / viewport.zoom
        const dy = (e.clientY - interaction.sy) / viewport.zoom
        const snapped = snapMove(board, interaction.ids, dx, dy, viewport.zoom)
        setInteraction({ ...interaction, dx: snapped.dx, dy: snapped.dy, moved: true })
        setGuides(snapped.guides)
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
      if (interaction.type === 'drag' && interaction.moved) {
        const { ids, dx, dy } = interaction
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
    setInteraction({ type: 'drag', ids, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false })
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
      if (e.key === 'Escape') {
        setSelected([])
        setMenu(null)
        setFocusMode(false)
      }
      if (e.key.toLowerCase() === 'f' && selected.length > 0) setFocusMode((v) => !v)
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

  const dragOf = (id: string) =>
    interaction?.type === 'drag' && interaction.ids.includes(id)
      ? `translate3d(${interaction.dx}px, ${interaction.dy}px, 0)`
      : undefined

  return (
    <AppShell
      rightOpen={rightOpen}
      left={
        <AppRail apps={APPS} activeId="board" tags={TAGS} onAppSelected={() => undefined} />
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
          <div className={s.stage} ref={stageRef}>
            <CanvasViewport viewport={viewport} tool="select" onViewportChange={setViewport}>
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
                {board.edges.map((ed) => {
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
                      selected={selected.includes(ed.id)}
                      onSelect={() => setSelected([ed.id])}
                      onHandleDown={(which, e) => {
                        const pt = toWorld(e.clientX, e.clientY)
                        setEdgeDrag({ id: ed.id, which, x: pt.x, y: pt.y })
                      }}
                    />
                  )
                })}
              </svg>

              {board.sections.map((sec) => (
                <div
                  key={sec.id}
                  className={s.secHit}
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
                    run((b) => {
                      const target = b.sections.find((x) => x.id === sec.id)
                      if (target) target.collapsed = !target.collapsed
                      return b
                    })
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
                </div>
              ))}

              {board.objs.map((o) => {
                const hidden = o.sectionId
                  ? board.sections.find((sec) => sec.id === o.sectionId)?.collapsed
                  : false
                if (hidden) return null
                const isCard = o.kind === 'card'
                return (
                  <div
                    key={o.id}
                    className={s.obj}
                    data-object={o.kind}
                    style={{
                      left: o.x,
                      top: o.y,
                      opacity: dim(o.id),
                      transform: dragOf(o.id),
                      transformOrigin: '0 0',
                    }}
                    onPointerDown={(e) => startDrag(e, o.id)}
                    onDoubleClick={() => {
                      if (isCard) navigate('/s03')
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!selected.includes(o.id)) setSelected([o.id])
                      setMenu({ x: e.clientX, y: e.clientY, target: 'object' })
                    }}
                  >
                    {isCard ? (
                      <CardNode
                        card={{
                          id: o.id,
                          title: o.title ?? '',
                          lines: o.lines ?? [],
                          color: o.color ?? 'gray',
                          folded: o.folded,
                        }}
                        width={o.w}
                        height={o.h}
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
              sections={board.sections}
              objects={board.objs.filter((o) => o.kind === 'card')}
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
                onMore={() => setMenu({ x: selRect.x + selRect.w, y: selRect.y, target: 'object' })}
                onAi={() => undefined}
              />
            ) : null}

            {menu ? (
              <ContextMenu x={menu.x} y={menu.y} items={menuItems} onPick={onMenuPick} onDismiss={() => setMenu(null)} />
            ) : null}
          </div>
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span>白板信息</span>
            <IconButton icon="close" size="sm" tooltip="收起" onClick={() => setRightOpen(false)} />
          </div>
          <Divider />
          <div className={s.panelBody}>
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
