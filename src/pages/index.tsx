import { ConfigProvider, theme } from 'antd'
import { GlobalContext, GlobalContextType, LangType, ThemeType, getUseTheme } from '@/utils/context'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { routers } from '@/config/router'
import { breadcrumbNameMap, defaultMenuItems } from '@/config/menu'
import { SpaceSize } from 'antd/es/space'
import useStorage from '@/utils/storage'
import '@/assets/styles/index.scss'
import { UserItem } from '@/api/authorization/user'
import { TeamItemType } from '@/api/team/types'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import { useState } from 'react'

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

const defaultTeamInfo: TeamItemType = {
  id: 0,
  name: '请选择团队信息'
}

function getTeamInfo() {
  const teamInfo = localStorage.getItem('teamInfo')
  if (teamInfo) {
    try {
      return JSON.parse(teamInfo)
    } catch (e) {
      return defaultTeamInfo
    }
  }
  return defaultTeamInfo
}

function App() {
  const { token } = useToken()

  const [theme, setTheme] = useStorage<ThemeType>('theme', 'light')
  const [lang, setLang] = useStorage<LangType>('lang', 'zh-CN')
  const [size, setSize] = useStorage<SpaceSize>('size', 'middle')
  const [collapsed, setCollapsed] = useStorage<boolean>('collapsed', false)
  const [userInfo, setUserInfo] = useStorage<UserItem>('userInfo', getUserInfo())
  const [teamInfo, setTeamInfo] = useStorage<TeamItemType>('teamInfo', getTeamInfo())
  const [refreshMyTeamList, setRefreshMyTeamList] = useState<boolean>(false)

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
    refreshMyTeamList: refreshMyTeamList,
    setRefreshMyTeamList: () => setRefreshMyTeamList(!refreshMyTeamList)
  }
  return (
    <>
      <ConfigProvider
        locale={lang === 'zh-CN' ? zhCN : enUS}
        theme={{
          components: {
            Layout: {
              colorTextBase: token.colorTextBase,
              headerColor: '#FFF'
            },
            Badge: {
              colorBorderBg: 'none'
            }
          },
          algorithm: getUseTheme(theme),
          cssVar: true,
          token: {
            // colorBgContainer: "red",
          }
        }}
      >
        <GlobalContext.Provider value={contextValue}>
          <RouterProvider router={createHashRouter(routers)} />
        </GlobalContext.Provider>
      </ConfigProvider>
    </>
  )
}

export default App
