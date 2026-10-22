import type { JSX } from 'react'

/** 自绘：指数 / 幂律 两条遗忘曲线 + 艾宾浩斯实测点 */
export function CurvesSvg(): JSX.Element {
  const W = 400
  const H = 260
  const pad = { l: 34, r: 14, t: 16, b: 26 }
  const px = (d: number) => pad.l + (d / 10) * (W - pad.l - pad.r)
  const py = (p: number) => pad.t + (1 - p / 100) * (H - pad.t - pad.b)

  const expPts = Array.from({ length: 41 }, (_, i) => {
    const d = (i / 40) * 10
    return `${px(d)},${py(100 * Math.exp(-d / 1.5))}`
  }).join(' ')

  const powPts = Array.from({ length: 41 }, (_, i) => {
    const d = (i / 40) * 10
    return `${px(d)},${py(100 * Math.pow(1 + d / 9, -0.5))}`
  }).join(' ')

  const measured: [number, number][] = [
    [0.014, 58],
    [0.042, 44],
    [1, 33],
    [2.1, 28],
    [6, 25],
    [10, 22],
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="遗忘曲线：指数与幂律">
      {[0, 25, 50, 75, 100].map((p) => (
        <g key={p}>
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={py(p)}
            y2={py(p)}
            stroke="var(--c-line)"
            strokeWidth={0.5}
          />
          <text x={pad.l - 6} y={py(p)} textAnchor="end" dominantBaseline="central" fontSize={9} fill="var(--c-text-3)">
            {p}%
          </text>
        </g>
      ))}
      <polyline points={expPts} fill="none" stroke="var(--c-orange-solid)" strokeWidth={1.5} />
      <polyline points={powPts} fill="none" stroke="var(--c-blue-solid)" strokeWidth={1.5} />
      {measured.map(([d, p], i) => (
        <circle key={i} cx={px(d)} cy={py(p)} r={2.4} fill="var(--c-text)" />
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--c-line-strong)" strokeWidth={0.8} />
      {[0, 5, 10].map((d) => (
        <text key={d} x={px(d)} y={H - pad.b + 12} textAnchor="middle" fontSize={9} fill="var(--c-text-3)">
          {d} 天
        </text>
      ))}
      <g fontSize={9} fill="var(--c-text-2)">
        <rect x={pad.l + 6} y={pad.t + 2} width={8} height={2} fill="var(--c-orange-solid)" />
        <text x={pad.l + 19} y={pad.t + 5}>指数</text>
        <rect x={pad.l + 48} y={pad.t + 2} width={8} height={2} fill="var(--c-blue-solid)" />
        <text x={pad.l + 61} y={pad.t + 5}>幂律</text>
        <circle cx={pad.l + 96} cy={pad.t + 3} r={2.4} fill="var(--c-text)" />
        <text x={pad.l + 102} y={pad.t + 5}>实测</text>
      </g>
    </svg>
  )
}

/** 自绘：FSRS 三变量 */
export function FsrsSvg(): JSX.Element {
  const box = (x: number, y: number, t: string, sub: string) => (
    <g key={t}>
      <rect x={x} y={y} width={92} height={52} rx={8} fill="var(--c-panel)" stroke="var(--c-line-strong)" strokeWidth={0.8} />
      <text x={x + 12} y={y + 22} fontSize={12} fontWeight={600} fill="var(--c-text)">
        {t}
      </text>
      <text x={x + 12} y={y + 38} fontSize={9} fill="var(--c-text-3)">
        {sub}
      </text>
    </g>
  )

  return (
    <svg viewBox="0 0 400 240" role="img" aria-label="FSRS 的 D / S / R 三个变量">
      {box(28, 30, 'D 难度', '这张卡对我多难')}
      {box(154, 30, 'S 稳定度', '能撑多少天')}
      {box(280, 84, 'R 可提取性', '此刻想得起来吗')}
      <path d="M120 56 H154" stroke="var(--c-text-3)" strokeWidth={1} markerEnd="url(#arrow)" />
      <path d="M246 56 C280 56 300 66 300 84" stroke="var(--c-text-3)" strokeWidth={1} fill="none" />
      <path d="M326 136 C326 180 200 190 120 150" stroke="var(--c-text-3)" strokeWidth={1} fill="none" strokeDasharray="3 3" />
      <text x={128} y={144} fontSize={9} fill="var(--c-text-3)">
        复习后 D↓ S↑
      </text>
      {box(154, 168, 'R(90%)', '目标保留率')}
      <path d="M300 136 C300 190 260 194 246 194" stroke="var(--c-text-3)" strokeWidth={1} fill="none" />
      <defs>
        <marker id="arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill="var(--c-text-3)" />
        </marker>
      </defs>
    </svg>
  )
}
