import { useRef, type JSX } from 'react'
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
        <span className={s.pages}>{pages.length} 页</span>
      </div>

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
  )
}
