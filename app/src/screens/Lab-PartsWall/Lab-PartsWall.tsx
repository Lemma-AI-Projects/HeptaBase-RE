import { useEffect, useLayoutEffect, useRef, useState, type JSX, type ReactNode } from 'react'
import { Button } from '@/parts/C60-Button'
import { IconButton } from '@/parts/C61-IconButton'
import { Input } from '@/parts/C62-Input'
import { Popover } from '@/parts/C63-Popover'
import { Tooltip } from '@/parts/C64-Tooltip'
import { Divider } from '@/parts/C67-Divider'
import { CardNode } from '@/parts/C11-CardNode'
import { SectionBox } from '@/parts/C12-SectionBox'
import { Edge } from '@/parts/C15-Edge'
import { TextNode } from '@/parts/C13-TextNode'
import { MediaNode } from '@/parts/C14-MediaNode'
import { CanvasToolbar } from '@/parts/C19-CanvasToolbar'
import { ZoomDock } from '@/parts/C20-ZoomDock'
import { StatusDock } from '@/parts/C08-StatusDock'
import { CARD_COLORS } from '@/tokens'
import { CurvesSvg } from '@/fixtures/assets/CurvesSvg'
import s from './Lab-PartsWall.module.css'

type Anchor = { x: number; y: number; w: number; h: number }

function Row({
  name,
  desc,
  children,
  anchor,
}: {
  name: string
  desc: string
  children: ReactNode
  anchor?: string
}) {
  return (
    <section className={s.row} data-section={anchor}>
      <header className={s.rowHead}>
        <h2>{name}</h2>
        <p>{desc}</p>
      </header>
      <div className={s.rowBody}>{children}</div>
    </section>
  )
}

