import type { EdgeData, SectionData } from '@/lib/board-layout'

/**
 * S02 的真实内容板（Plan/Stage2/03-S02内容.md）
 * 主题：间隔重复 —— 为什么、怎么排、哪里可疑
 */

export const BOARD = {
  title: '间隔重复：为什么、怎么排、哪里可疑',
  subtitle: '从遗忘曲线到 FSRS —— 一份能复习的读书笔记',
  initialViewport: { x: -20, y: -70, zoom: 1 },
}

export const SECTIONS: SectionData[] = [
  {
    id: 'S-A',
    title: '遗忘从哪里来',
    color: 'green',
    x: 60,
    y: 200,
    w: 560,
    cards: [
      {
        id: 'A1',
        title: '艾宾浩斯曲线（1885）',
        color: 'green',
        h: 152,
        lines: ['无意义音节，自己当被试', '20 分钟剩 58%', '1 天剩 33%', '31 天剩 21%', '先快后慢，是唯一确定的形状'],
      },
      {
        id: 'A2',
        title: '曲线不是定律',
        color: 'green',
        h: 132,
        lines: ['有意义材料下降慢得多', '重复研究差异很大', '形状成立，数字别照抄'],
      },
      {
        id: 'A3',
        title: '存储强度 ≠ 提取强度',
        color: 'green',
        h: 132,
        lines: ['存储强度只增不减', '提取强度随不复习下降', '忘不掉，是想不起来'],
      },
      {
        id: 'A4',
        title: '遗忘是功能',
        color: 'green',
        h: 116,
        lines: ['过滤竞争信息', '不遗忘会检索过载', '间隔效应正靠它成立'],
      },
      {
        id: 'A5',
        title: '再学习的节省',
        color: 'green',
        h: 128,
        lines: ['重学同一材料更快', '说明痕迹还在', '只是「拿不到」'],
      },
      {
        id: 'A6',
        title: '干扰而非消退',
        color: 'gray',
        h: 116,
        lines: ['相似材料互相压制', '前摄抑制：旧的碍新的', '倒摄抑制：反过来'],
      },
      {
        id: 'A7',
        title: '睡眠在中间',
        color: 'green',
        h: 128,
        lines: ['慢波睡眠期海马重放', '学完当晚睡够更划算', '熬夜补学换不回来'],
      },
      {
        id: 'A8',
        title: '情绪会插一脚',
        color: 'green',
        h: 116,
        lines: ['高唤醒事件记得更牢', '代价是细节易被改写'],
      },
    ],
  },
  {
    id: 'S-B',
    title: '为什么间隔有效',
    color: 'blue',
    x: 700,
    y: 160,
    w: 560,
    cards: [
      {
        id: 'B1',
        title: '间隔效应',
        color: 'blue',
        h: 148,
        lines: ['总时长相同，分散优于集中', 'Cepeda 2006 汇总 254 个实验', '方向一致，效应稳定'],
      },
      {
        id: 'B2',
        title: '间隔多长：跟保留期走',
        color: 'blue',
        h: 132,
        lines: ['目标留 1 周 → 间隔约 1 天', '目标留 1 年 → 间隔拉到月', '比例约保留期的 10–20%'],
      },
      {
        id: 'B3',
        title: '合意困难',
        color: 'blue',
        h: 120,
        lines: ['学的时候难一点', '长期记得更牢', '「顺」是危险信号'],
      },
      {
        id: 'B4',
        title: '提取练习（testing effect）',
        color: 'blue',
        w: 528,
        h: 152,
        lines: [
          'Roediger & Karpicke 2006：同一篇文章，一周后',
          '重复阅读 ≈ 40%，测一次 ≈ 56%，测三次 ≈ 61%',
          '读制造熟悉感，测才逼出检索路径',
        ],
      },
      {
        id: 'B5',
        title: '生成效应',
        color: 'blue',
        h: 116,
        lines: ['自己写出答案记得住', '猜错也比不猜强', 'Slamecka & Graf 1978'],
      },
      {
        id: 'B6',
        title: '交错 vs 分块',
        color: 'blue',
        h: 128,
        lines: ['交错练「用哪个」', '分块练「用得熟」', '新手先分块，再交错'],
      },
      {
        id: 'B7',
        title: '流利错觉',
        color: 'blue',
        h: 120,
        lines: ['读得顺 ≠ 记得住', '熟悉感被当成掌握', '复习失效的头号原因'],
      },
      {
        id: 'B8',
        title: '反馈要迟到一点',
        color: 'gray',
        h: 128,
        lines: ['立即反馈改错快', '延迟反馈留得久', '无反馈的重复几乎无效'],
      },
    ],
  },
  {
    id: 'S-C',
    title: '怎么排程',
    color: 'orange',
    x: 60,
    y: 1120,
    w: 560,
    cards: [
      {
        id: 'C1',
        title: 'SM-2（1987）',
        color: 'orange',
        h: 140,
        lines: ['Wozniak 为 SuperMemo 写的', '间隔 = 上次间隔 × 难度系数', 'Anki 沿用这套骨架'],
      },
      {
        id: 'C2',
        title: '系数怎么动',
        color: 'orange',
        h: 120,
        lines: ['系数 1.3–2.5', '评 0–2 分：重来', '4–5 分：系数上调'],
      },
      {
        id: 'C3',
        title: '一刀切的毛病',
        color: 'orange',
        h: 116,
        lines: ['每张卡乘同一个系数', '难卡易卡差 10 倍', '算法看不见'],
      },
      {
        id: 'C4',
        title: 'FSRS（2022）',
        color: 'orange',
        w: 528,
        h: 152,
        lines: [
          '开源排程器，2022 年发布',
          '三变量：难度 D、稳定度 S、可提取性 R',
          '用你自己的复习日志拟合参数，而不是拍一个系数',
          'Anki 23.10 起内置',
        ],
      },
      {
        id: 'C5',
        title: '遗忘用幂律，不用指数',
        color: 'orange',
        h: 132,
        lines: ['R = (1 + 19/81 · t/S)^(-0.5)', '幂律而非指数', '指数会低估长期保留，把间隔算短'],
      },
      {
        id: 'C6',
        title: '目标保留率就是成本旋钮',
        color: 'orange',
        h: 120,
        lines: ['目标 90% 的工作量', '约为 80% 的两倍', '复习量是可调的'],
      },
      {
        id: 'C7',
        title: 'HLR（Duolingo 2016）',
        color: 'orange',
        h: 132,
        lines: ['用特征预测半衰期', '不靠单卡历史', '线上 A/B 日活约 +10%'],
      },
      {
        id: 'C8',
        title: '冷启动',
        color: 'gray',
        h: 116,
        lines: ['新卡没有日志', '先用群体先验', '前三次评分别定终身'],
      },
    ],
  },
  {
    id: 'S-D',
    title: '我的疑问',
    color: 'purple',
    x: 760,
    y: 1040,
    w: 560,
    cards: [
      {
        id: 'D1',
        title: '词汇和概念能共用一套排程？',
        color: 'purple',
        h: 120,
        lines: ['词汇是离散映射', '概念是网络，忘了能推', '稳定度含义可能不同'],
      },
      {
        id: 'D2',
        title: '交错会不会打乱间隔',
        color: 'purple',
        h: 116,
        lines: ['交错换的是提取线索', 'SRS 算的是时间', '叠在一起谁说了算'],
      },
      {
        id: 'D3',
        title: '卡片要多细',
        color: 'purple',
        w: 528,
        h: 128,
        lines: [
          '一张卡一个事实 → 判定干净，但脱离上下文',
          '一张卡一个论证 → 记得住逻辑，判不了对错',
          '中间那条线在哪？',
        ],
      },
      {
        id: 'D4',
        title: '评分会不会自欺',
        color: 'purple',
        h: 116,
        lines: ['点「记得」时是真提取吗', '还是刚看完觉得眼熟', '和 B7 是同一个坑'],
      },
      {
        id: 'D5',
        title: 'AI 出的题在考什么',
        color: 'purple',
        h: 120,
        lines: ['考措辞还是考概念', '需要一条「不看原文能答吗」'],
      },
      {
        id: 'D6',
        title: '队列过 200 就崩',
        color: 'purple',
        h: 116,
        lines: ['待办感压过学习感', '需要「今天到此为止」'],
      },
      {
        id: 'D7',
        title: '要允许主动遗忘',
        color: 'purple',
        h: 120,
        lines: ['垃圾卡不清，复习被稀释', '删除应当是常规动作'],
      },
      {
        id: 'D8',
        title: '卡片离开白板还剩多少',
        color: 'gray',
        h: 128,
        lines: ['复习时看不到邻居卡', '线索断了', '复习卡该带一角板上下文'],
      },
    ],
  },
]

