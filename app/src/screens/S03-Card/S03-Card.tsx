import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
import { AppShell } from '@/parts/C01-AppShell'
import { AppRail } from '@/parts/C02-AppRail'
import { CardInfo } from '@/parts/C34-CardInfo'
import { BlockEditor } from '@/parts/C30-BlockEditor'
import { SlashMenu } from '@/parts/C31-SlashMenu'
import { MentionMenu } from '@/parts/C32-MentionMenu'
import { BacklinksPanel } from '@/parts/C33-BacklinksPanel'
import { PropertyRow } from '@/parts/C35-PropertyRow'
import { Divider } from '@/parts/C67-Divider'
import { Button } from '@/parts/C60-Button'
import { AppTabs } from '../AppTabs'
import { navigate } from '@/lib/hash-route'
import { APPS, TAGS } from '@/lib/nav'
import {
  ARTICLE,
  BACKLINKS,
  CARD_META,
  CARD_TITLE,
  PROPERTIES,
  type Block,
  type BlockType,
} from '@/lib/blocks'
import s from './S03-Card.module.css'

type Anchor = { x: number; y: number; w: number; h: number }
type MenuState = { blockId: string; query: string; anchor: Anchor } | null

const defaults = (type: BlockType, id: string): Block => {
  switch (type) {
    case 'list':
      return { id, type, items: [''] }
    case 'todo':
      return { id, type, items: [''], checked: [false] }
    case 'table':
      return { id, type, rows: [['列 1', '列 2'], ['', '']] }
    case 'image':
      return { id, type, caption: '' }
    case 'divider':
      return { id, type }
    default:
      return { id, type, text: '' }
  }
}

