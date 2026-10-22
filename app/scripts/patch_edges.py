# -*- coding: utf-8 -*-
"""一次性补丁：给 S02 接上连线编辑（选中 / 端点重连 / 连线工具条）"""
import io

p = 'src/screens/S02-Whiteboard/S02-Whiteboard.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace(
    "import { SelectionHUD } from '@/parts/C22-SelectionHUD'",
    "import { SelectionHUD } from '@/parts/C22-SelectionHUD'\nimport { EdgeHUD } from '@/parts/C23-EdgeHUD'",
)

t = t.replace(
    "  const [focusMode, setFocusMode] = useState(false)",
    "  const [focusMode, setFocusMode] = useState(false)\n"
    "  const [edgeDrag, setEdgeDrag] = useState<{ id: string; which: 'from' | 'to'; x: number; y: number } | null>(null)",
)

edge_drag = """  useEffect(() => {
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

  /* ---------- 键盘 ---------- */"""
t = t.replace("  /* ---------- 键盘 ---------- */", edge_drag, 1)

t = t.replace(
    "          b.edges = b.edges.filter((ed) => !selected.includes(ed.from) && !selected.includes(ed.to))\n"
    "          return b\n"
    "        })\n"
    "        setSelected([])",
    "          b.edges = b.edges.filter(\n"
    "            (ed) => !selected.includes(ed.id) && !selected.includes(ed.from) && !selected.includes(ed.to)\n"
    "          )\n"
    "          return b\n"
    "        })\n"
    "        setSelected([])",
)

old_edges = """                  return (
                    <Edge
                      key={ed.id}
                      from={anchorOf(from, ed.fromSide)}
                      to={anchorOf(to, ed.toSide)}
                      fromSide={ed.fromSide}
                      toSide={ed.toSide}
                      shape={ed.shape}
                      direction={ed.direction}
                      label={ed.label}
                    />
                  )"""
new_edges = """                  const dragging = edgeDrag?.id === ed.id
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
                  )"""
assert old_edges in t, 'edge block not found'
t = t.replace(old_edges, new_edges)

hud = """            {selectedEdge && !interaction && menu === null ? (
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
              <SelectionHUD"""
old_hud = """            {selRect && !interaction && menu === null ? (
              <SelectionHUD"""
assert old_hud in t, 'hud block not found'
t = t.replace(old_hud, hud)

calc = """  const selectedEdge = useMemo(() => {
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

  const { w: stageW, h: stageH } = stageSize()"""
t = t.replace("  const { w: stageW, h: stageH } = stageSize()", calc, 1)

t = t.replace(
    "    if (demo === 'drag') {",
    "    if (demo === 'edge') {\n      setSelected(['E1'])\n      return\n    }\n    if (demo === 'drag') {",
    1,
)

io.open(p, 'w', encoding='utf-8').write(t)
print('patched')
