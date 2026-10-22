import type { JSX } from 'react'
import { IconButton } from '../C61-IconButton/C61-IconButton'
import { Divider } from '../C67-Divider/C67-Divider'
import type { IconName } from '@/icons'
import s from './C19-CanvasToolbar.module.css'

export type ToolId = 'select' | 'card' | 'upload' | 'edge' | 'text' | 'section' | 'search' | 'more'

const TOOLS: { id: ToolId; icon: IconName; label: string; key: string }[] = [
  { id: 'select', icon: 'cursor', label: '选择', key: 'V' },
  { id: 'card', icon: 'card', label: '新建卡片', key: 'N' },
  { id: 'upload', icon: 'upload', label: '导入文件', key: '' },
  { id: 'edge', icon: 'link', label: '连线', key: 'L' },
  { id: 'text', icon: 'text', label: '文本', key: 'T' },
  { id: 'section', icon: 'frame', label: '分区', key: 'S' },
]

export function CanvasToolbar({
  tool,
  readonly = false,
  empty = false,
  forceHoverFirst = false,
  onToolSelected,
}: {
  tool: ToolId
  readonly?: boolean
  empty?: boolean
  forceHoverFirst?: boolean
  onToolSelected?: (id: ToolId) => void
}): JSX.Element {
  const list = empty ? [] : TOOLS
  return (
    <div className={s.bar} role="toolbar" aria-label="画布工具">
      {list.map((t, i) => (
        <IconButton
          key={t.id}
          icon={t.icon}
          active={!forceHoverFirst && tool === t.id}
          force={forceHoverFirst && i === 0 ? 'hover' : undefined}
          disabled={readonly && t.id !== 'select'}
          tooltip={readonly && t.id !== 'select' ? '原型未实现' : t.label}
          shortcut={t.key}
          onClick={() => onToolSelected?.(t.id)}
        />
      ))}
      <Divider />
      <IconButton
        icon="more"
        tooltip="更多"
        onClick={() => onToolSelected?.('more')}
      />
    </div>
  )
}
