# Stage 2 · 施工方案

> 交付：**设计系统 + S02 静态白板屏（只读、可缩放浏览）**
> 依据：[04-阶段任务与验收](../04-阶段任务与验收.md) Stage 2 的 2.1–2.13｜[01-范围与基准](../01-范围与基准.md) V1–V13
> 状态：全部 11 步已落地；验收见 [04-验收记录.md](04-验收记录.md)（12 ✅ + 1 ⚠️，T2 待真人测）

---

## 1. 四份文件

| 文件 | 内容 | 什么时候用 |
| --- | --- | --- |
| 本文件 | 技术栈、目录结构、施工顺序、验收映射、边界 | 开工前 + 每步收尾 |
| [01-设计基准.md](01-设计基准.md) | V1–V13 的**确定数值**（颜色/字阶/间距/圆角/阴影/动效/暗色/描边） | 写第一行 CSS 前 |
| [02-零件墙.md](02-零件墙.md) | 19 个零件的输入输出、五态、4 个易错零件的实现约束 | 写任何一个零件前 |
| [03-S02内容.md](03-S02内容.md) | 那块板的真实内容：32 卡 / 4 分区 / 6 连线 / 布局算法 | 合成 S02 时 |
| [04-验收记录.md](04-验收记录.md) | 13 条指纹逐条结论 + 7 项验收结论 + 复现命令 | 每次交付前 |

---

## 2. 技术栈

| 项 | 选型 | 理由（一句话） |
| --- | --- | --- |
| 框架 | React 19 + TypeScript（strict） | 51 个零件各自成文件，契约最好落地 |
| 构建 | Vite | dev server 起得够快，build 出纯静态 |
| 样式 | CSS Modules + CSS 变量 | 零件样式互相隔离；数值只来自 tokens |
| 路由 | 手写 hash 路由（约 20 行） | 只有 `/s02` `/lab` `/fp` 三个页面，不值得引库 |
| 状态 | 无全局 store | Stage 2 所有状态都在屏幕层 `useState` |
| 图标 | `src/icons/` 内联 SVG，20px 网格 / 1.5 描边 | V9：图标不引库、不加彩色 |
| UI 库 | **不引**（无 MUI / shadcn / Tailwind） | 参考图的比例没法和现成组件对齐 |

安装：`react` `react-dom` `vite` `@vitejs/plugin-react` `typescript` `@types/react` `@types/react-dom`。仅此 7 个。

---

## 3. 目录结构

```
app/
├─ index.html
├─ package.json  tsconfig.json  vite.config.ts
├─ public/shots/                 # 截图落盘（T1 用）
└─ src/
   ├─ main.tsx  App.tsx          # App = hash 路由表
   ├─ styles/
   │   ├─ reset.css
   │   ├─ tokens.css             # 唯一数值来源
   │   └─ shell.css              # 三栏壳的布局常量
   ├─ tokens/index.ts            # 与 tokens.css 同名同值
   ├─ icons/                     # Icon 组件 + 20 个路径
   ├─ lib/
   │   ├─ hash-route.ts
   │   ├─ renderInline.ts        # "- " 列表 / "==" 高亮
   │   └─ board-layout.ts        # 卡片流布局 + 连线锚点
   ├─ parts/                     # 19 个零件，一零件一目录
   ├─ fixtures/
   │   ├─ board-spaced-repetition.ts
   │   └─ assets/CurvesSvg.tsx  FsrsSvg.tsx
   └─ screens/
       ├─ S02-Whiteboard/
       ├─ Lab-PartsWall/
       └─ Review-Fingerprint/
```

**依赖方向（单向，违反即返工）**：`screens → parts → tokens / lib / icons`。`parts` 之间只准通过 `index.ts` 引用；`parts` 不许 import `fixtures` 与 `screens`。

---

## 4. 施工顺序（11 步，对应 2.1–2.13）

每步结束都要能 `npm run dev` 打开看到东西——不允许出现"这一步做完什么也看不见"。

