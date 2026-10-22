import io

# 去掉多余的原状态行
p = 'Plan/Stage5/README.md'
t = io.open(p, encoding='utf-8').read()
t = t.replace("\n原状态：5.1–5.8 已落地；5.9 只做了进度环（每周回顾未做）；5.10 增一减一审查未做\n", "")
io.open(p, 'w', encoding='utf-8').write(t)

# ---------- Stage3 ----------
p = 'Plan/Stage3/README.md'
t = io.open(p, encoding='utf-8').read()
t = t.replace("> 状态：T1–T6 已落地；3.4 拖动换位、3.10 视频字幕未做",
"> 状态：12/13 落地；只剩 3.10 视频字幕（COULD）")
t = t.replace("| 3.4 块操作 | ⚠️ | 拆分、合并、`⌥↑↓`、`⌘Z` 有；**拖动换位没做** |",
"| 3.4 块操作 | ✅ | 拖动换位（悬停块左侧出三点手柄，拖到任意块间）、拆分、合并、`⌥↑↓`、`⌘Z` |")
t = t.replace("| 3.7 C36 PDF | ✅ | 3 页真实排版文本层，宽度自适应；无缩放控件 |",
"| 3.7 C36 PDF | ✅ | 3 页真实排版文本层；**50%–200% 缩放**（−/％/＋，点百分比回 100%） |")
t = t.replace("| 3.10 视频字幕 | ⬜ | COULD，未做 |",
"| 3.10 视频字幕 | ⬜ | COULD，未做（需要视频素材） |")
t = t.replace("| 3.12 排版一致 | ✅ | 读/写两图目测一致，未做像素差 |",
"""| 3.12 排版一致 | ✅ | 读/写两图目测一致，未做像素差 |
| 附：高亮保留 | ✅ | 编辑含 `==高亮==` 的段落后，标记不再丢（DOM → markdown 回写，`<mark>` ⇒ `==x==`） |""")
t = t.replace("1. 3.10 视频字幕（COULD）。",
"1. 3.10 视频字幕（COULD，缺素材）。")
t = t.replace("3. PDF 没有缩放控件，只有宽度自适应。", "3. PDF 缩放只有按钮档位，不支持捏合手势。")
t = t.replace("4. 编辑态里带 `==高亮==` 的段落，改过一次后标记会丢（存的是纯文本）。",
"4. 编辑态里输入新的 `==` 不会即时变高亮（只保留已有的），需要先选中再点工具条（工具条未做）。")
io.open(p, 'w', encoding='utf-8').write(t)
print('stage3 ok')

# ---------- Stage6 ----------
p = 'Plan/Stage6/README.md'
t = io.open(p, encoding='utf-8').read()
t = t.replace("| 6.1 应用区计数 + 标签系统 | ⚠️ | 徽标有了；**标签的置顶/分组/文件夹没做**，左栏还是平铺 |",
"| 6.1 应用区计数 + 标签系统 | ✅ | 徽标 + 3 个置顶（带计数）+「我的标签」分组 + 3 个文件夹（可折叠，显示条目数） |")
t = t.replace("| 6.9 快捷键总表 | ⬜ | 面板里留了入口，点击提示「原型未实现」 |",
"| 6.9 快捷键总表 | ✅ | `?` 打开；4 组 33 条，可搜；**只列已在代码里绑定的**，未实现的导出不列 |")
t = t.replace("| 6.10 压力数据 | ⚠️ | 1000 张卡达成；**板 8 个、标签 20 个**，没按 40/60 造 |",
"| 6.10 压力数据 | ✅ | 1000 张卡 / **40 块板** / **61 个标签** |")
t = t.replace("| 6.1 应用区计数 + 标签系统 | ⚠️ |", "| 6.1 应用区计数 + 标签系统 | ✅ |")
t = t.replace("""1. **列表只渲染前 120 张**，点「显示更多」每次加 200；没有虚拟滚动。
2. **标签库只取前 40 行**，1000 行滚动会明显掉帧。
3. **看板不能拖**，只能点「→」换列——4.1 的拖拽没有复用到这里。
4. **6.1 的标签分组/文件夹没做**，左栏仍是平铺的 4 个标签。
5. **6.9 快捷键总表**只是占位。""",
"""1. **列表只渲染前 120 张**，点「显示更多」每次加 200；没有虚拟滚动。
2. **标签库只取前 40 行**，1000 行滚动会明显掉帧。
3. **看板不能拖**，只能点「→」换列——4.1 的拖拽没有复用到这里。
4. 标签只有 3 个置顶位，超出会静默丢弃（`slice(0, 3)`）。""")
io.open(p, 'w', encoding='utf-8').write(t)
print('stage6 ok')

# ---------- Plan/README 状态表 ----------
p = 'Plan/README.md'
t = io.open(p, encoding='utf-8').read()
t = t.replace("| Stage 2 | ✅ 完成（T2 待真人测） | [Stage2/04-验收记录.md](Stage2/04-验收记录.md)：12 ✅ + 1 ⚠️ |",
"| Stage 2 | ✅ 完成（T2 待真人测） | [Stage2/04-验收记录.md](Stage2/04-验收记录.md)；测试材料见 [T2-辨识测试.md](T2-辨识测试.md) |")
t = t.replace("| Stage 3 | ✅ 三屏与摘录闭环 | [Stage3/README.md](Stage3/README.md) §7 |",
"| Stage 3 | ✅ 12/13 | [Stage3/README.md](Stage3/README.md) §7（3.10 视频字幕仍未做） |")
t = t.replace("| Stage 4 | 🟡 主体可交互 | [Stage4/README.md](Stage4/README.md)：11/13 项 |",
"| Stage 4 | ✅ 13/13 | [Stage4/README.md](Stage4/README.md) §6 手感基线（录屏对比缺） |")
t = t.replace("| Stage 5 | 🟡 主体已可用 | [Stage5/README.md](Stage5/README.md)：8/10 项，每周回顾与增一减一未做 |",
"| Stage 5 | ✅ 10/10 | [Stage5/README.md](Stage5/README.md) §6 增一减一 |")
t = t.replace("| Stage 6 | 🟡 主体可用 | [Stage6/README.md](Stage6/README.md)：7/10 项，标签分组/快捷键表/数据规模未达标 |",
"| Stage 6 | ✅ 10/10 | [Stage6/README.md](Stage6/README.md)（虚拟滚动与看板拖拽另记） |")
io.open(p, 'w', encoding='utf-8').write(t)
print('plan ok')
