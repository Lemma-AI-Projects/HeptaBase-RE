import io

p = 'src/App.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace("import { SearchOverlay } from '@/parts/C57-SearchOverlay'",
"import { SearchOverlay } from '@/parts/C57-SearchOverlay'\nimport { ShortcutSheet } from '@/parts/C59-ShortcutSheet'")

# 命令表：去掉没绑的 N，keys 改为可用
t = t.replace("{ id: 'new-card', label: '新建卡片', group: '导航', shortcut: 'N' },",
              "{ id: 'new-card', label: '新建卡片', group: '导航' },")
t = t.replace("{ id: 'keys', label: '快捷键总表', group: '帮助', shortcut: '?', disabled: true, reason: '原型未实现' },",
              "{ id: 'keys', label: '快捷键总表', group: '帮助', shortcut: '?' },")

t = t.replace("  const [searchOpen, setSearchOpen] = useState(route.query.get('demo') === 'search')",
"""  const [searchOpen, setSearchOpen] = useState(route.query.get('demo') === 'search')
  const [keysOpen, setKeysOpen] = useState(route.query.get('demo') === 'keys')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        !!el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable)
      if (typing) return
      if (e.key === '?') {
        e.preventDefault()
        setKeysOpen(true)
      }
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        navigate('/s08')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])""")

t = t.replace("    if (id === 'tag') navigate('/s08')",
"    if (id === 'tag') navigate('/s08')\n    if (id === 'keys') setKeysOpen(true)")

t = t.replace("""      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenCard={() => navigate('/s03')}
        onOpenBoard={() => navigate('/s02')}
      />""",
"""      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenCard={() => navigate('/s03')}
        onOpenBoard={() => navigate('/s02')}
      />
      <ShortcutSheet open={keysOpen} onClose={() => setKeysOpen(false)} />""")

t = t.replace("""          <button type="button" onClick={() => navigate('/fp')}>指纹</button>""",
"""          <button type="button" onClick={() => navigate('/fp')}>指纹</button>
          <button type="button" onClick={() => setKeysOpen(true)}>?</button>""")
io.open(p, 'w', encoding='utf-8').write(t)
print('app ok', t.count('ShortcutSheet'))
