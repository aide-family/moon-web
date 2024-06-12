import React, { Suspense, useContext, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, message, theme } from 'antd'

import './layout.scss'
import HeaderTitle from './header-title'
import { HeaderOp } from './header-op'
import { GlobalContext } from '@/utils/context'
import RouteBreadcrumb from './route-breadcrumb'
import { CopyrightOutlined } from '@ant-design/icons'
import { isLogin } from '@/api/request'

const { Header, Content, Footer, Sider } = Layout
const { useToken } = theme

let timer: NodeJS.Timeout | null = null
const MoonLayout: React.FC = () => {
  const navigate = useNavigate()
  if (!isLogin()) {
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
  const location = useLocation()
  const { token } = useToken()
  const { menuItems, collapsed } = useContext(GlobalContext)

  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [locationPath, setLocationPath] = useState<string>(location.pathname)

  const handleMenuOpenChange = (keys: string[]) => {
    let openKeyList: string[] = keys
    if (openKeyList.length === 0) {
      openKeyList = locationPath.split('/').slice(1)
      // 去掉最后一级
      openKeyList.pop()
      openKeyList = ['/' + openKeyList.join('/')]
    }
    setOpenKeys(openKeyList)
    setSelectedKeys(keys)
  }

  const handleOnSelect = (key: string) => {
    navigate(key)
  }

  useEffect(() => {
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
      <Layout style={{ overflow: 'hidden', height: '100vh', width: '100vw' }}>
        <Sider collapsed={collapsed}>
          <Header className='header'>
            <HeaderTitle />
          </Header>
          <Menu
            // theme={theme}
            theme='dark'
            mode='inline'
            items={menuItems}
            style={{
              height: '100%',
              borderInlineEnd: 'none',
              overflow: 'auto',
            }}
            openKeys={collapsed ? [] : openKeys}
            defaultOpenKeys={openKeys}
            onSelect={({ key }) => handleOnSelect(key)}
            selectedKeys={selectedKeys}
            onOpenChange={handleMenuOpenChange}
          />
        </Sider>
        <Layout
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Header
            className='header'
            style={{
              background: token.colorBgContainer,
              color: token.colorText,
            }}
          >
            <RouteBreadcrumb />
            <HeaderOp />
          </Header>

          <Content className='content' style={{ flex: 1 }}>
            <Suspense fallback={<div>loading...</div>}>
              <Outlet />
            </Suspense>
          </Content>
          <Footer
            className='footer center'
            style={{ background: token.colorBgContainer }}
          >
            <CopyrightOutlined />
            {window.location.host}
          </Footer>
        </Layout>
      </Layout>
    </>
  )
}

export default MoonLayout
