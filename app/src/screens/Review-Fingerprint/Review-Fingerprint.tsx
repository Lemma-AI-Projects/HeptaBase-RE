import { useState, type JSX } from 'react'
import s from './Review-Fingerprint.module.css'

type Row = {
  id: string
  name: string
  ref: string
  check: string
  tolerance: string
  shot: string
  status: 'pass' | 'deviation' | 'fail'
  note?: string
}

const ROWS: Row[] = [
  { id: 'V1', name: '画布底色', ref: 'whiteboard-feature.png', check: '暖灰近白，卡片浮起来', tolerance: '±3% 明度', shot: 's02-light.png', status: 'pass', note: '取色 #F7F7F4，参考图暖灰近白，同一档' },
  { id: 'V2', name: '卡片本体', ref: 'whiteboard-feature.png', check: '白底 + 1px 极浅描边 + 极淡阴影', tolerance: '阴影 ≤8%、模糊 ≤6px', shot: 's02-light.png', status: 'pass', note: '卡描边 1px、阴影 5% 2px；彩色卡用色板底色（见 V7 偏差）' },
  { id: 'V3', name: '圆角', ref: 'fe-02.png', check: '卡 8 / 浮层 10 / 胶囊全圆', tolerance: '±2px', shot: 'lab-light.png', status: 'pass', note: '卡 8 / 浮层 10 / 胶囊全圆，无第三档' },
  { id: 'V4', name: '正文排版', ref: 'kb-block-editor.png', check: '13–14px、行高 1.6、字重 400', tolerance: '字号固定', shot: 's02-light.png', status: 'pass', note: '卡正文 13/1.6，标题 14/1.6/500' },
  { id: 'V5', name: '界面文字', ref: 'ui-01.png', check: '12–13px，次要信息 55–65% 灰', tolerance: '—', shot: 's02-light.png', status: 'pass', note: '界面 12–13，次要文字 #6A6862（62% 灰）' },
  { id: 'V6', name: '强调色', ref: 'kb-daily-journals.png', check: '单蓝只用于当前/选中/今天', tolerance: '每屏 ≤3 处', shot: 's02-light.png', status: 'pass', note: 'S02 上蓝色只在选中描边出现，0–1 处' },
  { id: 'V7', name: '卡片色板', ref: 'fe-01.png', check: '低饱和粉彩，色只在卡头/分区头', tolerance: '饱和度 ≤35%', shot: 'lab-light.png', status: 'deviation', note: '参考图彩色卡是整卡底色，文档 V7 写“色只在卡头”。已按图实现，V7 文案待改' },
  { id: 'V8', name: '分区', ref: 'gallery-1.png', check: '实色胶囊白字 + 浅色底，无边框', tolerance: '—', shot: 's02-light.png', status: 'pass', note: '实色胶囊白字 + 68% 浅底，无边框；胶囊带计数' },
  { id: 'V9', name: '图标', ref: 'ui-01.png', check: '线性 1.5px、灰度、20px 网格', tolerance: '不混彩色', shot: 's02-light.png', status: 'pass', note: '图标 1.5px 线性灰度 20 网格；只有应用图标是彩色（例外）' },
  { id: 'V10', name: '浮层', ref: 'kb-pdf-annot-menu.png', check: '白底 + 圆角 + 极淡阴影 + 8px 内距', tolerance: '不盖视口中心', shot: 'lab-light.png', status: 'pass', note: '浮层白底/10 圆角/8px 内距/阴影 7%，越界翻转已实现' },
  { id: 'V11', name: '布局', ref: 'whiteboard-feature.png', check: '左 240 / 右 360 / 画布无限', tolerance: '±40px', shot: 's02-light.png', status: 'pass', note: '左 240 / 右 360，可收合 160ms' },
  { id: 'V12', name: '留白节奏', ref: 'gallery-2.png', check: '卡内 8–12、卡间 ≥24', tolerance: '—', shot: 's02-light.png', status: 'pass', note: '卡内 8–12、卡间 24，无第三档间距' },
  { id: 'V13', name: '动效', ref: 'gallery-3.png', check: '150–200ms、ease-out、三类', tolerance: '≤250ms', shot: '', status: 'pass', note: '120/160/200ms + ease-out；linear 只用于 spinner' },
]

function Shot({ src, alt }: { src: string; alt: string }): JSX.Element {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <div className={s.missing}>待截图（S11）</div>
  return <img src={src} alt={alt} onError={() => setFailed(true)} />
}

export function ReviewFingerprint(): JSX.Element {
  return (
    <div className={s.page}>
      <header className={s.head}>
        <h1>指纹对照 · 13 条</h1>
        <p>
          左：参考图（Plan/references）｜右：实现截图（public/shots）。截图脚本见 Plan/Stage2/README.md §5。
        </p>
      </header>
      <div className={s.table}>
        {ROWS.map((r) => (
          <div className={s.row} key={r.id}>
            <div className={s.meta}>
              <span className={s.id}>{r.id}</span>
              <span className={s.name}>
                <span className={`${s.dot} ${s[r.status]}`} />
                {r.name}
              </span>
              <span className={s.check}>{r.check}</span>
              <span className={s.tol}>容差：{r.tolerance}</span>
              {r.note ? <span className={s.note}>{r.note}</span> : null}
            </div>
            <figure className={s.pane}>
              <img src={`/refs/${r.ref}`} alt={`参考 ${r.name}`} />
              <figcaption>参考 · {r.ref}</figcaption>
            </figure>
            <figure className={`${s.pane} ${s.impl}`}>
              <Shot src={r.shot ? `/shots/${r.shot}` : ''} alt={`实现 ${r.name}`} />
              <figcaption>实现 · {r.shot || '需录屏'}</figcaption>
            </figure>
          </div>
        ))}
      </div>
    </div>
  )
}
