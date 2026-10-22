import type { JSX, ReactNode } from 'react'

/**
 * 极简行内标记：行首 "- " 为列表项，"==x==" 为高亮。
 * 只读渲染，不解析完整 Markdown。
 */
const renderMarks = (text: string, keyBase: string): ReactNode[] => {
  const out: ReactNode[] = []
  const parts = text.split(/(==[^=]+==)/g)
  parts.forEach((part, i) => {
    if (part.startsWith('==') && part.endsWith('==')) {
      out.push(<mark key={`${keyBase}-m${i}`}>{part.slice(2, -2)}</mark>)
    } else if (part) {
      out.push(part)
    }
  })
  return out
}

export function Inline({ text }: { text: string }): ReactNode {
  return <>{renderMarks(text, 'i')}</>
}

export function InlineLines({
  lines,
  className,
}: {
  lines: string[]
  className?: string
}): JSX.Element {
  const items = lines.filter((l) => l.trim().length > 0)
  return (
    <ul className={className}>
      {items.map((line, i) => {
        const bullet = line.startsWith('- ')
        const text = bullet ? line.slice(2) : line
        return (
          <li key={i} className={bullet ? 'isBullet' : undefined}>
            {renderMarks(text, `l${i}`)}
          </li>
        )
      })}
    </ul>
  )
}
