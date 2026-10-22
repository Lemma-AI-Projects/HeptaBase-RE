import { useEffect, useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { PdfReader, type PdfSelection } from '@/parts/C36-PdfReader'
import { HighlightToolbar } from '@/parts/C37-HighlightToolbar'
import { Popover } from '@/parts/C63-Popover'
import { Input } from '@/parts/C62-Input'
import { Button } from '@/parts/C60-Button'
import { IconButton } from '@/parts/C61-IconButton'
import { Divider } from '@/parts/C67-Divider'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS } from '@/lib/nav'
import { PDF } from '@/lib/pdf-pages'
import { addExcerptCard, useExcerpts } from '@/lib/store'
import s from './S05-Pdf.module.css'

const HL_RGBA: Record<string, string> = {
  yellow: 'rgba(192, 160, 74, 0.26)',
  green: 'rgba(111, 154, 106, 0.24)',
  blue: 'rgba(92, 134, 184, 0.22)',
  red: 'rgba(192, 112, 102, 0.22)',
}

export function S05Pdf({
  theme,
  onToggleTheme,
  demo,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  demo?: string
}): JSX.Element {
  const [rightOpen, setRightOpen] = useState(true)
  const [selection, setSelection] = useState<PdfSelection | null>(null)
  const [color, setColor] = useState('yellow')
  const [highlights, setHighlights] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState<{ title: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const excerpts = useExcerpts()

  useEffect(() => {
    if (!demo) return
    const id = window.setTimeout(() => {
      const el = document.querySelector('[data-page="3"][data-paragraph="p2"]') as HTMLElement | null
      if (!el) return
      el.scrollIntoView({ block: 'center' })
      setHighlights((h) => ({ ...h, '3:p2': HL_RGBA.yellow }))
      window.setTimeout(() => {
        const r = el.getBoundingClientRect()
        setSelection({
          text: (el.textContent ?? '').trim(),
          page: 3,
          paragraph: 'p2',
          rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        })
        if (demo === 'draft') setDraft({ title: '注释是曝光，问题是提取' })
      }, 120)
    }, 500)
    return () => window.clearTimeout(id)
  }, [demo])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  const confirm = () => {
    if (!selection || !draft) return
    addExcerptCard({
      quote: selection.text,
      title: draft.title,
      source: { file: PDF.file, page: selection.page, paragraph: selection.paragraph },
      color: 'yellow',
    })
    setHighlights((h) => ({ ...h, [`${selection.page}:${selection.paragraph}`]: HL_RGBA[color] }))
    setDraft(null)
    setSelection(null)
    setToast('已放到白板 · 新摘录')
  }

  return (
    <AppShell
      rightOpen={rightOpen}
      left={
        <AppRail
          apps={APPS}
          activeId="highlight"
          tags={TAGS}
          onAppSelected={(id) => (id === 'board' ? navigate('/s02') : undefined)}
        />
      }
      main={
        <>
          <AppTabs
            active="/s05"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={rightOpen}
            onToggleRight={() => setRightOpen((v) => !v)}
          />
          <div className={s.stage}>
            <PdfReader
              file={PDF.file}
              title={PDF.title}
              pages={PDF.pages}
              highlights={highlights}
              onSelection={(sel) => {
                setSelection(sel)
                setDraft(null)
              }}
            />
          </div>

          {selection && !draft ? (
            <HighlightToolbar
              rect={selection.rect}
              activeColor={color}
              onColor={(c) => {
                setColor(c)
                setHighlights((h) => ({
                  ...h,
                  [`${selection.page}:${selection.paragraph}`]: HL_RGBA[c],
                }))
              }}
              onExcerpt={() => setDraft({ title: selection.text.slice(0, 18) })}
              onNote={() => setToast('加注：原型未实现')}
              onAi={() => setToast('AI 解释：原型未实现')}
              onDismiss={() => setSelection(null)}
            />
          ) : null}

          <Popover
            anchor={selection?.rect ?? null}
            open={!!draft}
            width={340}
            onDismiss={() => setDraft(null)}
          >
            <div className={s.draft}>
              <div className={s.draftHead}>摘录成卡</div>
              <Input
                value={draft?.title ?? ''}
                placeholder="卡片标题"
                onChange={(v) => setDraft((d) => ({ title: v, ...(d ?? {}) }))}
              />
              <p className={s.quote}>{selection?.text}</p>
              <div className={s.source}>
                {PDF.file} · 第 {selection?.page} 页 · {selection?.paragraph}
              </div>
              <div className={s.draftActions}>
                <Button label="取消" variant="ghost" size="sm" onClick={() => setDraft(null)} />
                <Button label="确认落板" variant="primary" size="sm" onClick={confirm} />
              </div>
            </div>
          </Popover>

          {toast ? <div className={s.toast}>{toast}</div> : null}
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span>摘录 · {excerpts.length}</span>
            <IconButton
              icon="board"
              size="sm"
              tooltip="去白板看"
              onClick={() => navigate('/s02')}
            />
          </div>
          <Divider />
          <div className={s.panelBody}>
            {excerpts.length === 0 ? (
              <p className={s.empty}>
                在左边划一段话，点「摘录成卡」。卡片会自动带上文件、页码和段落。
              </p>
            ) : (
              excerpts
                .slice()
                .reverse()
                .map((e) => (
                  <div key={e.id} className={s.excerpt}>
                    <span className={s.colorDot} data-color={e.color} />
                    <p className={s.excerptText}>{e.quote}</p>
                    <span className={s.excerptSrc}>
                      {e.source.file} · p.{e.source.page}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      }
    />
  )
}
