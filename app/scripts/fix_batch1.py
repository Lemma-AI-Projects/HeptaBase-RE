import io, re

# ---------- 1) C30：编辑后保留 ==高亮== ----------
p = 'src/parts/C30-BlockEditor/C30-BlockEditor.tsx'
t = io.open(p, encoding='utf-8').read()

helper = '''
/** 把 contentEditable 的 DOM 收回成 markdown 文本：<mark> → ==x==，<br>/<div> → 换行 */
function fromHtml(el: HTMLElement): string {
  let out = ''
  const walk = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      out += (n.nodeValue ?? '').replace(/\\u00a0/g, ' ')
      return
    }
    if (!(n instanceof HTMLElement)) return
    if (n.tagName === 'BR') {
      out += '\\n'
      return
    }
    if (n.tagName === 'MARK') {
      const inner = (n.textContent ?? '').replace(/\\n/g, ' ')
      out += `==${inner}==`
      return
    }
    const blockish = n.tagName === 'DIV' || n.tagName === 'P'
    if (blockish && out && !out.endsWith('\\n')) out += '\\n'
    n.childNodes.forEach(walk)
  }
  el.childNodes.forEach(walk)
  return out.replace(/\\n+$/, '')
}
'''
t = t.replace("const caretAtStart = (el: HTMLElement) => {", helper + "\nconst caretAtStart = (el: HTMLElement) => {")

# 段落/标题/引用的输入
t = t.replace("""  const onTextInput = (block: Block, el: HTMLDivElement) => {
    const text = el.textContent ?? ''""",
"""  const onTextInput = (block: Block, el: HTMLDivElement) => {
    const text = fromHtml(el)""")

# 列表项
t = t.replace("""                          const items = [...(block.items ?? [])]
                          items[i] = el.textContent ?? ''
                          patch(block.id, { items })""",
"""                          const items = [...(block.items ?? [])]
                          items[i] = fromHtml(el)
                          patch(block.id, { items })""")
t = t.replace("""                            const items = [...(block.items ?? [])]
                            items[i] = el.textContent ?? ''
                            patch(block.id, { items })""",
"""                            const items = [...(block.items ?? [])]
                            items[i] = fromHtml(el)
                            patch(block.id, { items })""")
io.open(p, 'w', encoding='utf-8').write(t)
print('C30 ok', t.count('fromHtml('))

# ---------- 2) C36：缩放控件 ----------
p = 'src/parts/C36-PdfReader/C36-PdfReader.tsx'
t = io.open(p, encoding='utf-8').read()
t = t.replace("import { useRef, type JSX } from 'react'", "import { useRef, useState, type JSX } from 'react'")
t = t.replace("  const ref = useRef<HTMLDivElement>(null)",
"""  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const steps = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 2]
  const stepTo = (dir: -1 | 1) => {
    const i = steps.findIndex((s) => s >= zoom - 0.001)
    const j = Math.min(steps.length - 1, Math.max(0, (i < 0 ? steps.length - 1 : i) + dir))
    setZoom(steps[j])
  }""")
t = t.replace("""      <div className={s.toolbar}>
        <span className={s.file}>{file}</span>
        <span className={s.pages}>{pages.length} 页</span>
      </div>""",
"""      <div className={s.toolbar}>
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
      </div>""")
t = t.replace('      {pages.map((page) => (', '      <div className={s.sheet} style={{ zoom }}>\n      {pages.map((page) => (')
t = t.replace('      ))}\n    </div>\n  )\n}', '      ))}\n      </div>\n    </div>\n  )\n}')
io.open(p, 'w', encoding='utf-8').write(t)

p = 'src/parts/C36-PdfReader/C36-PdfReader.module.css'
c = io.open(p, encoding='utf-8').read()
c += '''
.zoomer {
  display: flex;
  align-items: center;
  gap: 2px;
}

.zoomer button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  border-radius: 5px;
  font-size: var(--fs-12);
  color: var(--c-text-2);
  font-variant-numeric: tabular-nums;
}

.zoomer button:hover:not(:disabled) {
  background: var(--c-sunken);
  color: var(--c-text);
}

.zoomer button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pct {
  min-width: 44px;
}

.sheet {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  transform-origin: top center;
}
'''
io.open(p, 'w', encoding='utf-8').write(c)
print('C36 ok')
