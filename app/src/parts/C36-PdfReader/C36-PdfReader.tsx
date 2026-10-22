import { useRef, useState, type JSX } from 'react'
import type { PdfPage } from '@/lib/pdf-pages'
import s from './C36-PdfReader.module.css'

export type PdfSelection = {
  text: string
  page: number
  paragraph: string
  rect: { x: number; y: number; w: number; h: number }
}

export function PdfReader({
  file,
  title,
  pages,
  highlights,
  onSelection,
}: {
  file: string
  title: string
  pages: PdfPage[]
  highlights?: Record<string, string>
  onSelection?: (sel: PdfSelection | null) => void
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const steps = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 2]
  const stepTo = (dir: -1 | 1) => {
    const i = steps.findIndex((s) => s >= zoom - 0.001)
    const j = Math.min(steps.length - 1, Math.max(0, (i < 0 ? steps.length - 1 : i) + dir))
    setZoom(steps[j])
  }

  const handleUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !ref.current) {
      onSelection?.(null)
      return
    }
    const text = sel.toString().trim()
    if (!text) {
      onSelection?.(null)
      return
    }
    let node: Node | null = sel.anchorNode
    while (node && node !== ref.current) {
      if (node instanceof HTMLElement && node.dataset.paragraph) break
      node = node.parentNode
    }
    if (!(node instanceof HTMLElement)) {
      onSelection?.(null)
      return
    }
    const r = sel.getRangeAt(0).getBoundingClientRect()
    onSelection?.({
      text,
      page: Number(node.dataset.page),
      paragraph: node.dataset.paragraph ?? 'p1',
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    })
  }

  return (
    <div className={s.reader} ref={ref} onMouseUp={handleUp}>
      <div className={s.toolbar}>
        <span className={s.file}>{file}</span>
        <div className={s.zoomer}>
          <button type="button" onClick={() => stepTo(-1)} aria-label="缩小" disabled={zoom <= 0.5}>
            −
          </button>
          <button type="button" className={s.pct} onClick={() => setZoom(1)} title="回到 100%">
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" onClick={() => stepTo(1)} aria-label="放大" disabled={zoom >= 2}>
            +
          </button>
          <span className={s.pages}>{pages.length} 页</span>
        </div>
      </div>

      <div className={s.sheet} style={{ zoom }}>
      {pages.map((page) => (
        <article key={page.page} className={s.page}>
          <header className={s.running}>
            <span>BJORK &amp; BJORK (2011)</span>
            <span>{page.page}</span>
          </header>
          {page.page === 1 ? <h1 className={s.title}>{title}</h1> : null}
          {page.paragraphs.map((p) => {
            const hl = highlights?.[`${page.page}:${p.id}`]
            return (
              <p
                key={p.id}
                className={s.p}
                data-page={page.page}
                data-paragraph={p.id}
                style={hl ? { background: hl } : undefined}
              >
                {p.text}
              </p>
            )
          })}
          <footer className={s.footer}>{page.page}</footer>
        </article>
      ))}
      </div>
    </div>
  )
}
