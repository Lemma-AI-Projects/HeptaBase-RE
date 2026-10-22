import io

p = 'src/screens/S02-Whiteboard/S02-Whiteboard.tsx'
t = io.open(p, encoding='utf-8').read()

# 1) props 加 sub
t = t.replace("""  stress = false,
  demo,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  initialZoom?: number
  autoFit?: boolean
  stress?: boolean
  demo?: string
}): JSX.Element {""",
"""  stress = false,
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
}): JSX.Element {""")

# 2) 子板派生：可见分区 / 可见对象
t = t.replace("""  const { w: stageW, h: stageH } = stageSize()""",
"""  const subSec = sub ? board.sections.find((x) => x.id === sub) ?? null : null
  const visSections = subSec ? [] : board.sections
  const visObjs = subSec ? board.objs.filter((o) => o.sectionId === subSec.id) : board.objs
  const visEdges = subSec ? [] : board.edges

  const { w: stageW, h: stageH } = stageSize()""")

# 3) 子板视口：进子板时套住该分区
t = t.replace("""    if (autoFit) {
      fit()
      return
    }""",
"""    if (subSec) {
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
    }""")

# 4) 双击分区：进子板（折叠改由 HUD 或右键菜单）
t = t.replace("""                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    run((b) => {
                      const target = b.sections.find((x) => x.id === sec.id)
                      if (target) target.collapsed = !target.collapsed
                      return b
                    })
                  }}""",
"""                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    navigate(`/s02?sub=${sec.id}`)
                  }}""")

# 5) 渲染用 vis*
t = t.replace("              {board.sections.map((sec) => (", "              {visSections.map((sec) => (")
t = t.replace("              {board.objs.map((o) => {", "              {visObjs.map((o) => {")
t = t.replace("                {board.edges.map((ed) => {", "                {visEdges.map((ed) => {")
io.open(p, 'w', encoding='utf-8').write(t)
print('s02 sub ok')

# 6) App 传 sub
p = 'src/App.tsx'
t = io.open(p, encoding='utf-8').read()
t = t.replace("          demo={route.query.get('demo') ?? undefined}\n        />\n      )}",
              "          demo={route.query.get('demo') ?? undefined}\n          sub={route.query.get('sub') ?? undefined}\n        />\n      )}")
io.open(p, 'w', encoding='utf-8').write(t)
print('app sub ok', 'sub={' in t)
