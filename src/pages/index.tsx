import { Suspense } from 'react'

import { ConfigProvider, theme } from 'antd'
import {
  GlobalContext,
  GlobalContextType,
  LangType,
  ThemeType,
  getUseTheme,
} from '@/utils/context'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { routers } from '@/config/router'
import { breadcrumbNameMap, defaultMenuItems } from '@/config/menu'
import { SpaceSize } from 'antd/es/space'
import useStorage from '@/utils/storage'

const { useToken } = theme

function App() {
  const { token } = useToken()
  const [theme, setTheme] = useStorage<ThemeType>('theme', 'dark')
  const [lang, setLang] = useStorage<LangType>('lang', 'zh-CN')
  const [size, setSize] = useStorage<SpaceSize>('size', 'middle')
  const [collapsed, setCollapsed] = useStorage<boolean>('collapsed', false)
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
  }
  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Layout: {
              colorTextBase: token.colorTextBase,
              headerColor: '#FFF',
            },
            Badge: {
              colorBorderBg: 'none',
            },
          },
          algorithm: getUseTheme(theme),
          cssVar: true,
        }}
      >
        <GlobalContext.Provider value={contextValue}>
          <Suspense fallback={<div>loading...</div>}>
            <RouterProvider router={createHashRouter(routers)} />
          </Suspense>
        </GlobalContext.Provider>
      </ConfigProvider>
    </>
  )
}

export default App