| # | 步骤 | 产出 | 完成判据 | 体量 |
| --- | --- | --- | --- | --- |
| S0 | 脚手架 | Vite+TS 起得来；`tokens.css` / `tokens/index.ts` 全量落地；`#/lab` `#/s02` 两个空路由 | 打开 `#/s02` 看到一块 `--c-canvas` 的空画布 | S |
| S1 | 通用件 2.3 | C60 C61 C62 C63 C64 C67 | 零件墙第一段：6 个零件 × 5 态 | M |
| S2 | 卡片 2.4 | C11，7 色 × 5 态（含折叠、掌握度角标位） | 零件墙第二段：35 个实例同屏不串色 | M |
| S3 | 分区 2.5 | C12，胶囊头 + 浅底 + 折叠 + 拖入容纳的高亮态 | 分区里塞 4 张卡，边界不压卡 | S |
| S4 | 连线 2.6 | C15，曲线/直角 × 单向/双向 × 带标签/箭头 | 6 种组合并排，标签不压线 | S |
| S5 | 文本与媒体 2.7 | C13 C14（只读渲染） | 文本块与图片块进零件墙，CRLF 换行不塌 | S |
| S6 | 画布 2.8 | C10：坐标、缩放 10–400%、平移、滚轮三态、空格抓手、`⌘0` 适配 | 缩放 400% 再回 10%，视口中心不漂 | L |
| S7 | 浮件 2.9 | C19 C20 C08 | 工具栏 7 个按钮、缩放控件、角标读数与 C10 同步 | S |
| S8 | 外框 2.10 | C01 C02 C03 C04（静态数据） | 三栏 + 标签条 + 侧栏选中态，收合 160ms | M |
| S9 | 合成 S02 2.11 | `board-spaced-repetition` fixture + 三层渲染 | 46 个对象全上；无一处重叠；A 区可读 | L |
| S10 | 暗色 2.12 | 仅零件墙 + S02 的暗色 | 切 `data-theme="dark"`，卡片靠描边仍分层 | M |
| S11 | 指纹对照 2.13 | `#/fp`：13 行"参考图｜实现"并排 + 打勾表 | 13/13 打完勾 | M |

**S9 是唯一可能卡住的一步**：对象重叠、连线穿卡、胶囊压字，三者任一出问题就回到 S2/S3/S4 改零件，不在 S9 打补丁。

---

## 5. 截图与自检流程

```bash
cd app
npm run dev                       # 5173
npm run build && npx tsc --noEmit # 每步收尾必跑
```

固定视口截图（已落地为 `app/scripts/shot.mjs`，走 CDP，出图正好 1440×900）：

```bash
cd app
node scripts/shot.mjs "http://localhost:5173/#/s02?theme=light" public/shots/s02-light.png
node scripts/shot.mjs "http://localhost:5173/#/s02?theme=dark"  public/shots/s02-dark.png
node scripts/shot.mjs "http://localhost:5173/#/lab?theme=light" public/shots/lab-light.png
node scripts/shot.mjs "http://localhost:5173/#/fp?theme=light"  public/shots/fp-light.png
```

坑（都踩过）：
- 直接 `chrome --screenshot` 时，`--window-size=1440,900` 得到的是**窗口**尺寸，视口只有 787 高，图底部会留一条空带；CDP 的 `Emulation.setDeviceMetricsOverride` 才是真视口。
- 截图路径必须写绝对路径，否则 Chrome 相对自己的安装目录写文件。
- 必须给工作区内的 `--user-data-dir`（如 `app/.chrome-shot`），否则沙箱会拦 Chrome 的默认 profile。
- `localStorage` 会记住上一次的主题；用 `?theme=light|dark` 强制覆盖。

同屏还要出 `s02-fit`（`?fit=1` 自动适配全板）与 `s02-zoom60`（`?zoom=0.6`）。

T1 对照（13 条 → 参考图）：

