import type { AppItem } from '@/parts/C02-AppRail'

export const APPS: AppItem[] = [
  { id: 'inbox', name: 'Inbox', icon: 'inbox', tint: 'linear-gradient(160deg,#8b5cf6,#7c3aed)', count: 4 },
  { id: 'today', name: '今日', icon: 'calendar', tint: 'linear-gradient(160deg,#f43f5e,#e11d48)' },
  { id: 'board', name: '白板', icon: 'board', tint: 'linear-gradient(160deg,#4c9a7a,#3f8467)', count: 12 },
  { id: 'library', name: '卡片库', icon: 'library', tint: 'linear-gradient(160deg,#374151,#1f2937)' },
  { id: 'tags', name: '标签', icon: 'tag', tint: 'linear-gradient(160deg,#f59e0b,#d97706)' },
  { id: 'highlight', name: '划线', icon: 'highlight', tint: 'linear-gradient(160deg,#3b82f6,#2563eb)' },
  { id: 'chat', name: 'AI 对话', icon: 'chat', tint: 'linear-gradient(160deg,#14b8a6,#0d9488)' },
]

export const TAGS = ['间隔重复', '记忆', '待读', 'FSRS']

export const TABS = [
  { id: '/s02', name: '间隔重复：为什么、怎么排、哪里可疑', pinned: true },
  { id: '/s03', name: '提取练习为什么有效' },
  { id: '/s05', name: 'Bjork & Bjork 2011.pdf' },
]
