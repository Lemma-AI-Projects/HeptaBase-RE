import type { JSX } from 'react'
import { TabStrip } from '@/parts/C03-TabStrip'
import { IconButton } from '@/parts/C61-IconButton'
import { navigate } from '@/lib/hash-route'
import { TABS } from '@/lib/nav'
import s from './AppTabs.module.css'

export function AppTabs({
  active,
  theme,
  onToggleTheme,
  rightOpen,
  onToggleRight,
  extra,
}: {
  active: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  rightOpen: boolean
  onToggleRight: () => void
  extra?: JSX.Element | null
}): JSX.Element {
  return (
    <TabStrip
      activeId={active}
      tabs={TABS}
      onTabSelected={(id) => navigate(id)}
      onTabAdded={() => navigate('/s04')}
      actions={
        <>
          {extra}
          <span className={s.badge}>原型 · 可交互</span>
          <IconButton
            icon={theme === 'dark' ? 'sun' : 'moon'}
            tooltip="切换暗色"
            onClick={onToggleTheme}
            size="sm"
          />
          <IconButton
            icon={rightOpen ? 'chevronRight' : 'chevronLeft'}
            tooltip={rightOpen ? '收起右栏' : '展开右栏'}
            onClick={onToggleRight}
            size="sm"
          />
        </>
      }
    />
  )
}
