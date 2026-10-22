import io

# ---------- App：route 带 demo=search 时打开搜索 ----------
p = 'src/App.tsx'
t = io.open(p, encoding='utf-8').read()
t = t.replace("""  useEffect(() => {
    if (route.query.get('seed') !== '1') return""",
"""  const qs = route.query.toString()

  useEffect(() => {
    if (route.query.get('demo') === 'search') setSearchOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  useEffect(() => {
    if (route.query.get('seed') !== '1') return""")
io.open(p, 'w', encoding='utf-8').write(t)
print('app ok', 'setSearchOpen(true)' in t)

# ---------- S08：?tag= 预设筛选 ----------
p = 'src/screens/S08-Library/S08-Library.tsx'
t = io.open(p, encoding='utf-8').read()
t = t.replace("  const [filters, setFilters] = useState<Record<string, string[]>>({ 状态: [], 标签: [] })",
"""  const [filters, setFilters] = useState<Record<string, string[]>>(() => {
    const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
    const tag = q.get('tag')
    return { 状态: [], 标签: tag ? [tag] : [] }
  })""")
io.open(p, 'w', encoding='utf-8').write(t)
print('s08 ok', 'q.get(\'tag\')' in t)

# ---------- S02：demo=newcard 新建一张卡 ----------
p = 'src/screens/S02-Whiteboard/S02-Whiteboard.tsx'
t = io.open(p, encoding='utf-8').read()
t = t.replace("""    if (demo === 'edge') {""",
"""    if (demo === 'newcard') {
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
    if (demo === 'edge') {""")
io.open(p, 'w', encoding='utf-8').write(t)
print('s02 ok', "demo === 'newcard'" in t)
