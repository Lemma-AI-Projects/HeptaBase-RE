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
  '工作记忆', '组块', '双编码', '精细加工', '元认知', '校准', '自信度',
  '测试效应', '前向干扰', '后向干扰', '序列位置', '语境编码', '迁移',
  '刻意练习', '反馈时机', '延迟反馈', '示例学习', '问题变式', '错题',
  '间隔阶梯', '复习预算', '每日上限', '难度系数', '稳定性', '可提取性',
  '初学速率', '遗忘速率', '参数拟合', '评分口径', '时间戳', '时区',
  '朗读', '手写', '划线', '摘录', '复述', '自测', '检索失败',
  '学习曲线', '长尾', '饱和',
]

export const BOARD_LIST = [
  '间隔重复：为什么、怎么排、哪里可疑',
  'Bjork 2011 精读',
  '学习科学读书笔记',
  'FSRS 参数实验',
  '写作素材',
  '语言学习计划',
  '论文方法库',
  '每周复盘',
  '提取练习与测试效应',
  '间隔与交错对照实验',
  '合意困难：边界在哪',
  '流利错觉的自我校准',
  '遗忘曲线三种模型',
  'SM-2 的五个缺陷',
  'FSRS-5 权重解释',
  '每日复习预算设计',
  '卡片粒度的两难',
  '一条卡一个事实？',
  '论证型卡片的判分',
  '双向卡是否值得',
  '法语 B1 词汇表',
  '德语名词性别',
  '日语汉字音读',
  'IELTS 写作语料',
  '统计：假设检验',
  '统计：贝叶斯入门',
  '线性代数直觉',
  '微积分：极限与连续',
  '机器学习：偏差方差',
  'Python 类型标注',
  'SQL 窗口函数',
  '产品设计原则',
  '访谈记录：认知负荷',
  '论文：desirable difficulties',
  '论文：retrieval practice meta',
  '读书：Make It Stick',
  '读书：Peak',
  '读书：How to Take Smart Notes',
  '课程：Learning How to Learn',
  '课堂笔记：记忆的七宗罪',
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

const EXCERPTS = [
  '读十遍不如测一遍：读取只制造熟悉感，测验才逼出检索路径。同一段时间，测三次的长期保留明显高于读三次。',
  '间隔多长不是拍脑袋：目标留一周，间隔约一天；目标留一年，间隔拉到月。比例约是保留期的 10–20%。',
  '合意困难不是越难越好，而是「努力可解」。解不出来的难，只会留下挫败感，不留下记忆。',
  '流利错觉最麻烦的地方在于：它让你在复习时感觉良好，而在考试时一无所有。',
  'SM-2 用同一个系数乘每张卡，看不见难卡与易卡之间十倍以上的差别——这是 FSRS 要解决的问题。',
  '卡片粒度决定能不能判定：一张卡一个事实，判定干净但脱离上下文；一张卡一个论证，记得住逻辑却判不了对错。',
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
      excerpt: EXCERPTS[Math.floor(rand() * EXCERPTS.length)],
      color: COLORS[Math.floor(rand() * COLORS.length)],
      tags,
      status: STATUS[Math.floor(rand() * STATUS.length)],
      mastery: rand() > 0.62 ? (rand() > 0.5 ? 'solid' : 'fuzzy') : 'none',
      source: `Bjork & Bjork 2011.pdf · p.${1 + Math.floor(rand() * 8)}`,
      board: BOARD_LIST[Math.floor(rand() * BOARD_LIST.length)],
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
