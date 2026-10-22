import io

p = 'src/parts/C02-AppRail/C02-AppRail.tsx'
t = io.open(p, encoding='utf-8').read()

t = t.replace("import { Divider } from '../C67-Divider/C67-Divider'",
"import { Divider } from '../C67-Divider/C67-Divider'\nimport { navigate } from '@/lib/hash-route'")

# 应用 → 路由兜底
t = t.replace("export type AppRailProps = {",
"""const APP_ROUTE: Record<string, string> = {
  inbox: '/s11',
  today: '/s01',
  board: '/s02',
  library: '/s08',
  tags: '/s09',
  highlight: '/s05',
  chat: '/s02?demo=ai',
}

export type AppRailProps = {""")

# 顶部三按钮
t = t.replace("""          <Icon name="sparkles" size={16} />
          <span>新建学习主题</span>
        </button>
        <button type="button" className={s.square} aria-label="新建">
          <Icon name="plus" size={18} />
        </button>
        <button type="button" className={s.square} aria-label="搜索">
          <Icon name="search" size={18} />
        </button>""",
"""          <Icon name="sparkles" size={16} />
          <span>新建学习主题</span>
        </button>
        <button
          type="button"
          className={s.square}
          aria-label="新建"
          title="新建卡片"
          onClick={() => (onNewTopicClicked ? onNewTopicClicked() : navigate('/s02?demo=newcard'))}
        >
          <Icon name="plus" size={18} />
        </button>
        <button
          type="button"
          className={s.square}
          aria-label="搜索"
          title="全局搜索 ⌘O"
          onClick={() => navigate('/s08?demo=search')}
        >
          <Icon name="search" size={18} />
        </button>""")

# 「新建学习主题」按钮本体
t = t.replace("""        <button type="button" className={s.research} onClick={onNewTopicClicked}>""",
"""        <button
          type="button"
          className={s.research}
          onClick={() => (onNewTopicClicked ? onNewTopicClicked() : navigate('/s02?demo=newcard'))}
        >""")

# 应用按钮兜底
t = t.replace("              onClick={() => onAppSelected?.(app.id)}",
"""              onClick={() =>
                onAppSelected ? onAppSelected(app.id) : navigate(APP_ROUTE[app.id] ?? '/s02')
              }""")

# 新建标签
t = t.replace("""          <button type="button" className={s.tagAdd} aria-label="新建标签">
            <Icon name="plus" size={14} />
          </button>""",
"""          <button
            type="button"
            className={s.tagAdd}
            aria-label="新建标签"
            onClick={() => navigate('/s09')}
          >
            <Icon name="plus" size={14} />
          </button>""")

# 置顶标签
t = t.replace("""                <button type="button" className={`${s.tag} ${s.pinned}`}>
                  <span className={s.pin} aria-hidden="true" />
                  {t.name}""",
"""                <button
                  type="button"
                  className={`${s.tag} ${s.pinned}`}
                  onClick={() => navigate(`/s08?tag=${encodeURIComponent(t.name)}`)}
                >
                  <span className={s.pin} aria-hidden="true" />
                  {t.name}""")

# 分组标签
t = t.replace("""                  <button type="button" className={s.tag}>
                    <span className={s.hash}>#</span>
                    {t.name}""",
"""                  <button
                    type="button"
                    className={s.tag}
                    onClick={() => navigate(`/s08?tag=${encodeURIComponent(t.name)}`)}
                  >
                    <span className={s.hash}>#</span>
                    {t.name}""")

# 文件夹里的标签
t = t.replace("""                      <button type="button" className={`${s.tag} ${s.nested}`}>
                        <span className={s.hash}>#</span>
                        {t.name}""",
"""                      <button
                        type="button"
                        className={`${s.tag} ${s.nested}`}
                        onClick={() => navigate(`/s08?tag=${encodeURIComponent(t.name)}`)}
                      >
                        <span className={s.hash}>#</span>
                        {t.name}""")
io.open(p, 'w', encoding='utf-8').write(t)
print('c02 ok', t.count('navigate('))