| # | 项目 | 对照图 | 判据 |
| --- | --- | --- | --- |
| V1 | 画布底色 | `heptabase-ui/whiteboard-feature.png` | 取色 ±3% 明度 |
| V2 | 卡片本体 | 同上 | 阴影 ≤8% 不透明、模糊 ≤6px |
| V3 | 圆角 | `wiki/fe-02.png` | 卡 8 / 浮层 10，±2px |
| V4 | 正文排版 | `ui/kb-block-editor.png` | 13–14px、行高 1.6 |
| V5 | 界面文字 | `wiki/ui-01.png` | 12–13px、次要 55–65% 灰 |
| V6 | 强调色 | `ui/kb-daily-journals.png` | 每屏 ≤3 处 |
| V7 | 卡片色板 | `wiki/fe-01.png` | 饱和度 ≤35%，正文黑字 |
| V8 | 分区 | `ui/gallery-1.png` | 实色胶囊 + 浅底，无边框 |
| V9 | 图标 | `wiki/ui-01.png` | 1.5px 线性、灰度、20px 网格 |
| V10 | 浮层 | `ui/kb-pdf-annot-menu.png` | 不盖视口中心 |
| V11 | 布局 | `whiteboard-feature.png` | 左 240 / 右 360，±40px |
| V12 | 留白 | `gallery-2.png`（松）`gallery-3.png`（密） | 卡内 8–12 / 卡间 ≥24 |
| V13 | 动效 | 无图 | 录 10 秒：全部 150–200ms、无 linear |

---

## 6. 验收映射

| 04 验收项 | 由哪一步产生 | 怎么证明 |
| --- | --- | --- |
| T1 指纹 13/13 | S11 | `#/fp` 全勾，附 4 张截图 |
| T2 三秒辨识 ≥90% | S2 S3 S5 | 4 类零件（卡/分区/文本/浮层）混排截图，5 人认 |
| 零件墙 5 态齐全 | S1–S5 | 零件墙无"只有默认态"的行 |
| 缩放 60% 能分辨折叠/展开/选中 | S6 S9 | `s02-zoom60.png`，A7 折叠 + 一张选中 |
| 1x/2x 无脏边、无粗细跳变 | S0 S6 | 同屏 DPR1 与 DPR2 对比，描边走 `--hair` |
| 暗色仍分层 | S10 | 关阴影截图，边界仍可辨 |
| S02 无两套字号 | S9 | 量图：正文只出现 12/13/14 |

---

## 7. 边界（这一阶段明确不做）

| 不做 | 留到 |
| --- | --- |
| 拖拽 / 吸附 / 框选 / 右键菜单 / 选中工具条（C16 C17 C21 C22） | Stage 4 |
| 小地图、面包屑、聚焦模式（C18 C07） | Stage 4 |
| 卡片编辑、斜杠菜单、划线摘录（C30–C37） | Stage 3 |
| 右栏工具内容（C05/C06 只放空壳占宽） | Stage 3–5 |
| 空板 / 加载 / 错误态 | Stage 4 / Stage 7 |
| 任何网络请求、任何真实模型 | 不接（A3） |

---

## 8. 风险

| 风险 | 处理 |
| --- | --- |
| 缩放后文字发虚 | 只用 `transform: scale`，不用 `zoom`；不用 `will-change` 长期挂载 |
| 1px 描边在 60% 变灰线 | 走 `--hair` 补偿，S6 收尾时用 10%/60%/400% 三张截图验 |
| 卡内容溢出撑高 | fixture 给 `h`，超出 `line-clamp` + 底部渐隐，不自动长高 |
| 暗色照抄亮色导致发灰 | 暗色只用 §3 的映射表，不复用 `--sh-*` |
| 零件越做越多 | 只做 19 个；新零件先进 [02-零件墙.md](02-零件墙.md) 表再加 |
| 把参考图的偶然细节当规范 | 每条指纹有容差，容差内不返工 |

---

## 9. 开工第一件事

S0 三步：`npm create vite@latest app -- --template react-ts` → 把 `01-设计基准.md` 全量写成 `tokens.css` + `tokens/index.ts` → 起 `#/s02` 空画布。
