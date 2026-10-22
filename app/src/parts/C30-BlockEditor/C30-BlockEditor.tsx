import {
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { Block } from '@/lib/blocks'
import { Inline } from '@/lib/renderInline'
import { CurvesSvg } from '@/fixtures/assets/CurvesSvg'
import s from './C30-BlockEditor.module.css'

export type BlockEditorProps = {
  blocks: Block[]
  editable?: boolean
  resetKey?: number
  onChange?: (blocks: Block[]) => void
  onEditRequested?: () => void
  onSlash?: (blockId: string, query: string, anchor: DOMRect) => void
  onMention?: (blockId: string, query: string, anchor: DOMRect) => void
}

const toHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .split(/(==[^=]+==)/g)
    .map((part) =>
      part.startsWith('==') && part.endsWith('==') ? `<mark>${part.slice(2, -2)}</mark>` : part
    )
    .join('')
    .replace(/\n/g, '<br>')

function Editable({
  html,
  className,
  placeholder,
  resetKey,
  onInput,
  onKeyDown,
}: {
  html: string
  className?: string
  placeholder?: string
  resetKey: number
  onInput: (el: HTMLDivElement) => void
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>, el: HTMLDivElement) => void
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  // 只在挂载与撤销时重置 DOM，避免每次输入都把光标顶回开头
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (ref.current) ref.current.innerHTML = html
  }, [resetKey])

  return (
    <div
      ref={ref}
      className={`${s.edit} ${className ?? ''}`}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder ?? ''}
      onInput={(e) => onInput(e.currentTarget)}
      onKeyDown={(e) => onKeyDown(e, e.currentTarget)}
    />
  )
}


/** 把 contentEditable 的 DOM 收回成 markdown 文本：<mark> → ==x==，<br>/<div> → 换行 */
function fromHtml(el: HTMLElement): string {
  let out = ''
  const walk = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      out += (n.nodeValue ?? '').replace(/\u00a0/g, ' ')
      return
    }
    if (!(n instanceof HTMLElement)) return
    if (n.tagName === 'BR') {
      out += '\n'
      return
    }
    if (n.tagName === 'MARK') {
      const inner = (n.textContent ?? '').replace(/\n/g, ' ')
      out += `==${inner}==`
      return
    }
    const blockish = n.tagName === 'DIV' || n.tagName === 'P'
    if (blockish && out && !out.endsWith('\n')) out += '\n'
    n.childNodes.forEach(walk)
  }
  el.childNodes.forEach(walk)
  return out.replace(/\n+$/, '')
}

const caretAtStart = (el: HTMLElement) => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false
  const r = sel.getRangeAt(0).cloneRange()
  r.selectNodeContents(el)
  r.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset)
  return r.toString().length === 0
}

const splitAtCaret = (el: HTMLElement) => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return { before: el.textContent ?? '', after: '' }
  const range = sel.getRangeAt(0)
  const before = range.cloneRange()
  before.selectNodeContents(el)
  before.setEnd(range.startContainer, range.startOffset)
  const after = range.cloneRange()
  after.selectNodeContents(el)
  after.setStart(range.endContainer, range.endOffset)
  return { before: before.toString(), after: after.toString() }
}

