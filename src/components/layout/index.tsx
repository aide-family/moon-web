import { Layout, Menu, message, Spin, theme } from 'antd'
import React, { Suspense, useContext, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { healthApi, isLogin, setToken } from '@/api/request'
import { GlobalContext } from '@/utils/context'
import { CopyrightOutlined } from '@ant-design/icons'
import { CreateTeamModalProvider } from './create-team-provider'
import { HeaderOp } from './header-op'
import HeaderTitle from './header-title'
import './layout.scss'
import RouteBreadcrumb from './route-breadcrumb'

const { Header, Content, Footer, Sider } = Layout
const { useToken } = theme

let timer: NodeJS.Timeout | null = null
const MoonLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const search = window.location.search
  const authToken = new URLSearchParams(search).get('token')

  useEffect(() => {
    if (authToken) {
      setToken(authToken)
      // 清除search
      window.location.search = ''
    }
  }, [authToken])

  if (!isLogin() && !authToken) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      message.error('登录已过期，请重新登录')
      setTimeout(() => {
        navigate('/login')
      }, 1000)
    }, 1000)
  }

  const { token } = useToken()
  const { menuItems, collapsed } = useContext(GlobalContext)

  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [locationPath, setLocationPath] = useState<string>(location.pathname)
  const [version, setVersion] = useState('version')

  const getVersion = () => {
    healthApi().then((res) => {
      setVersion(res.version)
    })
  }

  const handleMenuOpenChange = (keys: string[]) => {
    let openKeyList: string[] = keys
    if (openKeyList.length === 0) {
      openKeyList = locationPath.split('/').slice(1)
      // 去掉最后一级
      openKeyList.pop()
      openKeyList = ['/' + openKeyList.join('/')]
    }
    setOpenKeys(openKeyList)
    // setSelectedKeys(keys)
  }

  const handleOnSelect = (key: string) => {
    navigate(key)
  }

  useEffect(() => {
    getVersion()
    setSelectedKeys([location.pathname])

    const openKey = location.pathname.split('/').slice(1)
    const keys: string[] = []
    let key: string
    openKey.forEach((item) => {
      key += '/' + item
      keys.push(key)
    })
    // 去掉最后一级
    openKey.pop()
    setOpenKeys([...keys, '/' + openKey.join('/')])
    setLocationPath(location.pathname)
  }, [location.pathname, collapsed])

  return (
    <>
      <CreateTeamModalProvider>
        <Layout style={{ overflow: 'hidden', height: '100vh', width: '100vw' }} id='content-body'>
          <Sider collapsed={collapsed} className='menu-sider' style={{ background: token.colorBgContainer }}>
            <div
              className='menu-header'
              style={{
                height: 60,
                padding: '0 22px',
                color: token.colorText
              }}
            >
              <HeaderTitle />
            </div>
            <Menu
              // theme={theme}
              // theme='dark'
              mode='inline'
              items={menuItems}
              style={{
                height: '100%',
                borderInlineEnd: 'none',
                overflow: 'auto'
              }}
              openKeys={collapsed ? [] : openKeys}
              defaultOpenKeys={collapsed ? [] : openKeys}
              onSelect={({ key }) => handleOnSelect(key)}
              selectedKeys={selectedKeys}
              defaultSelectedKeys={selectedKeys}
              onOpenChange={handleMenuOpenChange}
            />
          </Sider>
          <Layout
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Header
              className='header'
              style={{
                background: token.colorBgContainer,
                color: token.colorText
              }}
            >
              <RouteBreadcrumb />
              <HeaderOp />
            </Header>

            <Content className='content' style={{ flex: 1 }}>
              <Suspense fallback={<Spin />}>
                <Outlet />
              </Suspense>
            </Content>
            <Footer className='footer center' style={{ background: token.colorBgContainer }}>
              <CopyrightOutlined />
              {window.location.host}{' '}
              <div
                style={{
                  marginLeft: 10
                }}
              >
                version: {version}
              </div>
            </Footer>
          </Layout>
        </Layout>
      </CreateTeamModalProvider>
    </>
  )
}

export default MoonLayout
