import io

p = 'src/screens/S02-Whiteboard/S02-Whiteboard.tsx'
t = io.open(p, encoding='utf-8').read()

# 1) 新增 ref：被拖元素、拖动增量、吸附线图层
t = t.replace("""  const [edgeDrag, setEdgeDrag] = useState<{ id: string; which: 'from' | 'to'; x: number; y: number } | null>(null)""",
"""  const [edgeDrag, setEdgeDrag] = useState<{ id: string; which: 'from' | 'to'; x: number; y: number } | null>(null)
  const elsRef = useRef<HTMLElement[]>([])
  const dragDelta = useRef({ dx: 0, dy: 0, moved: false })
  const liveGuidesRef = useRef<SVGGElement>(null)

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
  }""")

# 2) onMove 的 drag 分支：不 setState，只写 DOM
old_drag = """      if (interaction.type === 'drag') {
        const dx = (e.clientX - interaction.sx) / viewport.zoom
        const dy = (e.clientY - interaction.sy) / viewport.zoom
        if (!interaction.moved && Math.hypot(dx, dy) < 3) return
        const snapped = snapMove(board, interaction.ids, dx, dy, viewport.zoom)
        if (interaction.moved !== true) {
          setInteraction({ ...interaction, dx: snapped.dx, dy: snapped.dy, moved: true })
        } else {
          setInteraction({ ...interaction, dx: snapped.dx, dy: snapped.dy })
        }
        setGuides(snapped.guides)
        return
      }"""
if old_drag not in t:
    # 兜底：按实际文本块定位（之前可能是另一种写法）
    start = t.index("      if (interaction.type === 'drag') {")
    end = t.index("      const p = toWorld(e.clientX, e.clientY)", start)
    old_drag = t[start:end]
    print('fallback block len', len(old_drag))

new_drag = """      if (interaction.type === 'drag') {
        const dx = (e.clientX - interaction.sx) / viewport.zoom
        const dy = (e.clientY - interaction.sy) / viewport.zoom
        if (!dragDelta.current.moved && Math.hypot(dx, dy) < 3) return
        dragDelta.current.moved = true
        const snapped = snapMove(board, interaction.ids, dx, dy, viewport.zoom)
        dragDelta.current.dx = snapped.dx
        dragDelta.current.dy = snapped.dy
        for (const el of elsRef.current) {
          el.style.setProperty('--dx', `${snapped.dx}px`)
          el.style.setProperty('--dy', `${snapped.dy}px`)
        }
        paintGuides(snapped.guides)
        return
      }"""
t = t.replace(old_drag, new_drag)

# 3) onUp 的 drag 分支：用 ref 提交，清掉拖动标记
old_up = """    const onUp = () => {
      if (interaction.type === 'drag' && interaction.moved) {
        const { ids, dx, dy } = interaction"""
new_up = """    const onUp = () => {
      if (interaction.type === 'drag') {
        const { moved, dx, dy } = dragDelta.current
        for (const el of elsRef.current) {
          el.removeAttribute('data-dragging')
          el.style.removeProperty('--dx')
          el.style.removeProperty('--dy')
        }
        elsRef.current = []
        paintGuides([])
        dragDelta.current = { dx: 0, dy: 0, moved: false }
        if (!moved) {
          setInteraction(null)
          setGuides([])
          return
        }
        const ids = interaction.ids"""
assert old_up in t
t = t.replace(old_up, new_up)

# 4) startDrag：缓存元素并打标记
t = t.replace("""    setMenu(null)
    setInteraction({ type: 'drag', ids, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false })""",
"""    setMenu(null)
    dragDelta.current = { dx: 0, dy: 0, moved: false }
    elsRef.current = ids
      .map((id) => document.querySelector(`[data-objid="${id}"]`) as HTMLElement | null)
      .filter((x): x is HTMLElement => !!x)
    elsRef.current.forEach((el) => el.setAttribute('data-dragging', '1'))
    setInteraction({ type: 'drag', ids, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false })""")

# 5) dragOf 不再参与渲染
t = t.replace("""  const dragOf = (id: string) =>
    interaction?.type === 'drag' && interaction.ids.includes(id)
      ? `translate3d(${interaction.dx}px, ${interaction.dy}px, 0)`
      : undefined""",
"""  // 拖动位移改由 CSS 变量 + data-dragging 驱动，不经过 React
  const dragOf = (_id: string): undefined => undefined""")

# 6) 渲染：给对象与分区加 data-objid；吸附线图层
t = t.replace("""                  className={s.secHit}
                  style={{""",
"""                  className={s.secHit}
                  data-objid={sec.id}
                  style={{""")
t = t.replace("""                    className={s.obj}
                    data-object={o.kind}""",
"""                    className={s.obj}
                    data-objid={o.id}
                    data-object={o.kind}""")
t = t.replace("""              </svg>

              {visSections.map((sec) => (""",
"""                <g ref={liveGuidesRef} className={s.liveGuides} />
              </svg>

              {visSections.map((sec) => (""")
io.open(p, 'w', encoding='utf-8').write(t)
print('s02 ok')

p = 'src/screens/S02-Whiteboard/S02-Whiteboard.module.css'
c = io.open(p, encoding='utf-8').read()
c += '''
/* 拖动位移：DOM 直改 CSS 变量，React 重渲染也不会打断 */
.obj[data-dragging],
.secHit[data-dragging] {
  transform: translate3d(var(--dx, 0px), var(--dy, 0px), 0) !important;
  z-index: 30;
}

.liveGuides line {
  stroke: var(--c-accent);
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0.9;
}
'''
io.open(p, 'w', encoding='utf-8').write(c)
print('css ok')
