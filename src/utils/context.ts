import type { TeamItem, UserItem } from '@/api/model-types'
import type { BreadcrumbNameType } from '@/config/menu'
import { theme } from 'antd'
import type { ItemType } from 'antd/es/menu/interface'
import type { SpaceSize } from 'antd/es/space'
import { createContext } from 'react'

export type ThemeType = 'light' | 'dark'
export type LangType = 'zh-CN' | 'en-US'

export type GlobalContextType = {
  theme?: ThemeType
  setTheme?: (theme: ThemeType) => void
  lang?: LangType
  setLang?: (lang: LangType) => void
  size?: SpaceSize
  setSize?: (size: SpaceSize) => void
  title?: string
  menuItems?: ItemType[]
  breadcrumbNameMap?: Record<string, BreadcrumbNameType>
  collapsed?: boolean
  setCollapsed?: (collapsed: boolean) => void
  userInfo?: UserItem
  setUserInfo?: (userInfo: UserItem) => void
  teamInfo?: TeamItem
  setTeamInfo?: (teamInfo: TeamItem) => void
  removeTeamInfo?: () => void
  teamMemberID?: number
  setTeamMemberID?: (teamMemberID: number) => void
  removeTeamMemberID?: () => void
  refreshMyTeamList?: boolean
  setRefreshMyTeamList?: () => void
  isFullscreen?: boolean
  setIsFullscreen?: (isFullscreen: boolean) => void
  showLevelColor?: boolean
  setShowLevelColor?: (showLevelColor: boolean) => void
  contentHeight?: number
  setContentHeight?: (contentHeight: number) => void
  localURL?: string
  setLocalURL?: (localURL: string) => void
}

export const GlobalContext = createContext<GlobalContextType>({
  lang: 'zh-CN',
  setLang: () => void 0,
  theme: 'light',
  setTheme: () => void 0,
  size: 'middle',
  setSize: () => void 0,
  title: 'Moon监控'
})

export const getUseTheme = (t?: ThemeType) => {
  return t === 'dark' ? theme.darkAlgorithm : undefined
}
