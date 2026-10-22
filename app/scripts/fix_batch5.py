import io

p = 'src/parts/C30-BlockEditor/C30-BlockEditor.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace("""import {
  useLayoutEffect,
  useRef,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'""",
"""import {
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'""")

anchor = """  return (
    <div className={s.doc} data-editable={editable} onClick={() => onEditRequested?.()}>"""

inject = """  /* ---------- 拖动换位 ---------- */
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
    >"""

assert anchor in t
t = t.replace(anchor, inject)

# 末尾追加手柄与插入线
old_tail = """      })}
    </div>
  )
}"""
new_tail = """      })}

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
}"""
assert old_tail in t
t = t.replace(old_tail, new_tail)
io.open(p, 'w', encoding='utf-8').write(t)

p = 'src/parts/C30-BlockEditor/C30-BlockEditor.module.css'
c = io.open(p, encoding='utf-8').read()
c = c.replace(""".doc {
  display: flex;
  flex-direction: column;
  color: var(--c-text);
}""",
""".doc {
  position: relative;
  display: flex;
  flex-direction: column;
  color: var(--c-text);
}

.grip {
  position: absolute;
  left: -26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 20px;
  height: 22px;
  border-radius: 4px;
  cursor: grab;
}

.grip:hover {
  background: var(--c-sunken);
}

.grip:active {
  cursor: grabbing;
}

.dots {
  width: 3px;
  height: 3px;
  border-radius: var(--r-full);
  background: var(--c-text-3);
}

.dropLine {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 1px;
  background: var(--c-accent);
  pointer-events: none;
}""")
io.open(p, 'w', encoding='utf-8').write(c)
print('c30 drag ok')