export const EDGES: EdgeData[] = [
  { id: 'E1', from: 'A1', to: 'B1', shape: 'curve', direction: 'none', fromSide: 'r', toSide: 'l', label: '所以分散' },
  { id: 'E2', from: 'A3', to: 'B7', shape: 'curve', direction: 'none', fromSide: 'r', toSide: 'l' },
  { id: 'E3', from: 'B2', to: 'C6', shape: 'curve', direction: 'none', fromSide: 'r', toSide: 'l', label: '成本旋钮' },
  { id: 'E4', from: 'B4', to: 'C1', shape: 'curve', direction: 'none', fromSide: 'r', toSide: 'l' },
  { id: 'E5', from: 'C3', to: 'D2', shape: 'curve', direction: 'none', fromSide: 'r', toSide: 'l' },
  { id: 'E6', from: 'C5', to: 'D4', shape: 'ortho', direction: 'none', fromSide: 'r', toSide: 'l' },
]

export type MediaItem = {
  id: string
  kind: 'curves' | 'fsrs'
  x: number
  y: number
  w: number
  h: number
  caption: string
}

export const MEDIA: MediaItem[] = [
  { id: 'M1', kind: 'curves', x: 1320, y: 170, w: 400, h: 260, caption: '自绘：指数 vs 幂律' },
  { id: 'M2', kind: 'fsrs', x: 1320, y: 1040, w: 400, h: 240, caption: '自绘：FSRS 的三变量' },
]

/** 板上的零散对象：不成组的卡与一句旁注（真实白板都有） */
export const LOOSE_CARDS = [
  {
    id: 'L1',
    title: '下一步',
    color: 'gray' as const,
    x: 1330,
    y: 560,
    w: 240,
    h: 132,
    lines: ['把 A3 与 B7 合成一张', '试 90% 与 80% 的工作量差'],
  },
]

export const NOTES = [
  {
    id: 'N1',
    x: 1330,
    y: 760,
    w: 400,
    text: '留一句：复习卡要不要带板上下文？',
  },
]