export function BlockEditor({
  blocks,
  editable = false,
  resetKey = 0,
  onChange,
  onEditRequested,
  onSlash,
  onMention,
}: BlockEditorProps): JSX.Element {
  const commit = (next: Block[]) => onChange?.(next)
  const idx = (id: string) => blocks.findIndex((b) => b.id === id)

  const patch = (id: string, p: Partial<Block>) =>
    commit(blocks.map((b) => (b.id === id ? { ...b, ...p } : b)))

  const insertAfter = (id: string, block: Block) => {
    const i = idx(id)
    const next = [...blocks]
    next.splice(i + 1, 0, block)
    commit(next)
  }

  const remove = (id: string) => commit(blocks.filter((b) => b.id !== id))

  const onTextInput = (block: Block, el: HTMLDivElement) => {
    const text = fromHtml(el)
    if (text === '/') {
      onSlash?.(block.id, '', el.getBoundingClientRect())
      return
    }
    if (text.startsWith('/')) {
      onSlash?.(block.id, text.slice(1), el.getBoundingClientRect())
      return
    }
    if (text === '@') {
      onMention?.(block.id, '', el.getBoundingClientRect())
      return
    }
    if (text.startsWith('@')) {
      onMention?.(block.id, text.slice(1), el.getBoundingClientRect())
      return
    }
    patch(block.id, { text })
  }

  const onTextKey = (e: ReactKeyboardEvent<HTMLDivElement>, block: Block, el: HTMLDivElement) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const { before, after } = splitAtCaret(el)
      patch(block.id, { text: before })
      insertAfter(block.id, { id: `b${Date.now()}`, type: 'p', text: after })
      return
    }
    if (e.key === 'Backspace' && caretAtStart(el)) {
      const i = idx(block.id)
      if (i <= 0) return
      e.preventDefault()
      const prev = blocks[i - 1]
      if (prev.type === 'p' || prev.type === 'h2' || prev.type === 'quote') {
        commit(
          blocks
            .map((b) =>
              b.id === prev.id ? { ...b, text: `${b.text ?? ''}${block.text ?? ''}` } : b
            )
            .filter((b) => b.id !== block.id)
        )
      } else {
        remove(block.id)
      }
      return
    }
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      const i = idx(block.id)
      const j = e.key === 'ArrowUp' ? i - 1 : i + 1
      if (j < 0 || j >= blocks.length) return
      const next = [...blocks]
      ;[next[i], next[j]] = [next[j], next[i]]
      commit(next)
    }
  }

  const onItemKey = (
    block: Block,
    i: number,
    e: ReactKeyboardEvent<HTMLDivElement>,
    el: HTMLDivElement
  ) => {
    const items = block.items ?? []
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const next = [...items]
      next.splice(i + 1, 0, splitAtCaret(el).after)
      patch(block.id, { items: next })
      return
    }
    if (e.key === 'Backspace' && caretAtStart(el) && items.length > 1) {
      e.preventDefault()
      const next = [...items]
      next.splice(i, 1)
      patch(block.id, { items: next })
    }
  }

  /* ---------- 拖动换位 ---------- */
  const docRef = useRef<HTMLDivElement>(null)
  const [grip, setGrip] = useState<{ top: number; blockId: string } | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [dropTop, setDropTop] = useState(0)

  const blockEls = (): HTMLElement[] => {
    const doc = docRef.current
    if (!doc) return []
    return Array.from(doc.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && !el.dataset.role
    )
  }

  const onDocMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!editable || dragId) return
    const doc = docRef.current
    if (!doc) return
    let el = e.target as HTMLElement | null
    while (el && el.parentElement !== doc) el = el.parentElement
    if (!el || el.dataset.role) {
      setGrip(null)
      return
    }
    const i = blockEls().indexOf(el)
    if (i < 0) {
      setGrip(null)
      return
    }
    setGrip({ top: el.offsetTop + 2, blockId: blocks[i].id })
  }

  const onDocDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!dragId) return
    e.preventDefault()
    const doc = docRef.current
    if (!doc) return
    const els = blockEls()
    if (els.length === 0) return
    const y = e.clientY - doc.getBoundingClientRect().top
    let idx = els.length
    for (let i = 0; i < els.length; i++) {
      if (y < els[i].offsetTop + els[i].offsetHeight / 2) {
        idx = i
        break
      }
    }
    const last = els[els.length - 1]
    setDropIndex(idx)
    setDropTop(idx < els.length ? els[idx].offsetTop - 4 : last.offsetTop + last.offsetHeight + 2)
  }

  const onDocDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!dragId || dropIndex === null) return
    e.preventDefault()
    const from = blocks.findIndex((b) => b.id === dragId)
    setDragId(null)
    setDropIndex(null)
    if (from < 0) return
    const next = [...blocks]
    const [moved] = next.splice(from, 1)
    const insert = from < dropIndex ? dropIndex - 1 : dropIndex
    if (insert === from) return
    next.splice(insert, 0, moved)
    commit(next)
  }

  return (
    <div
      className={s.doc}
      data-editable={editable}
      ref={docRef}
      onClick={() => onEditRequested?.()}
      onMouseMove={onDocMove}
      onMouseLeave={() => setGrip(null)}
      onDragOver={onDocDragOver}
      onDrop={onDocDrop}
    >
      {blocks.map((block) => {
        const text = block.text ?? ''
        switch (block.type) {
          case 'h2':
            return editable ? (
              <Editable
                key={block.id}
                className={s.h2}
                html={toHtml(text)}
                placeholder="小标题"
                resetKey={resetKey}
                onInput={(el) => onTextInput(block, el)}
                onKeyDown={(e, el) => onTextKey(e, block, el)}
              />
            ) : (
              <h2 key={block.id} className={s.h2}>
                <Inline text={text} />
              </h2>
            )
          case 'p':
            return editable ? (
              <Editable
                key={block.id}
                className={s.p}
                html={toHtml(text)}
                placeholder="写点什么，或按 / 插入"
                resetKey={resetKey}
                onInput={(el) => onTextInput(block, el)}
                onKeyDown={(e, el) => onTextKey(e, block, el)}
              />
            ) : (
              <p key={block.id} className={s.p}>
                <Inline text={text} />
              </p>
            )
          case 'quote':
            return editable ? (
              <Editable
                key={block.id}
                className={s.quote}
                html={toHtml(text)}
                placeholder="引用"
                resetKey={resetKey}
                onInput={(el) => onTextInput(block, el)}
                onKeyDown={(e, el) => onTextKey(e, block, el)}
              />
            ) : (
              <blockquote key={block.id} className={s.quote}>
                <Inline text={text} />
              </blockquote>
            )
          case 'list':
            return (
              <ul key={block.id} className={s.list}>
                {(block.items ?? []).map((item, i) => (
                  <li key={i}>
                    {editable ? (
                      <Editable
                        className={s.liText}
                        html={toHtml(item)}
                        resetKey={resetKey}
                        onInput={(el) => {
                          const items = [...(block.items ?? [])]
                          items[i] = fromHtml(el)
                          patch(block.id, { items })
                        }}
                        onKeyDown={(e, el) => onItemKey(block, i, e, el)}
                      />
                    ) : (
                      <span className={s.liText}>
                        <Inline text={item} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )
          case 'todo':
            return (
              <ul key={block.id} className={s.todo}>
                {(block.items ?? []).map((item, i) => {
                  const checked = block.checked?.[i] ?? false
                  return (
                    <li key={i} data-checked={checked}>
                      <button
                        type="button"
                        className={s.check}
                        aria-label={checked ? '取消完成' : '标记完成'}
                        onClick={(e) => {
                          e.stopPropagation()
                          const next = [...(block.checked ?? [])]
                          next[i] = !checked
                          patch(block.id, { checked: next })
                        }}
                      >
                        {checked ? <span className={s.tick} /> : null}
                      </button>
                      {editable ? (
                        <Editable
                          className={s.liText}
                          html={toHtml(item)}
                          resetKey={resetKey}
                          onInput={(el) => {
                            const items = [...(block.items ?? [])]
                            items[i] = fromHtml(el)
                            patch(block.id, { items })
                          }}
                          onKeyDown={(e, el) => onItemKey(block, i, e, el)}
                        />
                      ) : (
                        <span className={s.liText}>
                          <Inline text={item} />
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )
          case 'code':
            return (
              <pre key={block.id} className={s.code}>
                {editable ? (
                  <Editable
                    html={toHtml(text)}
                    resetKey={resetKey}
                    onInput={(el) => onTextInput(block, el)}
                    onKeyDown={(e, el) => onTextKey(e, block, el)}
                  />
                ) : (
                  text
                )}
              </pre>
            )
          case 'table':
            return (
              <table key={block.id} className={s.table}>
                <tbody>
                  {(block.rows ?? []).map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) =>
                        r === 0 ? (
                          <th key={c}>{cell}</th>
                        ) : (
                          <td key={c}>{cell}</td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          case 'image':
            return (
              <figure key={block.id} className={s.figure}>
                <div className={s.imageFrame}>
                  <CurvesSvg />
                </div>
                <figcaption>{block.caption}</figcaption>
              </figure>
            )
          default:
            return <hr key={block.id} className={s.hr} />
        }
      })}

      {editable && grip ? (
        <div
          className={s.grip}
          data-role="grip"
          style={{ top: grip.top }}
          draggable
          title="拖动换位"
          onDragStart={(e) => {
            setDragId(grip.blockId)
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', grip.blockId)
          }}
          onDragEnd={() => {
            setDragId(null)
            setDropIndex(null)
          }}
        >
          <span className={s.dots} />
          <span className={s.dots} />
          <span className={s.dots} />
        </div>
      ) : null}

      {editable && dragId && dropIndex !== null ? (
        <div className={s.dropLine} data-role="line" style={{ top: dropTop }} />
      ) : null}
    </div>
  )
}
