import io

# ---------- P0-4 缩放范围 ----------
p = 'src/tokens/index.ts'
t = io.open(p, encoding='utf-8').read()
t = t.replace("export const ZOOM_MIN = 0.1\nexport const ZOOM_MAX = 4",
"export const ZOOM_MIN = 0.05\nexport const ZOOM_MAX = 8")
io.open(p, 'w', encoding='utf-8').write(t)

# ---------- P0-1 视口 ref 化 ----------
p = 'src/parts/C10-CanvasViewport/C10-CanvasViewport.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace("""  const rootRef = useRef<HTMLDivElement>(null)
  const [spaceDown, setSpaceDown] = useState(false)
  const drag = useRef<{ id: number; x: number; y: number; vx: number; vy: number } | null>(null)

  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = clientX - rect.left
      const py = clientY - rect.top
      const next = clamp(viewport.zoom * factor, ZOOM_MIN, ZOOM_MAX)
      const world = {
        x: (px - viewport.x) / viewport.zoom,
        y: (py - viewport.y) / viewport.zoom,
      }
      onViewportChange({
        zoom: next,
        x: px - world.x * next,
        y: py - world.y * next,
      })
    },
    [viewport, onViewportChange]
  )

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY)
        return
      }
      if (e.shiftKey) {
        onViewportChange({ ...viewport, x: viewport.x - e.deltaY })
        return
      }
      onViewportChange({ ...viewport, y: viewport.y - e.deltaY })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [viewport, onViewportChange, zoomAt])""",
"""  const rootRef = useRef<HTMLDivElement>(null)
  const [spaceDown, setSpaceDown] = useState(false)
  const drag = useRef<{ id: number; x: number; y: number; vx: number; vy: number } | null>(null)

  /* 视口以 ref 为准：同一帧内的多个 wheel 事件依次累加，不再互相覆盖 */
  const vpRef = useRef(viewport)
  vpRef.current = viewport
  const cbRef = useRef(onViewportChange)
  cbRef.current = onViewportChange

  const commit = (next: { x: number; y: number; zoom: number }) => {
    vpRef.current = next
    cbRef.current(next)
  }

  const zoomAtRef = useRef((factor: number, clientX: number, clientY: number) => {
    const el = rootRef.current
    if (!el) return
    const v = vpRef.current
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left
    const py = clientY - rect.top
    const next = clamp(v.zoom * factor, ZOOM_MIN, ZOOM_MAX)
    const world = { x: (px - v.x) / v.zoom, y: (py - v.y) / v.zoom }
    commit({ zoom: next, x: px - world.x * next, y: py - world.y * next })
  })

  // 只在挂载时绑一次；父组件每次重渲染不再解绑重绑
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const v = vpRef.current
      if (e.ctrlKey || e.metaKey) {
        zoomAtRef.current(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY)
        return
      }
      const step = e.deltaMode === 1 ? 16 : 1
      if (e.shiftKey) {
        commit({ ...v, x: v.x - e.deltaY * step })
        return
      }
      commit({ ...v, y: v.y - e.deltaY * step })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])""")

# 平移也走 ref
t = t.replace("""        drag.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          vx: viewport.x,
          vy: viewport.y,
        }""",
"""        drag.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          vx: vpRef.current.x,
          vy: vpRef.current.y,
        }""")
t = t.replace("""        onViewportChange({
          ...viewport,
          x: d.vx + (e.clientX - d.x),
          y: d.vy + (e.clientY - d.y),
        })""",
"""        commit({
          ...vpRef.current,
          x: d.vx + (e.clientX - d.x),
          y: d.vy + (e.clientY - d.y),
        })""")
io.open(p, 'w', encoding='utf-8').write(t)
print('c10 ok')
