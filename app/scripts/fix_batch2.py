import io

# ---------- 3) 复习进度落盘 ----------
p = 'src/lib/learning.ts'
t = io.open(p, encoding='utf-8').read()

old = """let queue: string[] = QUESTIONS.map((q) => q.id)
let ratings: Record<string, Mastery> = {}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())"""
new = """const KEY = 'ls-review-v1'
type Saved = { queue: string[]; ratings: Record<string, Mastery>; extra: Question[] }

let queue: string[] = QUESTIONS.map((q) => q.id)
let ratings: Record<string, Mastery> = {}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

const save = () => {
  try {
    const ids = new Set(QUESTIONS.map((q) => q.id))
    localStorage.setItem(
      KEY,
      JSON.stringify({
        queue: queue.filter((id) => ids.has(id)),
        ratings,
        extra: QUESTIONS.filter((q) => q.id.startsWith('ai-')),
      })
    )
  } catch {
    /* 隐私模式写不进去，忽略 */
  }
}

;(function restore() {
  try {
    if (location.hash.includes('review=fresh')) {
      localStorage.removeItem(KEY)
      return
    }
    const raw = localStorage.getItem(KEY)
    if (!raw) return
    const s = JSON.parse(raw) as Saved
    if (Array.isArray(s.extra)) {
      for (const q of s.extra) if (!QUESTIONS.some((x) => x.id === q.id)) QUESTIONS.push(q)
    }
    const known = new Set(QUESTIONS.map((q) => q.id))
    if (Array.isArray(s.queue)) {
      const kept = s.queue.filter((id) => known.has(id))
      const missing = QUESTIONS.map((q) => q.id).filter((id) => !kept.includes(id))
      queue = [...kept, ...missing]
    }
    if (s.ratings && typeof s.ratings === 'object') ratings = s.ratings
  } catch {
    /* 坏数据当没存过 */
  }
})()"""
assert old in t
t = t.replace(old, new)

t = t.replace("""  queue = result === 'solid' ? queue.filter((x) => x !== id) : [...queue.filter((x) => x !== id), id]
  emit()""",
"""  queue = result === 'solid' ? queue.filter((x) => x !== id) : [...queue.filter((x) => x !== id), id]
  save()
  emit()""")

t = t.replace("""export function resetReview() {
  queue = QUESTIONS.map((q) => q.id)
  ratings = {}
  emit()
}""",
"""export function resetReview() {
  queue = QUESTIONS.map((q) => q.id)
  ratings = {}
  save()
  emit()
}""")

t = t.replace("""export function addQuestion(q: Question) {
  QUESTIONS.push(q)
  queue = [...queue, q.id]
  emit()
}""",
"""export function addQuestion(q: Question) {
  QUESTIONS.push(q)
  queue = [...queue, q.id]
  save()
  emit()
}""")
io.open(p, 'w', encoding='utf-8').write(t)
print('learning ok', 'save()' in t)

# ---------- 4) 数据集扩到 40 板 / 60 标签 ----------
p = 'src/lib/library.ts'
t = io.open(p, encoding='utf-8').read()

tags_old = """export const TAGS = [
  '间隔重复', '检索', '合意困难', '流利错觉', '遗忘曲线', 'SM-2', 'FSRS',
  '睡眠', '干扰', '交错', '生成效应', '反馈', '冷启动', '目标保留率',
  '卡片粒度', '白板', 'AI', '待验证', '实验', '方法论',
]"""
tags_new = """export const TAGS = [
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
]"""
assert tags_old in t
t = t.replace(tags_old, tags_new)

boards_old = """export const BOARD_LIST = [
  '间隔重复：为什么、怎么排、哪里可疑',
  'Bjork 2011 精读',
  '学习科学读书笔记',
  'FSRS 参数实验',
  '写作素材',
  '语言学习计划',
  '论文方法库',
  '每周复盘',
]"""
boards_new = """export const BOARD_LIST = [
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
]"""
assert boards_old in t
t = t.replace(boards_old, boards_new)
io.open(p, 'w', encoding='utf-8').write(t)
print('library ok', len(tags_new.split(',')), 'tags-ish')
