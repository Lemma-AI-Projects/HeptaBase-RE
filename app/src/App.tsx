import { useEffect, useState, type JSX } from 'react'
import { navigate, useRoute } from '@/lib/hash-route'
import { addExcerptCard, getCards } from '@/lib/store'
import { S02Whiteboard } from '@/screens/S02-Whiteboard/S02-Whiteboard'
import { LabPartsWall } from '@/screens/Lab-PartsWall/Lab-PartsWall'
import { ReviewFingerprint } from '@/screens/Review-Fingerprint/Review-Fingerprint'
import { S03Card } from '@/screens/S03-Card/S03-Card'
import { S05Pdf } from '@/screens/S05-Pdf/S05-Pdf'
import s from './App.module.css'

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

  const zoomParam = route.query.get('zoom')
  const initialZoom = zoomParam ? Number(zoomParam) : undefined

  return (
    <>
      {route.path === '/lab' ? (
        <LabPartsWall />
      ) : route.path === '/fp' ? (
        <ReviewFingerprint />
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

      {route.path !== '/s02' ? (
        <nav className={s.devNav}>
          <button type="button" onClick={() => navigate('/s02')}>S02</button>
          <button type="button" onClick={() => navigate('/lab')}>零件墙</button>
          <button type="button" onClick={() => navigate('/fp')}>指纹</button>
        </nav>
      ) : null}
    </>
  )
}
