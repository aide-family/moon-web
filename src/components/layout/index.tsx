import React, { useContext, useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Layout, Menu, theme } from "antd"

import "./layout.scss"
import HeaderTitle from "./header-title"
import { HeaderOp } from "./header-op"
import { GlobalContext } from "@/utils/context"
import RouteBreadcrumb from "./route-breadcrumb"
import { CopyrightOutlined } from "@ant-design/icons"

const { Header, Content, Footer, Sider } = Layout
const { useToken } = theme

const MoonLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useToken()
  const { menuItems, collapsed, theme } = useContext(GlobalContext)

  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [locationPath, setLocationPath] = useState<string>(location.pathname)

  const handleMenuOpenChange = (keys: string[]) => {
    let openKeyList: string[] = keys
    if (openKeyList.length === 0) {
      openKeyList = locationPath.split("/").slice(1)
      // 去掉最后一级
      openKeyList.pop()
      openKeyList = ["/" + openKeyList.join("/")]
    }
    setOpenKeys(openKeyList)
    setSelectedKeys(keys)
  }

  const handleOnSelect = (key: string) => {
    navigate(key)
  }

  useEffect(() => {
    setSelectedKeys([location.pathname])

    const openKey = location.pathname.split("/").slice(1)
    const keys: string[] = []
    let key: string
    openKey.forEach((item) => {
      key += "/" + item
      keys.push(key)
    })
    // 去掉最后一级
    openKey.pop()
    setOpenKeys([...keys, "/" + openKey.join("/")])
    setLocationPath(location.pathname)
  }, [location.pathname, collapsed])

  return (
    <>
      <Layout
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Header className='header'>
          <HeaderTitle />
          <HeaderOp />
        </Header>
        <Content style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Layout style={{ flex: 1 }}>
            <Sider style={{ background: "none" }} collapsed={collapsed}>
              <Menu
                theme={theme}
                mode='inline'
                items={menuItems}
                style={{ height: "100%", borderInlineEnd: "none" }}
                openKeys={collapsed ? [] : openKeys}
                defaultOpenKeys={openKeys}
                onSelect={({ key }) => handleOnSelect(key)}
                selectedKeys={selectedKeys}
                onOpenChange={handleMenuOpenChange}
              />
            </Sider>
            <Layout>
              <Content className='content'>
                <RouteBreadcrumb />
                <div
                  className='outlet'
                  style={{
                    background: token.colorBgContainer,
                    display: "flex",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Outlet />
                  </div>
                </div>
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
        </Content>
      </Layout>
    </>
  )
}

export default MoonLayout
