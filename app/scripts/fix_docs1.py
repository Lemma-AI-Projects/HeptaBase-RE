import io, re

# ---------- A. V7 / V8 文案对齐参考图 ----------
p = 'Plan/01-范围与基准.md'
t = io.open(p, encoding='utf-8').read()
t = t.replace(
"| V7 | 卡片色板 | 低饱和粉彩（绿/蓝/橙/紫/红/黄/灰），色只在卡头或分区头 | 颜色用来分类不用来装饰；正文永远黑字 | 饱和度 ≤ 35% |",
"| V7 | 卡片色板 | 低饱和粉彩（绿/蓝/橙/紫/红/黄/灰），**整卡浅底色 + 分区实色胶囊**（按 references 里的参考图更正） | 颜色用来分类不用来装饰；正文永远黑字 | 饱和度 ≤ 35% |")
t = t.replace(
"| V8 | 分区 | 上边缘一条胶囊标签，与内部卡片同色系但更浅 | 让\"组\"一眼可辨，不必画边框 | — |",
"| V8 | 分区 | 上边缘一条**实色胶囊 + 白字**，下方分区底色比卡片更浅 | 让\"组\"一眼可辨，不必画边框 | — |")
io.open(p, 'w', encoding='utf-8').write(t)
print('V7/V8 ok', '整卡浅底色' in t)

p = 'Plan/Stage2/01-设计基准.md'
t = io.open(p, encoding='utf-8').read()
t = t.replace("色只出现在**卡头细条、分区胶囊、分区底色**上；卡片正文永远是 `--c-text`。",
"色出现在**卡片整卡浅底色、分区实色胶囊、分区浅底色**上；卡片正文永远是 `--c-text`。")
t = t.replace("""> 与 01 文档 V8 的偏差说明：V8 写"胶囊更浅"，参考图是**实色胶囊白字**。以图为准，V8 文字随后修订。""",
"""> V7 / V8 已于 2026-10-22 按参考图更正（`01-范围与基准.md` 已改）：卡片是整卡浅底色，分区是实色胶囊白字。原型与文档现在一致。""")
io.open(p, 'w', encoding='utf-8').write(t)
print('基准 ok', '已经' not in t)

# ---------- B. 勾选 04 ----------
p = 'Plan/04-阶段任务与验收.md'
lines = io.open(p, encoding='utf-8').read().split('\n')
done = ['3.4', '4.11', '5.9', '5.10', '6.1', '6.9', '6.10']
n = 0
for i, l in enumerate(lines):
    m = re.match(r'- \[ \] (\d+\.\d+)', l)
    if m and m.group(1) in done:
        lines[i] = l.replace('- [ ]', '- [x]', 1)
        n += 1
io.open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('04 checked', n)
