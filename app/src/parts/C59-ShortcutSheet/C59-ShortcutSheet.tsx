import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { IconButton } from '../C61-IconButton/C61-IconButton'
import s from './C59-ShortcutSheet.module.css'

type Row = { keys: string[]; label: string }
type Section = { group: string; note?: string; rows: Row[] }

/** 总表里的每一条都在代码里真的绑定过；未实现的不列 */
export const SHORTCUTS: Section[] = [
  {
    group: '全局',
    rows: [
      { keys: ['⌘', 'K'], label: '命令面板' },
      { keys: ['⌘', 'O'], label: '全局搜索' },
      { keys: ['?'], label: '这份总表' },
      { keys: ['Esc'], label: '关掉浮层 / 取消选择' },
    ],
  },
  {
    group: '白板',
    note: 'S02',
    rows: [
      { keys: ['拖'], label: '移动卡片（多选一起动）' },
      { keys: ['拖空白'], label: '框选' },
      { keys: ['⇧', '点'], label: '加选' },
      { keys: ['⌥', '点'], label: '减选' },
      { keys: ['双击', '卡'], label: '打开卡片' },
      { keys: ['双击', '分区'], label: '折叠 / 展开分区' },
      { keys: ['右键'], label: '对象菜单 / 画布菜单' },
      { keys: ['空格', '拖'], label: '平移画布' },
      { keys: ['⌘', '滚轮'], label: '以指针为中心缩放' },
      { keys: ['⌘', '0'], label: '适配全板' },
      { keys: ['⌘', '+'], label: '放大' },
      { keys: ['⌘', '−'], label: '缩小' },
      { keys: ['F'], label: '聚焦选中（其余降到 15%）' },
      { keys: ['⌫'], label: '删除选中' },
      { keys: ['⌘', 'Z'], label: '撤销' },
      { keys: ['⇧', '⌘', 'Z'], label: '重做' },
    ],
  },
  {
    group: '卡片编辑',
    note: 'S03 / S04',
    rows: [
      { keys: ['/'], label: '插入块（斜杠菜单）' },
      { keys: ['@'], label: '提及卡片 / 白板 / 块 / 日期' },
      { keys: ['↵'], label: '拆出一个新块' },
      { keys: ['⌫'], label: '在块首合并到上一块' },
      { keys: ['⌥', '↑'], label: '块上移' },
      { keys: ['⌥', '↓'], label: '块下移' },
      { keys: ['⌘', 'Z'], label: '撤销' },
      { keys: ['Esc'], label: '退出编辑' },
    ],
  },
  {
    group: '复习',
    note: 'S01 / S06',
    rows: [
      { keys: ['R'], label: '今日页：开始复习' },
      { keys: ['空格'], label: '翻面' },
      { keys: ['1'], label: '还是模糊（移到队尾）' },
      { keys: ['2'], label: '懂了' },
      { keys: ['Esc'], label: '退出复习' },
    ],
  },
]

export function ShortcutSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}): JSX.Element | null {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQ('')
    const t = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const sections = useMemo(() => {
    const key = q.trim().toLowerCase()
    if (!key) return SHORTCUTS
    return SHORTCUTS.map((sec) => ({
      ...sec,
      rows: sec.rows.filter(
        (r) => r.label.toLowerCase().includes(key) || r.keys.join('').toLowerCase().includes(key)
      ),
    })).filter((sec) => sec.rows.length > 0)
  }, [q])

  if (!open) return null

  return (
    <div className={s.mask} onClick={onClose} role="presentation">
      <div className={s.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="快捷键">
        <header className={s.head}>
          <h2 className={s.title}>快捷键</h2>
          <input
            ref={inputRef}
            className={s.search}
            value={q}
            placeholder="搜动作或按键"
            onChange={(e) => setQ(e.target.value)}
          />
          <IconButton icon="close" tooltip="关闭（Esc）" onClick={onClose} />
        </header>

        <div className={s.body}>
          {sections.map((sec) => (
            <section key={sec.group} className={s.section}>
              <div className={s.groupName}>
                {sec.group}
                {sec.note ? <span className={s.note}>{sec.note}</span> : null}
              </div>
              <ul className={s.rows}>
                {sec.rows.map((r) => (
                  <li key={r.label} className={s.row}>
                    <span className={s.label}>{r.label}</span>
                    <span className={s.keys}>
                      {r.keys.map((k, i) => (
                        <kbd key={i} className={s.kbd}>
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {sections.length === 0 ? <p className={s.empty}>没有匹配的快捷键</p> : null}
        </div>

        <footer className={s.foot}>
          只列已实现的动作；未实现的导出 / Markdown 不在表里
        </footer>
      </div>
    </div>
  )
}