export function S03Card({
  theme,
  onToggleTheme,
  startEditing = false,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  startEditing?: boolean
}): JSX.Element {
  const [editing, setEditing] = useState(startEditing)
  const [blocks, setBlocks] = useState<Block[]>(ARTICLE)
  const [past, setPast] = useState<Block[][]>([])
  const [resetKey, setResetKey] = useState(0)
  const [title, setTitle] = useState(CARD_TITLE)
  const [rightOpen, setRightOpen] = useState(true)
  const [rightTab, setRightTab] = useState<'info' | 'links' | 'toc'>('info')
  const [slash, setSlash] = useState<MenuState>(null)
  const [mention, setMention] = useState<MenuState>(null)

  const commit = useCallback(
    (next: Block[], record = true) => {
      setBlocks((prev) => {
        if (record) setPast((h) => [...h.slice(-29), prev])
        return next
      })
    },
    []
  )

  const undo = useCallback(() => {
    setPast((h) => {
      if (h.length === 0) return h
      setBlocks(h[h.length - 1])
      setResetKey((k) => k + 1)
      return h.slice(0, -1)
    })
  }, [])

  useEffect(() => {
    const q = window.location.hash.split('?')[1] ?? ''
    const menu = new URLSearchParams(q).get('menu')
    if (!menu) return
    const timer = window.setTimeout(() => {
      const el = document.querySelector('[data-demo-anchor]') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      const anchor = { x: r.x + 12, y: r.y + 8, w: 160, h: 20 }
      if (menu === 'mention') setMention({ blockId: 'b2', query: '', anchor })
      else setSlash({ blockId: 'b2', query: '', anchor })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      }
      if (e.key === 'Escape') {
        setSlash(null)
        setMention(null)
        setEditing(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo])

  const toc = useMemo(
    () => blocks.filter((b) => b.type === 'h2').map((b) => b.text ?? ''),
    [blocks]
  )

  const onSlash = (blockId: string, query: string, rect: DOMRect) =>
    setSlash({ blockId, query, anchor: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } })

  const onMention = (blockId: string, query: string, rect: DOMRect) =>
    setMention({ blockId, query, anchor: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } })

  const pickBlock = (type: BlockType) => {
    if (!slash) return
    const id = slash.blockId
    commit(blocks.map((b) => (b.id === id ? defaults(type, id) : b)))
    setResetKey((k) => k + 1)
    setSlash(null)
  }

  const pickMention = (label: string) => {
    if (!mention) return
    commit(
      blocks.map((b) =>
        b.id === mention.blockId ? { ...b, text: `${(b.text ?? '').replace(/@.*$/, '')}@${label}` } : b
      )
    )
    setResetKey((k) => k + 1)
    setMention(null)
  }

  return (
    <AppShell
      rightOpen={rightOpen}
      left={
        <AppRail
          apps={APPS}
          activeId="library"
          tags={TAGS}
          onAppSelected={(id) => (id === 'board' ? navigate('/s02') : undefined)}
        />
      }
      main={
        <>
          <AppTabs
            active="/s03"
            theme={theme}
            onToggleTheme={onToggleTheme}
            rightOpen={rightOpen}
            onToggleRight={() => setRightOpen((v) => !v)}
            extra={
              <Button
                label={editing ? '完成' : '编辑'}
                variant={editing ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setEditing((v) => !v)
                  setResetKey((k) => k + 1)
                }}
              />
            }
          />
          <div className={s.scroll}>
            <article className={s.article}>
              <div className={s.crumbs}>
                <button type="button" className={s.crumb} onClick={() => navigate('/s02')}>
                  白板
                </button>
                <span className={s.slash}>/</span>
                <span className={s.crumbCurrent}>提取练习为什么有效</span>
                {editing ? <span className={s.mode}>编辑中 · ⌘Z 撤销</span> : null}
              </div>

              <CardInfo
                title={title}
                created={CARD_META.created}
                words={CARD_META.words}
                source={CARD_META.source}
                tags={['记忆', '检索']}
                board={CARD_META.board}
                editable={editing}
                onTitleChange={setTitle}
                onBoardOpened={() => navigate('/s02')}
              />

              <Divider />

              <div className={s.body} data-demo-anchor onClick={() => setEditing(true)}>
                <BlockEditor
                  blocks={blocks}
                  editable={editing}
                  resetKey={resetKey}
                  onChange={commit}
                  onEditRequested={() => setEditing(true)}
                  onSlash={onSlash}
                  onMention={onMention}
                />
              </div>

              <footer className={s.footer}>
                <span>最后编辑 2 分钟前</span>
                <span className={s.dot} />
                <span>来自 Bjork &amp; Bjork 2011 · 第 3 页</span>
              </footer>
            </article>
          </div>

          <SlashMenu
            anchor={slash?.anchor ?? null}
            open={!!slash}
            query={slash?.query ?? ''}
            onPick={pickBlock}
            onDismiss={() => setSlash(null)}
          />
          <MentionMenu
            anchor={mention?.anchor ?? null}
            open={!!mention}
            query={mention?.query ?? ''}
            onPick={pickMention}
            onDismiss={() => setMention(null)}
          />
        </>
      }
      right={
        <div className={s.panel}>
          <div className={s.panelHead}>
            <div className={s.seg}>
              {(
                [
                  ['info', '信息'],
                  ['links', '回链'],
                  ['toc', '目录'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={rightTab === id ? s.segOn : s.segOff}
                  onClick={() => setRightTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className={s.panelBody}>
            {rightTab === 'info'
              ? PROPERTIES.map((p) => (
                  <PropertyRow key={p.id} label={p.label} type={p.type} value={p.value} editable={editing} />
                ))
              : null}
            {rightTab === 'links' ? <BacklinksPanel items={BACKLINKS} /> : null}
            {rightTab === 'toc' ? (
              <div className={s.toc}>
                {toc.map((t, i) => (
                  <button key={t} type="button" className={s.tocItem}>
                    <span className={s.tocNum}>{i + 1}</span>
                    {t}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      }
    />
  )
}
