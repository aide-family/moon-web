import { GlobalContext } from '@/utils/context'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Space } from 'antd'
import useToken from 'antd/es/theme/useToken'
import { type FC, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

let timer: NodeJS.Timeout | null = null
const RouteBreadcrumb: FC = () => {
  const { breadcrumbNameMap, collapsed, setCollapsed } = useContext(GlobalContext)
  const location = useLocation()
  const pathSnippets = location.pathname.split('/').filter((i) => i)
  const navigate = useNavigate()
  const [, token] = useToken()
  const [title, setTitle] = useState('Moon')

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
    const breadcrumbName = breadcrumbNameMap?.[url]

    const disabled = breadcrumbName?.disabled || index === pathSnippets.length - 1
    if (index === pathSnippets.length - 1) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        setTitle(breadcrumbName?.name || 'Moon')
      }, 100)
    }
    return {
      key: url,
      title: (
        <button
          type='button'
          style={{
            color: disabled ? '' : token['blue-6'],
            cursor: disabled ? 'no-drop' : 'pointer'
          }}
          onClick={() => {
            navigate(url)
          }}
        >
          {breadcrumbName?.name}
        </button>
      )
    }
  })
  const breadcrumbItems = extraBreadcrumbItems

  useEffect(() => {
    if (!title) return
    document.title = title
  }, [title])
  return (
    <Space size={8}>
      <Button
        type='text'
        onClick={() => setCollapsed?.(!collapsed)}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      />
      <Breadcrumb items={breadcrumbItems} />
    </Space>
  )
}

export default RouteBreadcrumb
