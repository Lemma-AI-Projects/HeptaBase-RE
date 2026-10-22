# -*- coding: utf-8 -*-
import io

p = 'src/App.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace(
    "import { S01Today } from '@/screens/S01-Today/S01-Today'",
    "import { S01Today } from '@/screens/S01-Today/S01-Today'\n"
    "import { S08Library } from '@/screens/S08-Library/S08-Library'\n"
    "import { S09Tags } from '@/screens/S09-Tags/S09-Tags'\n"
    "import { S10Journal } from '@/screens/S10-Journal/S10-Journal'\n"
    "import { S11Inbox } from '@/screens/S11-Inbox/S11-Inbox'\n"
    "import { CommandPalette, type Command } from '@/parts/C58-CommandPalette'\n"
    "import { SearchOverlay } from '@/parts/C57-SearchOverlay'",
)

t = t.replace(
    "export function App(): JSX.Element {",
    """const COMMANDS: Command[] = [
  { id: 'review', label: '开始复习', group: '导航', shortcut: 'R' },
  { id: 'new-card', label: '新建卡片', group: '导航', shortcut: 'N' },
  { id: 'library', label: '打开卡片库', group: '导航', shortcut: '⌘L' },
  { id: 'journal', label: '打开日志', group: '导航' },
  { id: 'inbox', label: '打开 Inbox', group: '导航' },
  { id: 'search', label: '全局搜索', group: '视图', shortcut: '⌘O' },
  { id: 'fit', label: '适配全板', group: '视图', shortcut: '⌘0' },
  { id: 'theme', label: '切换暗色', group: '视图' },
  { id: 'tag', label: '给选中的卡加标签', group: '数据' },
  { id: 'export', label: '导出为 Markdown', group: '数据', shortcut: '⌘E', disabled: true, reason: '原型未实现' },
  { id: 'undo', label: '撤销上一步', group: '数据', shortcut: '⌘Z', disabled: true, reason: '当前没有可撤销的操作' },
  { id: 'keys', label: '快捷键总表', group: '帮助', shortcut: '?', disabled: true, reason: '原型未实现' },
]

export function App(): JSX.Element {""",
)

t = t.replace(
    "  const zoomParam = route.query.get('zoom')",
    """  const [paletteOpen, setPaletteOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      if (mod && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const runCommand = (id: string) => {
    setPaletteOpen(false)
    if (id === 'review') navigate('/s06')
    if (id === 'new-card') navigate('/s02')
    if (id === 'library') navigate('/s08')
    if (id === 'journal') navigate('/s10')
    if (id === 'inbox') navigate('/s11')
    if (id === 'search') setSearchOpen(true)
    if (id === 'fit') navigate('/s02?fit=1')
    if (id === 'theme') setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    if (id === 'tag') navigate('/s08')
  }

  const zoomParam = route.query.get('zoom')""",
)

t = t.replace(
    """      ) : route.path === '/s03' || route.path === '/s04' ? (""",
    """      ) : route.path === '/s08' ? (
        <S08Library
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      ) : route.path === '/s09' ? (
        <S09Tags
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      ) : route.path === '/s10' ? (
        <S10Journal
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      ) : route.path === '/s11' ? (
        <S11Inbox
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      ) : route.path === '/s03' || route.path === '/s04' ? (""",
)

t = t.replace(
    """      {route.path !== '/s02' ? (""",
    """      <CommandPalette
        open={paletteOpen}
        commands={COMMANDS}
        onRun={runCommand}
        onClose={() => setPaletteOpen(false)}
      />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenCard={() => navigate('/s03')}
        onOpenBoard={() => navigate('/s02')}
      />

      {route.path !== '/s02' ? (""",
)

io.open(p, 'w', encoding='utf-8').write(t)

# nav 里补日志/Inbox tab？保持 tab 数量不变，只把标题补进 AppTabs 的 active 之外
print('ok')
