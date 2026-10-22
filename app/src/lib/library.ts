import { useSyncExternalStore } from 'react'
import type { CardColor } from '@/tokens'

export type Status = '未开始' | '在学' | '已掌握'
export type Mastery = 'none' | 'fuzzy' | 'solid'

export type LibCard = {
  id: string
  title: string
  excerpt: string
  color: CardColor
  tags: string[]
  status: Status
  mastery: Mastery
  source: string
  board: string
  updatedAt: string
}

export const TAGS = [
  '间隔重复', '检索', '合意困难', '流利错觉', '遗忘曲线', 'SM-2', 'FSRS',
  '睡眠', '干扰', '交错', '生成效应', '反馈', '冷启动', '目标保留率',
  '卡片粒度', '白板', 'AI', '待验证', '实验', '方法论',
]

export const BOARDS = [
  '间隔重复：为什么、怎么排、哪里可疑',
  'Bjork 2011 精读',
  '学习科学读书笔记',
  'FSRS 参数实验',
  '写作素材',
  '语言学习计划',
  '论文方法库',
  '每周复盘',
]

const COLORS: CardColor[] = ['green', 'blue', 'orange', 'purple', 'red', 'yellow', 'gray']
const STATUS: Status[] = ['未开始', '在学', '已掌握']

const HEAD = [
  '提取练习为什么有效',
  '合意困难的定义',
  '流利错觉的陷阱',
  '最优间隔怎么算',
  'SM-2 的系数演进',
  'FSRS 的三个变量',
  '间隔效应与保留期',
  '睡眠期的记忆重放',
  '前摄抑制与倒摄抑制',
  '交错练习的边界',
  '生成效应与错误答案',
  '反馈的时机',
  '冷启动的群体先验',
  '卡片粒度的取舍',
  '白板上连线的意义',
  'AI 出题在考什么',
  '目标保留率的成本',
  '复习疲劳的上限',
]

const TAIL = [
  '：一次实验的复现',
  '：我的反例',
  '：和 SM-2 的对比',
  '：需要验证的地方',
  '：一段原文摘录',
  '：一个常见误解',
  '：在语言学习里的差异',
  '：对排程的启示',
]

/** 固定种子，保证每次截图一样 */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export function buildLibrary(count = 1000): LibCard[] {
  const rand = rng(20261022)
  const out: LibCard[] = []
  for (let i = 0; i < count; i++) {
    const h = HEAD[Math.floor(rand() * HEAD.length)]
    const t = TAIL[Math.floor(rand() * TAIL.length)]
    const tagCount = 1 + Math.floor(rand() * 3)
    const tags: string[] = []
    for (let k = 0; k < tagCount; k++) {
      const g = TAGS[Math.floor(rand() * TAGS.length)]
      if (!tags.includes(g)) tags.push(g)
    }
    const day = 1 + Math.floor(rand() * 21)
    out.push({
      id: `c${i + 1}`,
      title: `${h}${t}`,
      excerpt:
        '读十遍不如测一遍：读取只制造熟悉感，测验才逼出检索路径。同一段时间，测三次的长期保留明显高于读三次。',
      color: COLORS[Math.floor(rand() * COLORS.length)],
      tags,
      status: STATUS[Math.floor(rand() * STATUS.length)],
      mastery: rand() > 0.62 ? (rand() > 0.5 ? 'solid' : 'fuzzy') : 'none',
      source: `Bjork & Bjork 2011.pdf · p.${1 + Math.floor(rand() * 8)}`,
      board: BOARDS[Math.floor(rand() * BOARDS.length)],
      updatedAt: `2026-10-${String(day).padStart(2, '0')}`,
    })
  }
  return out
}

/* ---------------- store ---------------- */

let cards: LibCard[] = buildLibrary(1000)
let selected: string[] = []
let undoSnapshot: LibCard[] | null = null
const listeners = new Set<() => void>()
let version = 0
const emit = () => {
  version += 1
  listeners.forEach((l) => l())
}

export const subscribeLib = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getCards = () => cards
export const getSelected = () => selected
export const getVersion = () => version

export const useLib = () => useSyncExternalStore(subscribeLib, getVersion, getVersion)

export function setSelected(ids: string[]) {
  selected = ids
  emit()
}

export function toggleSelected(id: string) {
  selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
  emit()
}

export function clearSelected() {
  selected = []
  emit()
}

export function deleteSelected() {
  if (selected.length === 0) return 0
  undoSnapshot = cards
  const n = selected.length
  cards = cards.filter((c) => !selected.includes(c.id))
  selected = []
  emit()
  return n
}

export function tagSelected(tag: string) {
  if (selected.length === 0) return 0
  undoSnapshot = cards
  const n = selected.length
  cards = cards.map((c) =>
    selected.includes(c.id) && !c.tags.includes(tag) ? { ...c, tags: [...c.tags, tag] } : c
  )
  emit()
  return n
}

export function undoLib() {
  if (!undoSnapshot) return false
  cards = undoSnapshot
  undoSnapshot = null
  emit()
  return true
}

export const canUndoLib = () => undoSnapshot !== null

export function updateCard(id: string, patch: Partial<LibCard>) {
  cards = cards.map((c) => (c.id === id ? { ...c, ...patch } : c))
  emit()
}

/* 搜索 */
export function searchCards(q: string): LibCard[] {
  const key = q.trim().toLowerCase()
  if (!key) return []
  const out: LibCard[] = []
  for (const c of cards) {
    if (
      c.title.toLowerCase().includes(key) ||
      c.tags.some((t) => t.toLowerCase().includes(key)) ||
      c.board.toLowerCase().includes(key)
    ) {
      out.push(c)
      if (out.length >= 20) break
    }
  }
  return out
}
