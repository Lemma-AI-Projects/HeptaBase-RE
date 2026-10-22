# -*- coding: utf-8 -*-
"""演示参数：S06 直接翻面、S02 直接开 AI 面板"""
import io

p = 'src/App.tsx'
t = io.open(p, encoding='utf-8').read()
t = t.replace(
    """        <S06Review
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />""",
    """        <S06Review
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          startFlipped={route.query.get('flipped') === '1'}
        />""",
)
io.open(p, 'w', encoding='utf-8').write(t)

p2 = 'src/screens/S06-Review/S06-Review.tsx'
s = io.open(p2, encoding='utf-8').read()
s = s.replace(
    """export function S06Review({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}): JSX.Element {""",
    """export function S06Review({
  theme,
  onToggleTheme,
  startFlipped = false,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  startFlipped?: boolean
}): JSX.Element {""",
)
s = s.replace("  const [flipped, setFlipped] = useState(false)", "  const [flipped, setFlipped] = useState(startFlipped)")
io.open(p2, 'w', encoding='utf-8').write(s)

p3 = 'src/screens/S02-Whiteboard/S02-Whiteboard.tsx'
w = io.open(p3, encoding='utf-8').read()
w = w.replace(
    """    if (demo === 'edge') {""",
    """    if (demo === 'ai') {
      setRightTab('ai')
      setMessages([
        { id: 'm0', role: 'user', text: '这三张卡的共同前提是什么？' },
        {
          id: 'm1',
          role: 'assistant',
          text: '共同前提是「提取本身就是学习事件」。间隔效应、测试效应、合意困难三条，都建立在同一个动作上：把答案从记忆里重新拽出来一次。差别只在变量——间隔效应改变时间，测试效应改变方式，合意困难改变难度。',
          citations: [
            { file: 'Bjork & Bjork 2011.pdf', page: 1, paragraph: 'p3', label: 'p.1 §3' },
            { file: 'Bjork & Bjork 2011.pdf', page: 2, paragraph: 'p2', label: 'p.2 §2' },
          ],
        },
      ])
      return
    }
    if (demo === 'edge') {""",
    1,
)
io.open(p3, 'w', encoding='utf-8').write(w)
print('ok')
