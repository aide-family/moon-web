import { Status } from '@/api/enum'
import { TeamItem, UserItem } from '@/api/model-types'
import '@/assets/styles/index.scss'
import { CreateTeamModalProvider } from '@/components/layout/create-team-provider'
import { breadcrumbNameMap, defaultMenuItems } from '@/config/menu'
import { routers } from '@/config/router'
import { getUseTheme, GlobalContext, GlobalContextType, LangType, ThemeType } from '@/utils/context'
import useStorage from '@/utils/storage'
import { ConfigProvider, theme } from 'antd'
import { SpaceSize } from 'antd/es/space'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useState } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'

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

const defaultTeamInfo: TeamItem = {
  id: 0,
  name: '请选择团队信息',
  status: Status.StatusEnable,
  remark: '',
  createdAt: '',
  updatedAt: '',
  logo: '',
  admin: []
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
  const [teamInfo, setTeamInfo] = useStorage<TeamItem>('teamInfo', getTeamInfo())
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
          <CreateTeamModalProvider>
            <RouterProvider router={createHashRouter(routers)} />
          </CreateTeamModalProvider>
        </GlobalContext.Provider>
      </ConfigProvider>
    </>
  )
}

export default App