/** 五态表：不适用的格子写「—」，不硬凑 */
function StateGrid({
  rows,
}: {
  rows: { part: string; cells: [ReactNode, ReactNode, ReactNode, ReactNode, ReactNode] }[]
}) {
  const head = ['默认', '悬停', '选中 / 激活', '禁用', '空']
  return (
    <div className={s.grid}>
      <div className={`${s.gridRow} ${s.gridHead}`}>
        <span />
        {head.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.part} className={s.gridRow}>
          <span className={s.gridPart}>{r.part}</span>
          {r.cells.map((c, i) => (
            <div key={i} className={s.gridCell}>
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const NA = <span className={s.na}>—</span>

function useAnchor<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const r = ref.current?.getBoundingClientRect()
      if (r) setAnchor({ x: r.x, y: r.y, w: r.width, h: r.height })
    }
    measure()
    // 页面滚动容器不是 window，scroll 不冒泡，必须用捕获
    document.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      document.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [])
  return { ref, anchor }
}

function OpenPopover({ label, width = 200 }: { label: string; width?: number }) {
  const { ref, anchor } = useAnchor<HTMLButtonElement>()
  return (
    <>
      <button ref={ref} type="button" className={s.anchorBtn}>
        {label}
      </button>
      <Popover anchor={anchor} open width={width} modal>
        <div className={s.menu}>
          <div className={s.menuItem}>改颜色</div>
          <div className={s.menuItem}>折叠</div>
          <div className={s.menuSep} />
          <div className={`${s.menuItem} ${s.danger}`}>删除</div>
        </div>
      </Popover>
    </>
  )
}

/** 四向翻转：四个锚点放在舞台四角，浮层必须朝空的一侧开 */
function FlipDemo() {
  const show = window.location.hash.includes('section=flip')
  const stageRef = useRef<HTMLDivElement>(null)
  const a1 = useAnchor<HTMLButtonElement>()
  const a2 = useAnchor<HTMLButtonElement>()
  const a3 = useAnchor<HTMLButtonElement>()
  const a4 = useAnchor<HTMLButtonElement>()
  const spots = [
    { a: a1, style: { left: 0, top: 8 }, text: '左上锚点 → 应朝右下' },
    { a: a2, style: { right: 0, top: 8 }, text: '右上锚点 → 应朝左下' },
    { a: a3, style: { left: 0, bottom: 8 }, text: '左下锚点 → 应朝右上' },
    { a: a4, style: { right: 0, bottom: 8 }, text: '右下锚点 → 应朝左上' },
  ]

  return (
    <div className={s.flipStage} ref={stageRef} data-flip>
      {spots.map((sp, i) => (
        <div key={i} className={s.flipSpot} style={sp.style}>
          <button ref={sp.a.ref} type="button" className={s.anchorBtn}>
            锚点 {i + 1}
          </button>
          <Popover anchor={sp.a.anchor} open={show} width={210}>
            <div className={s.menu}>
              <div className={s.menuItem}>{sp.text}</div>
              <div className={s.menuSep} />
              <div className={s.menuItem}>菜单项一</div>
              <div className={s.menuItem}>菜单项二</div>
            </div>
          </Popover>
        </div>
      ))}
    </div>
  )
}

const SAMPLE_CARD = {
  id: 'demo',
  title: '提取练习（testing effect）',
  lines: ['读会制造熟悉感', '测才逼出检索路径', '一周后差 20 个百分点'],
  color: 'blue' as const,
}

export function LabPartsWall(): JSX.Element {
  useEffect(() => {
    const q = window.location.hash.split('?')[1] ?? ''
    const section = new URLSearchParams(q).get('section')
    if (!section) return
    const t = window.setTimeout(() => {
      document.querySelector(`[data-section="${section}"]`)?.scrollIntoView({ block: 'start' })
    }, 200)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h1>零件墙 · Stage 2 / 3</h1>
        <p>
          27 个零件。悬停与聚焦用 data-force 常驻；不适用的态写「—」，不硬凑五个。
        </p>
      </header>

      <Row name="2.3 通用件 · 五态" desc="C60 按钮 / C61 图标按钮 / C62 输入框 / C63 浮层 / C64 提示 / C67 分隔线">
        <StateGrid
          rows={[
            {
              part: 'C60 按钮',
              cells: [
                <Button label="取消" />,
                <Button label="取消" force="hover" />,
                <Button label="开始复习" variant="primary" />,
                <Button label="保存" disabled disabledReason="没有改动" />,
                NA,
              ],
            },
            {
              part: 'C61 图标按钮',
              cells: [
                <IconButton icon="card" tooltip="新建卡片" />,
                <IconButton icon="card" force="hover" />,
                <IconButton icon="cursor" active />,
                <IconButton icon="upload" disabled />,
                NA,
              ],
            },
            {
              part: 'C62 输入框',
              cells: [
                <div className={s.inputW}>
                  <Input value="" placeholder="搜索卡片…" />
                </div>,
                NA,
                <div className={s.inputW}>
                  <Input value="间隔重复" force="focus" />
                </div>,
                <div className={s.inputW}>
                  <Input value="不可编辑" disabled />
                </div>,
                <div className={s.inputW}>
                  <Input value="" error errorText="至少 2 个字" />
                </div>,
              ],
            },
            {
              part: 'C64 提示',
              cells: [
                <Tooltip label="选择" shortcut="V" placement="right" open>
                  <span className={s.anchorBtn}>悬停 300ms</span>
                </Tooltip>,
                NA,
                NA,
                NA,
                <span className={s.muted}>label 为空 → 不显示</span>,
              ],
            },
            {
              part: 'C67 分隔线',
              cells: [
                <div className={s.dividerW}>
                  <Divider />
                </div>,
                NA,
                <div className={s.dividerW}>
                  <Divider inset />
                </div>,
                NA,
                <div className={s.dividerW}>
                  <Divider orientation="vertical" />
                </div>,
              ],
            },
            {
              part: 'C63 浮层',
              cells: [
                <span className={s.muted}>关闭</span>,
                NA,
                <span className={s.muted}>见下方「C63 边缘翻转」</span>,
                NA,
                <span className={s.muted}>无内容 → 不渲染</span>,
              ],
            },
          ]}
        />
        <p className={s.footnote}>
          注：C62 最后一格是错误态（空值提交的典型结果），C67 最后一格是垂直分隔线；其余「—」表示该零件没有这个态。
        </p>
      </Row>

      <Row anchor="canvas" name="2.4–2.8 画布零件 · 五态" desc="C11 卡片 / C12 分区 / C13 文本 / C14 媒体 / C15 连线">
        <StateGrid
          rows={[
            {
              part: 'C11 卡片',
              cells: [
                <CardNode card={{ ...SAMPLE_CARD, lines: ['读会制造熟悉感', '测才逼出检索路径'] }} width={168} height={126} />,
                <CardNode card={{ ...SAMPLE_CARD, lines: ['读会制造熟悉感', '测才逼出检索路径'] }} width={168} height={126} force="hover" />,
                <CardNode card={{ ...SAMPLE_CARD, lines: ['读会制造熟悉感', '测才逼出检索路径'] }} width={168} height={126} force="selected" />,
                <CardNode card={{ ...SAMPLE_CARD, lines: ['读会制造熟悉感', '测才逼出检索路径'] }} width={168} height={126} force="disabled" />,
                <CardNode card={{ id: 'e', title: '', lines: [], color: 'gray' }} width={168} height={80} />,
              ],
            },
            {
              part: 'C12 分区',
              cells: [
                <div className={s.miniSection}>
                  <SectionBox title="为什么间隔有效" color="blue" rect={{ x: 0, y: 28, w: 160, h: 56 }} count={8} />
                </div>,
                <div className={s.miniSection}>
                  <SectionBox title="悬停" color="blue" rect={{ x: 0, y: 28, w: 160, h: 56 }} count={8} force="hover" />
                </div>,
                <div className={s.miniSection}>
                  <SectionBox title="选中" color="orange" rect={{ x: 0, y: 28, w: 160, h: 56 }} count={8} selected />
                </div>,
                <div className={s.miniSection}>
                  <SectionBox title="禁用" color="green" rect={{ x: 0, y: 28, w: 160, h: 56 }} count={8} force="disabled" />
                </div>,
                <div className={s.miniSection}>
                  <SectionBox title="" color="gray" rect={{ x: 0, y: 28, w: 160, h: 56 }} count={0} />
                </div>,
              ],
            },
            {
              part: 'C13 文本',
              cells: [
                <div className={s.miniText}>
                  <TextNode x={0} y={0} width={168} size="title">小标题一行</TextNode>
                </div>,
                NA,
                <div className={s.miniText}>
                  <TextNode x={0} y={0} width={168} size="title" selected>小标题一行</TextNode>
                </div>,
                NA,
                <div className={`${s.miniText} ${s.miniDashed}`}>
                  <TextNode x={0} y={0} width={168} size="body">{''}</TextNode>
                </div>,
              ],
            },
            {
              part: 'C14 媒体',
              cells: [
                <div className={s.miniMedia}>
                  <MediaNode x={0} y={0} width={168} height={92} caption="图 1">
                    <CurvesSvg />
                  </MediaNode>
                </div>,
                NA,
                <div className={s.miniMedia}>
                  <MediaNode x={0} y={0} width={168} height={92} selected>
                    <CurvesSvg />
                  </MediaNode>
                </div>,
                <div className={s.miniMedia}>
                  <MediaNode x={0} y={0} width={168} height={92} disabled>
                    <CurvesSvg />
                  </MediaNode>
                </div>,
                <div className={`${s.miniMedia} ${s.miniDashed}`}>
                  <MediaNode x={0} y={0} width={168} height={92} caption="无源">
                    {null}
                  </MediaNode>
                </div>,
              ],
            },
            {
              part: 'C15 连线',
              cells: [
                <svg width={168} height={84}>
                  <Edge from={{ x: 12, y: 16 }} to={{ x: 150, y: 68 }} fromSide="r" toSide="l" />
                </svg>,
                NA,
                <svg width={168} height={84}>
                  <Edge from={{ x: 12, y: 16 }} to={{ x: 150, y: 68 }} fromSide="r" toSide="l" selected />
                </svg>,
                <svg width={168} height={84}>
                  <Edge from={{ x: 12, y: 16 }} to={{ x: 150, y: 68 }} fromSide="r" toSide="l" disabled />
                </svg>,
                <span className={s.muted}>缺端点 → 不渲染</span>,
              ],
            },
          ]}
        />
      </Row>


      <Row anchor="flip" name="C63 边缘翻转" desc="四个角各放一个锚点：越界就往空的一侧翻，绝不压住锚点">
        <FlipDemo />
      </Row>

      <Row name="C11 卡片 · 7 色" desc="颜色只在卡头与卡底；正文永远 --c-text">
        {CARD_COLORS.map((c) => (
          <div key={c} className={s.cell}>
            <div className={s.cellBody}>
              <CardNode card={{ ...SAMPLE_CARD, color: c }} width={200} height={128} />
            </div>
            <span className={s.cellLabel}>{c}</span>
          </div>
        ))}
      </Row>

      <Row name="C15 连线" desc="曲线 / 直角；单向 / 双向；带标签；选中">
        <div className={s.edgeStage}>
          <svg width="1000" height="180">
            <Edge from={{ x: 40, y: 40 }} to={{ x: 220, y: 120 }} fromSide="r" toSide="l" />
            <Edge from={{ x: 270, y: 40 }} to={{ x: 450, y: 120 }} fromSide="r" toSide="l" direction="both" />
            <Edge from={{ x: 500, y: 40 }} to={{ x: 680, y: 120 }} fromSide="r" toSide="l" shape="ortho" />
            <Edge from={{ x: 730, y: 40 }} to={{ x: 910, y: 120 }} fromSide="b" toSide="t" label="成本旋钮" />
            <Edge from={{ x: 940, y: 40 }} to={{ x: 940, y: 120 }} fromSide="b" toSide="t" selected />
          </svg>
        </div>
      </Row>


      <Row anchor="float" name="C19 工具栏 · 五态" desc="默认 / 悬停 / 激活 / 禁用（只读）/ 空（无工具）">
        {[
          ['默认', <div className={s.toolStage}><CanvasToolbar tool="select" /></div>],
          ['悬停', <div className={s.toolStage}><CanvasToolbar tool="select" forceHoverFirst /></div>],
          ['激活', <div className={s.toolStage}><CanvasToolbar tool="card" /></div>],
          ['禁用（只读）', <div className={s.toolStage}><CanvasToolbar tool="select" readonly /></div>],
          ['空', <div className={s.toolStage}><CanvasToolbar tool="select" empty /></div>],
        ].map(([label, node]) => (
          <div key={String(label)} className={s.cell}>
            <div className={s.cellBody}>{node as ReactNode}</div>
            <span className={s.cellLabel}>{label as string}</span>
          </div>
        ))}
      </Row>

      <Row name="C20 缩放 / C08 状态" desc="默认 / 换值 / 适配 / 禁用；没有的态写「—」">
        {[
          ['C20 默认', <div className={s.dockStage}><ZoomDock zoom={1} /></div>],
          ['C20 放大', <div className={s.dockStage}><ZoomDock zoom={1.5} /></div>],
          ['C20 适配后', <div className={s.dockStage}><ZoomDock zoom={0.42} /></div>],
          ['C20 禁用', <div className={s.dockStage}><ZoomDock zoom={1} disabled /></div>],
          ['C08 默认', <div className={s.statusStage}><StatusDock zoom={1} selectionCount={2} /></div>],
          ['C08 无选中', <div className={s.statusStage}><StatusDock zoom={0.6} selectionCount={0} /></div>],
          ['C08 未保存', <div className={s.statusStage}><StatusDock zoom={1} selectionCount={1} unsaved /></div>],
          ['C08 只读', <div className={s.statusStage}><StatusDock zoom={1} selectionCount={0} readonly /></div>],
        ].map(([label, node]) => (
          <div key={String(label)} className={s.cell}>
            <div className={s.cellBody}>{node as ReactNode}</div>
            <span className={s.cellLabel}>{label as string}</span>
          </div>
        ))}
      </Row>


    </div>
  )
}
