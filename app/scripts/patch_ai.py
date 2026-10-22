# -*- coding: utf-8 -*-
"""给 S02 右栏加 AI 面板；S01 支持 R 键开始复习"""
import io

p = 'src/screens/S02-Whiteboard/S02-Whiteboard.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace(
    "import { EdgeHUD } from '@/parts/C23-EdgeHUD'",
    "import { EdgeHUD } from '@/parts/C23-EdgeHUD'\n"
    "import { AiChatPanel, type ChatMessage } from '@/parts/C44-AiChatPanel'\n"
    "import { AI_SCRIPT, addQuestion } from '@/lib/learning'\n"
    "import { addExcerptCard } from '@/lib/store'",
)

t = t.replace(
    "  const [edgeDrag, setEdgeDrag] = useState<{ id: string; which: 'from' | 'to'; x: number; y: number } | null>(null)",
    "  const [edgeDrag, setEdgeDrag] = useState<{ id: string; which: 'from' | 'to'; x: number; y: number } | null>(null)\n"
    "  const [rightTab, setRightTab] = useState<'info' | 'ai'>('info')\n"
    "  const [messages, setMessages] = useState<ChatMessage[]>([\n"
    "    { id: 'm0', role: 'user', text: '这三张卡的共同前提是什么？' },\n"
    "  ])\n"
    "  const [aiStreaming, setAiStreaming] = useState(false)\n"
    "  const [toast, setToast] = useState<string | null>(null)",
)

# 手写：AI 交互
t = t.replace(
    "  /* ---------- 键盘 ---------- */",
    """  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(id)
  }, [toast])

  const askAi = (text: string) => {
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text }])
    window.setTimeout(() => {
      const answer = AI_SCRIPT[1]
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: 'assistant', text: answer.text, citations: answer.citations },
      ])
      setAiStreaming(true)
      window.setTimeout(() => setAiStreaming(false), 1300)
    }, 320)
  }

  const excerptFromAi = (text: string) => {
    addExcerptCard({
      quote: text.slice(0, 80),
      title: '来自 AI 的回答',
      source: { file: 'AI 对话', page: 0, paragraph: 'board' },
      color: 'blue',
    })
    setToast('已拖到白板 · 新摘录')
  }

  const quizMe = () => {
    const id = `g${Date.now()}`
    addQuestion({
      id,
      front: '目标保留率从 80% 提到 90%，复习量大概翻几倍？',
      back: '约两倍。可提取性每次都要被拉回目标值，目标越高，间隔越短、次数越多；这是成本旋钮，不是越高越好。',
      source: { file: 'FSRS 文档', page: 1, paragraph: 'p1' },
      tag: '排程',
    })
    setToast('已加入复习队列 · 1 张')
  }

  /* ---------- 键盘 ---------- */""",
    1,
)

old_head = """          <div className={s.panelHead}>
            <span>白板信息</span>
            <IconButton icon="close" size="sm" tooltip="收起" onClick={() => setRightOpen(false)} />
          </div>
          <Divider />
          <div className={s.panelBody}>"""
new_head = """          <div className={s.panelHead}>
            <div className={s.segs}>
              <button
                type="button"
                className={rightTab === 'info' ? s.segOn : s.segOff}
                onClick={() => setRightTab('info')}
              >
                信息
              </button>
              <button
                type="button"
                className={rightTab === 'ai' ? s.segOn : s.segOff}
                onClick={() => setRightTab('ai')}
              >
                AI
              </button>
            </div>
            <IconButton icon="close" size="sm" tooltip="收起" onClick={() => setRightOpen(false)} />
          </div>
          <Divider />
          {rightTab === 'ai' ? (
            <AiChatPanel
              messages={messages}
              streaming={aiStreaming}
              onSend={askAi}
              onCite={() => navigate('/s05')}
              onExcerpt={(m) => excerptFromAi(m.text)}
              onQuiz={quizMe}
            />
          ) : null}
          <div className={s.panelBody} style={rightTab === 'ai' ? { display: 'none' } : undefined}>"""
assert old_head in t, 'panel head not found'
t = t.replace(old_head, new_head)

t = t.replace(
    "            {menu ? (\n              <ContextMenu",
    "            {toast ? <div className={s.toast}>{toast}</div> : null}\n\n            {menu ? (\n              <ContextMenu",
)

io.open(p, 'w', encoding='utf-8').write(t)

# 样式
css = 'src/screens/S02-Whiteboard/S02-Whiteboard.module.css'
c = io.open(css, encoding='utf-8').read()
c += """
.segs {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: var(--r-2);
  background: var(--c-sunken);
}

.segOn,
.segOff {
  height: 22px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: var(--fs-12);
}

.segOn {
  background: var(--c-panel);
  color: var(--c-text);
  box-shadow: var(--sh-1);
}

.segOff {
  color: var(--c-text-2);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 76px;
  transform: translateX(-50%);
  z-index: 80;
  height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 var(--sp-3);
  border-radius: var(--r-full);
  background: var(--c-text);
  color: var(--c-panel);
  font-size: var(--fs-12);
  box-shadow: var(--sh-2);
}
"""
io.open(css, 'w', encoding='utf-8').write(c)

# S01 键盘 R
p2 = 'src/screens/S01-Today/S01-Today.tsx'
s = io.open(p2, encoding='utf-8').read()
s = s.replace(
    "import { type JSX } from 'react'",
    "import { useEffect, type JSX } from 'react'",
)
s = s.replace(
    "  const queue = useReview()",
    """  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') navigate('/s06')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const queue = useReview()""",
)
io.open(p2, 'w', encoding='utf-8').write(s)

print('patched')
