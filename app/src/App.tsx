import { useEffect, useState, type JSX } from 'react'
import { navigate, useRoute } from '@/lib/hash-route'
import { addExcerptCard, getCards } from '@/lib/store'
import { S02Whiteboard } from '@/screens/S02-Whiteboard/S02-Whiteboard'
import { LabPartsWall } from '@/screens/Lab-PartsWall/Lab-PartsWall'
import { ReviewFingerprint } from '@/screens/Review-Fingerprint/Review-Fingerprint'
import { S01Today } from '@/screens/S01-Today/S01-Today'
import { S08Library } from '@/screens/S08-Library/S08-Library'
import { S09Tags } from '@/screens/S09-Tags/S09-Tags'
import { S10Journal } from '@/screens/S10-Journal/S10-Journal'
import { S11Inbox } from '@/screens/S11-Inbox/S11-Inbox'
import { CommandPalette, type Command } from '@/parts/C58-CommandPalette'
import { SearchOverlay } from '@/parts/C57-SearchOverlay'
import { ShortcutSheet } from '@/parts/C59-ShortcutSheet'
import { S06Review } from '@/screens/S06-Review/S06-Review'
import { S03Card } from '@/screens/S03-Card/S03-Card'
import { S05Pdf } from '@/screens/S05-Pdf/S05-Pdf'
import s from './App.module.css'

const COMMANDS: Command[] = [
  { id: 'review', label: '开始复习', group: '导航', shortcut: 'R' },
  { id: 'new-card', label: '新建卡片', group: '导航' },
  { id: 'library', label: '打开卡片库', group: '导航', shortcut: '⌘L' },
  { id: 'journal', label: '打开日志', group: '导航' },
  { id: 'inbox', label: '打开 Inbox', group: '导航' },
  { id: 'search', label: '全局搜索', group: '视图', shortcut: '⌘O' },
  { id: 'fit', label: '适配全板', group: '视图', shortcut: '⌘0' },
  { id: 'theme', label: '切换暗色', group: '视图' },
  { id: 'tag', label: '给选中的卡加标签', group: '数据' },
  { id: 'export', label: '导出为 Markdown', group: '数据', shortcut: '⌘E', disabled: true, reason: '原型未实现' },
  { id: 'undo', label: '撤销上一步', group: '数据', shortcut: '⌘Z', disabled: true, reason: '当前没有可撤销的操作' },
  { id: 'keys', label: '快捷键总表', group: '帮助', shortcut: '?' },
]

export function App(): JSX.Element {
  const route = useRoute()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (window.location.hash.includes('theme=dark')) return 'dark'
    if (window.location.hash.includes('theme=light')) return 'light'
    return localStorage.getItem('ls-theme') === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ls-theme', theme)
  }, [theme])

  useEffect(() => {
    if (route.query.get('seed') !== '1') return
    if (getCards().length > 0) return
    addExcerptCard({
      quote:
        'a note that restates the source is an exposure, while a note phrased as a question is a retrieval opportunity.',
      title: '注释是曝光，问题是提取',
      source: { file: 'Bjork & Bjork 2011.pdf', page: 3, paragraph: 'p2' },
      color: 'yellow',
    })
  }, [route.query])

  const [paletteOpen, setPaletteOpen] = useState(route.query.get('demo') === 'palette')
  const [searchOpen, setSearchOpen] = useState(route.query.get('demo') === 'search')
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
  }, [])

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
    if (id === 'keys') setKeysOpen(true)
  }

  const zoomParam = route.query.get('zoom')
  const initialZoom = zoomParam ? Number(zoomParam) : undefined

  return (
    <>
      {route.path === '/lab' ? (
        <LabPartsWall />
      ) : route.path === '/fp' ? (
        <ReviewFingerprint />
      ) : route.path === '/s01' ? (
        <S01Today
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      ) : route.path === '/s06' ? (
        <S06Review
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          startFlipped={route.query.get('flipped') === '1'}
        />
      ) : route.path === '/s08' ? (
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
      ) : route.path === '/s03' || route.path === '/s04' ? (
        <S03Card
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          startEditing={route.path === '/s04'}
        />
      ) : route.path === '/s05' ? (
        <S05Pdf
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          demo={route.query.get('demo') ?? undefined}
        />
      ) : (
        <S02Whiteboard
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          initialZoom={Number.isFinite(initialZoom) ? initialZoom : undefined}
          autoFit={route.query.get('fit') === '1'}
          stress={route.query.get('stress') === '1'}
          demo={route.query.get('demo') ?? undefined}
        />
      )}

      <CommandPalette
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
      <ShortcutSheet open={keysOpen} onClose={() => setKeysOpen(false)} />

      {route.path !== '/s02' ? (
        <nav className={s.devNav}>
          <button type="button" onClick={() => navigate('/s02')}>S02</button>
          <button type="button" onClick={() => navigate('/lab')}>零件墙</button>
          <button type="button" onClick={() => navigate('/fp')}>指纹</button>
          <button type="button" onClick={() => setKeysOpen(true)}>?</button>
        </nav>
      ) : null}
    </>
  )
}
