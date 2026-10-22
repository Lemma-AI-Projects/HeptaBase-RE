import { useSyncExternalStore } from 'react'

export type Mastery = 'none' | 'fuzzy' | 'solid'

export type Question = {
  id: string
  front: string
  back: string
  source: { file: string; page: number; paragraph: string }
  tag: string
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    front: '为什么读十遍不如测一遍？',
    back: '读取只制造熟悉感，测验才逼出检索路径；同一段时间，测三次的长期保留明显高于读三次。',
    source: { file: 'Bjork & Bjork 2011.pdf', page: 2, paragraph: 'p2' },
    tag: '提取练习',
  },
  {
    id: 'q2',
    front: '什么叫「合意困难」？',
    back: '让学习过程变难一点、但学习者能靠努力解决的操作；它降低当下表现，提高长期保留。',
    source: { file: 'Bjork & Bjork 2011.pdf', page: 1, paragraph: 'p3' },
    tag: '合意困难',
  },
  {
    id: 'q3',
    front: '最优间隔由什么决定？',
    back: '由你想要的保留期决定：目标留一周，间隔约一天；目标留一年，间隔拉到月。比例约 10–20%。',
    source: { file: 'Cepeda 2006', page: 4, paragraph: 'p1' },
    tag: '间隔',
  },
  {
    id: 'q4',
    front: 'SM-2 的一刀切毛病是什么？',
    back: '每张卡都乘同一个难度系数，算法看不见难卡与易卡之间十倍以上的差别。',
    source: { file: 'SM-2 算法笔记', page: 1, paragraph: 'p2' },
    tag: '排程',
  },
  {
    id: 'q5',
    front: 'FSRS 的三个变量是什么？',
    back: '难度 D、稳定度 S、可提取性 R；用你自己的复习日志拟合参数，而不是拍一个固定系数。',
    source: { file: 'FSRS 文档', page: 1, paragraph: 'p1' },
    tag: '排程',
  },
  {
    id: 'q6',
    front: '为什么「点记得」可能是自欺？',
    back: '刚看完时的熟悉感会被误判成掌握；判断标准应是「不看原文能否说出来」。',
    source: { file: 'Bjork & Bjork 2011.pdf', page: 3, paragraph: 'p2' },
    tag: '流利错觉',
  },
  {
    id: 'q7',
    front: '遗忘是缺陷还是功能？',
    back: '是功能：过滤竞争信息，否则检索会被淹没；间隔效应正靠「忘掉一部分」才成立。',
    source: { file: 'Bjork & Bjork 2011.pdf', page: 1, paragraph: 'p2' },
    tag: '遗忘',
  },
]

export const PATH = [
  { id: 's1', title: '遗忘与提取', done: true, criteria: ['能说出存储强度与提取强度的区别', '能解释曲线为什么先快后慢'] },
  { id: 's2', title: '间隔与测验', done: true, criteria: ['能说出最优间隔怎么算', '能举出测试效应的一个实验'] },
  { id: 's3', title: '排程算法', done: false, criteria: ['能对比 SM-2 与 FSRS', '能说出目标保留率的代价'] },
  { id: 's4', title: '卡片与边界', done: false, criteria: ['能判断一张卡是否可判定', '能说出卡片粒度的影响'] },
  { id: 's5', title: '写进自己的材料', done: false, criteria: ['用自己的话重写三条结论'] },
]

export const AI_SCRIPT = [
  {
    role: 'user' as const,
    text: '这三张卡的共同前提是什么？',
  },
  {
    role: 'assistant' as const,
    text: '共同前提是「提取本身就是学习事件」。间隔效应、测试效应、合意困难三条，都建立在同一个动作上：把答案从记忆里重新拽出来一次。差别只在变量——间隔效应改变时间，测试效应改变方式，合意困难改变难度。',
    citations: [
      { file: 'Bjork & Bjork 2011.pdf', page: 1, paragraph: 'p3', label: 'p.1 §3' },
      { file: 'Bjork & Bjork 2011.pdf', page: 2, paragraph: 'p2', label: 'p.2 §2' },
    ],
  },
]

/* ---------------- store ---------------- */

let queue: string[] = QUESTIONS.map((q) => q.id)
let ratings: Record<string, Mastery> = {}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const subscribeReview = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getQueue = () => queue
export const getRatings = () => ratings

export function rateQuestion(id: string, result: 'solid' | 'fuzzy') {
  ratings = { ...ratings, [id]: result }
  queue = result === 'solid' ? queue.filter((x) => x !== id) : [...queue.filter((x) => x !== id), id]
  emit()
}

export function resetReview() {
  queue = QUESTIONS.map((q) => q.id)
  ratings = {}
  emit()
}

export function addQuestion(q: Question) {
  QUESTIONS.push(q)
  queue = [...queue, q.id]
  emit()
}

export const useReview = () =>
  useSyncExternalStore(
    subscribeReview,
    () => queue,
    () => queue
  )

export const useRatings = () =>
  useSyncExternalStore(
    subscribeReview,
    () => ratings,
    () => ratings
  )

/** 掌握度：只看最近一次判定 */
export const masteryOf = (id: string, r: Record<string, Mastery>): Mastery => r[id] ?? 'none'
