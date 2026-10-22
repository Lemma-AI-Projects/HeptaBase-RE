export type BlockType =
  | 'h2'
  | 'p'
  | 'list'
  | 'todo'
  | 'quote'
  | 'code'
  | 'table'
  | 'image'
  | 'divider'

export type Block = {
  id: string
  type: BlockType
  text?: string
  items?: string[]
  rows?: string[][]
  checked?: boolean[]
  caption?: string
}

const b = (id: string, type: BlockType, extra: Partial<Block> = {}): Block => ({
  id,
  type,
  ...extra,
})

export const CARD_TITLE = '提取练习为什么有效'
export const CARD_META = {
  created: '2026-10-14 21:08',
  words: 486,
  source: 'Roediger & Karpicke 2006 · Bjork & Bjork 2011',
  board: '间隔重复：为什么、怎么排、哪里可疑',
}

export const ARTICLE: Block[] = [
  b('b1', 'h2', { text: '一句话结论' }),
  b('b2', 'p', {
    text: '读十遍不如测一遍。==测验不是评估，是学习本身==：每次把答案从记忆里拽出来，检索路径就被加粗一次。',
  }),
  b('b3', 'list', {
    items: [
      '读 → 制造熟悉感；测 → 逼出检索路径',
      '同一段时间，测三次比读三次记得久',
      '错也一样有效，只要给反馈',
    ],
  }),
  b('b4', 'quote', {
    text: '一周后：重复阅读 40%，测一次 56%，测三次 61%。— Roediger & Karpicke (2006)',
  }),
  b('b5', 'h2', { text: '怎么用在卡片上' }),
  b('b6', 'p', {
    text: '卡片正面必须是问题，不是标题。标题会让人「想起来在哪见过」，问题才逼人「说出来」。',
  }),
  b('b7', 'todo', {
    items: ['把 A 区的标题卡改成问题卡', '给三张卡补上「不看原文能答吗」检查'],
    checked: [false, false],
  }),
  b('b8', 'code', {
    text: 'I(n) = I(n-1) * EF\nEF 1.3 – 2.5   评分 0–2 则重来',
  }),
  b('b9', 'table', {
    rows: [
      ['条件', '一周后保留'],
      ['重复阅读 ×4', '40%'],
      ['读 3 次 + 测 1 次', '56%'],
      ['测 4 次', '61%'],
    ],
  }),
  b('b10', 'image', { caption: '自绘：读与测的两条遗忘曲线' }),
  b('b11', 'divider'),
  b('b12', 'p', {
    text: '还没想清楚的：交错练「用哪个」和 SRS 排「什么时候」是两套机制，叠在一起时谁优先？',
  }),
]

export const SLASH_ITEMS: { type: BlockType; label: string; hint: string; icon: string }[] = [
  { type: 'h2', label: '小标题', hint: 'H2', icon: 'h2' },
  { type: 'list', label: '列表', hint: '无序', icon: 'list' },
  { type: 'todo', label: '待办', hint: '可勾选', icon: 'todo' },
  { type: 'quote', label: '引用', hint: '带出处', icon: 'quote' },
  { type: 'code', label: '代码', hint: '等宽', icon: 'code' },
  { type: 'table', label: '表格', hint: '3 列', icon: 'table' },
  { type: 'image', label: '图片', hint: '本地', icon: 'image' },
  { type: 'divider', label: '分割线', hint: '—', icon: 'divider' },
]

export const MENTION_GROUPS = [
  { group: '卡片', items: ['提取练习为什么有效', '合意困难', '流利错觉'] },
  { group: '白板', items: ['间隔重复：为什么、怎么排、哪里可疑'] },
  { group: '块', items: ['一句话结论', '怎么用在卡片上'] },
  { group: '日期', items: ['今天', '明天', '下周一'] },
]

export const BACKLINKS = [
  { id: 'k1', type: '白板', name: '间隔重复：为什么、怎么排、哪里可疑', snippet: 'B4 提取练习（testing effect）' },
  { id: 'k2', type: '卡片', name: '合意困难', snippet: '…和提取练习是同一件事的两面，都要求先难后易' },
  { id: 'k3', type: 'PDF', name: 'Bjork & Bjork 2011 · p.3', snippet: '第 2 段划线 → 摘录成本卡' },
]

export const PROPERTIES = [
  { id: 'p1', label: '来源', type: '文本', value: 'Roediger & Karpicke 2006' },
  { id: 'p2', label: '页码', type: '数字', value: '3' },
  { id: 'p3', label: '掌握度', type: '单选', value: '模糊' },
  { id: 'p4', label: '标签', type: '多选', value: '记忆 · 检索' },
  { id: 'p5', label: '下次复习', type: '日期', value: '2026-10-24' },
  { id: 'p6', label: '已收录', type: '复选', value: '是' },
] as const
