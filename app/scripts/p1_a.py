import io

# ---------- EdgeData 支持 direction: 'none' ----------
p = 'src/lib/board-layout.ts'
t = io.open(p, encoding='utf-8').read()
t = t.replace("  direction: 'one' | 'both'", "  direction: 'one' | 'both' | 'none'")
io.open(p, 'w', encoding='utf-8').write(t)

# ---------- C15：命中区按缩放补偿；无箭头 ----------
p = 'src/parts/C15-Edge/C15-Edge.tsx'
t = io.open(p, encoding='utf-8').read()
t = t.replace("""  selected?: boolean
  disabled?: boolean""",
"""  selected?: boolean
  disabled?: boolean
  /** 当前缩放，用来把命中区换算成屏幕上恒定的宽度 */
  zoom?: number""")
t = t.replace("""  selected = false,
  disabled = false,
  onSelect,""",
"""  selected = false,
  disabled = false,
  zoom = 1,
  onSelect,""")
t = t.replace("""        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={14}""",
"""        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={16 / Math.max(0.05, zoom)}""")
io.open(p, 'w', encoding='utf-8').write(t)
print('c15 ok', '16 / Math.max' in t)

# ---------- S02：连线创建 ----------
p = 'src/screens/S02-Whiteboard/S02-Whiteboard.tsx'
t = io.open(p, encoding='utf-8').read()

# 1) 状态与 ref
t = t.replace("""  const elsRef = useRef<HTMLElement[]>([])""",
"""  const [link, setLink] = useState<{
    from: string
    side: Side
    x: number
    y: number
    to: string | null
    toSide: Side
  } | null>(null)
  const linkRef = useRef<typeof link>(null)
  linkRef.current = link

  const elsRef = useRef<HTMLElement[]>([])""")

# 2) 开始连线
t = t.replace("""  const startMarquee = (e: React.PointerEvent) => {""",
"""  const startLink = (e: React.PointerEvent, fromId: string, side: Side, fromObj: Obj | { id: string; x: number; y: number; w: number; h: number }) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    const p = toWorld(e.clientX, e.clientY)
    setMenu(null)
    setSelected([])
    setLink({ from: fromId, side, x: p.x, y: p.y, to: null, toSide: side })
    // fromObj 这里只用于定位，实际锚点由 anchorOf 算，不需要存
    void fromObj
  }

  const startMarquee = (e: React.PointerEvent) => {""")

# 3) 拉线过程中的 window 监听（只依赖"是否在拉线"）
anchor_effect = """  useEffect(() => {
    if (!link) return
    const onMove = (e: PointerEvent) => {
      const l = linkRef.current
      if (!l) return
      const p = toWorld(e.clientX, e.clientY)
      const targets: { id: string; x: number; y: number; w: number; h: number }[] = [
        ...board.objs.filter((o) => o.kind === 'card'),
        ...board.sections,
      ]
      const hit = targets.find(
        (o) => o.id !== l.from && p.x > o.x && p.x < o.x + o.w && p.y > o.y && p.y < o.y + o.h
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
      const moved = Math.hypot(p.x - l.x, p.y - l.y) > 2 || l.to !== null
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

  /* ---------- 键盘 ---------- */"""
t = t.replace("  /* ---------- 键盘 ---------- */", anchor_effect, 1)
io.open(p, 'w', encoding='utf-8').write(t)
print('s02 link state ok', 'startLink' in t)
