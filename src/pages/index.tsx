import type { TeamItem, UserItem } from '@/api/model-types'
import '@/assets/styles/index.scss'
import { breadcrumbNameMap, defaultMenuItems } from '@/config/menu'
import { routers } from '@/config/router'
import useStorage from '@/hooks/storage'
import { GlobalContext, type GlobalContextType, type LangType, type ThemeType, getUseTheme } from '@/utils/context'
import { ConfigProvider, theme } from 'antd'
import type { SpaceSize } from 'antd/es/space'
import zhCN from 'antd/locale/zh_CN'
import { Suspense, useState } from 'react'
import { RouterProvider, createHashRouter } from 'react-router-dom'

const { useToken } = theme

function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      return JSON.parse(userInfo)
    } catch (e) {
      return {}
    }
  }
  return {}
}

function App() {
  const { token } = useToken()

  const [theme, setTheme] = useStorage<ThemeType>('theme', 'light')
  const [lang, setLang] = useStorage<LangType>('lang', 'zh-CN')
  const [size, setSize] = useStorage<SpaceSize>('size', 'middle')
  const [collapsed, setCollapsed] = useStorage<boolean>('collapsed', false)
  const [userInfo, setUserInfo] = useStorage<UserItem>('userInfo', getUserInfo())
  const [teamInfo, setTeamInfo, removeTeamInfo] = useStorage<TeamItem>('teamInfo', {
    admins: [],
    createdAt: "",
    creator: undefined,
    id: 0,
    leader: undefined,
    logo: "",
    name: "",
    remark: "",
    status: 0,
    updatedAt: ""
  })
  const [teamMemberID, setTeamMemberID, removeTeamMemberID] = useStorage<number>('teamMemberID', 0)
  const [refreshMyTeamList, setRefreshMyTeamList] = useState<boolean>(false)
  const [localURL, setLocalURL] = useStorage<string>('localURL', localStorage.getItem('localURL') || '/')
  const [showLevelColor, setShowLevelColor] = useStorage<boolean>('showLevelColor', false)
  const [contentHeight, setContentHeight] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const contextValue: GlobalContextType = {
    theme: theme,
    setTheme: setTheme,
    lang: lang,
    setLang: setLang,
    size: size,
    setSize: setSize,
    title: 'Moon 监控',
    menuItems: defaultMenuItems,
    collapsed: collapsed,
    setCollapsed: setCollapsed,
    breadcrumbNameMap: breadcrumbNameMap,
    userInfo: userInfo,
    setUserInfo: setUserInfo,
    teamInfo: teamInfo,
    setTeamInfo: setTeamInfo,
    removeTeamInfo: removeTeamInfo,
    teamMemberID: teamMemberID,
    setTeamMemberID: setTeamMemberID,
    removeTeamMemberID: removeTeamMemberID,
    refreshMyTeamList: refreshMyTeamList,
    setRefreshMyTeamList: () => setRefreshMyTeamList(!refreshMyTeamList),
    isFullscreen: isFullscreen,
    setIsFullscreen: setIsFullscreen,
    showLevelColor: showLevelColor,
    setShowLevelColor: setShowLevelColor,
    contentHeight: contentHeight,
    setContentHeight: setContentHeight,
    localURL: localURL,
    setLocalURL: setLocalURL
  }

  return (
    <>
      <ConfigProvider
        locale={zhCN}
        theme={{
          components: {
            Layout: { colorTextBase: token.colorTextBase, headerColor: '#FFF' },
            Badge: { colorBorderBg: 'none' }
          },
          algorithm: getUseTheme(theme),
          cssVar: true,
          token: { colorPrimary: '#6c34e6' }
        }}
      >
        <GlobalContext.Provider value={contextValue}>
          <Suspense fallback={null}>
            <RouterProvider router={createHashRouter(routers)} />
          </Suspense>
        </GlobalContext.Provider>
      </ConfigProvider>
    </>
  )
}

export default App
