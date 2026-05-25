import React, { useState, useEffect } from 'react'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Layout, Menu, Breadcrumb, theme, Grid } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import HeaderComponent from './Header'
import { useLocale } from '@/contexts/LocaleContext'
import { useNamespace } from '@/contexts/useNamespace'
import logo from '@/assets/logo.svg'

const { Header, Sider, Content, Footer } = Layout
const { useBreakpoint } = Grid

export interface MenuItem {
  key: string
  icon?: React.ReactNode
  label: string
  /** 有子菜单时，path 可以为空 */
  path?: string
  children?: MenuItem[]
}

interface LayoutProps {
  menuItems: MenuItem[]
  header?: React.ReactNode
}

/** 递归查找菜单项（包括子菜单），精确匹配 path */
const findMenuItemByPath = (
  items: MenuItem[],
  path: string,
): MenuItem | null => {
  for (const item of items) {
    if (item.path === path) {
      return item
    }
    if (item.children) {
      const found = findMenuItemByPath(item.children, path)
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * 递归查找：当前路径以该菜单 path 为前缀时也视为命中（用于详情等子路由仍高亮父级菜单）
 */
const findMenuItemByPathOrPrefix = (
  items: MenuItem[],
  currentPath: string,
): MenuItem | null => {
  const exact = findMenuItemByPath(items, currentPath)
  if (exact) return exact
  let best: MenuItem | null = null
  let bestLen = 0
  const visit = (list: MenuItem[]) => {
    for (const item of list) {
      if (
        item.path &&
        item.path !== '/' &&
        currentPath.startsWith(item.path + '/')
      ) {
        if (item.path.length > bestLen) {
          bestLen = item.path.length
          best = item
        }
      }
      if (item.children) visit(item.children)
    }
  }
  visit(items)
  return best
}

/** 递归查找菜单项（通过 key） */
const findMenuItemByKey = (items: MenuItem[], key: string): MenuItem | null => {
  for (const item of items) {
    if (item.key === key) {
      return item
    }
    if (item.children) {
      const found = findMenuItemByKey(item.children, key)
      if (found) {
        return found
      }
    }
  }
  return null
}

/** 递归获取所有父菜单的 key（用于展开） */
const getParentKeys = (
  items: MenuItem[],
  targetKey: string,
  parentKeys: string[] = [],
): string[] => {
  for (const item of items) {
    const currentPath = [...parentKeys, item.key]
    if (item.key === targetKey) {
      return parentKeys
    }
    if (item.children) {
      const found = getParentKeys(item.children, targetKey, currentPath)
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

/** 递归获取面包屑路径（精确匹配 path） */
const getBreadcrumbItems = (
  items: MenuItem[],
  targetPath: string,
  parents: MenuItem[] = [],
): MenuItem[] => {
  for (const item of items) {
    const currentPath = [...parents, item]
    if (item.path === targetPath) {
      return currentPath
    }
    if (item.children) {
      const found = getBreadcrumbItems(item.children, targetPath, currentPath)
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

/** 根据菜单 key 从根到该项收集面包屑（用于子路由无精确 path 时） */
const getBreadcrumbItemsByKey = (
  items: MenuItem[],
  targetKey: string,
  parents: MenuItem[] = [],
): MenuItem[] => {
  for (const item of items) {
    const path = [...parents, item]
    if (item.key === targetKey) {
      return path
    }
    if (item.children) {
      const found = getBreadcrumbItemsByKey(item.children, targetKey, path)
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

/** Ant Design lg 断点为 1024px */
const LG_BREAKPOINT = 1024

const LayoutComponent: React.FC<LayoutProps> = ({ menuItems, header }) => {
  const screens = useBreakpoint()
  const isDesktop = screens.lg === true // lg 及以上为桌面，以下为平板/手机
  // 大屏默认展开、小屏默认收起（用 window 初始化避免 useBreakpoint 首帧为空对象）
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < LG_BREAKPOINT : true,
  )
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLocale()
  const { namespaceOptions, currentNamespace } = useNamespace()
  const currentNsLogo = namespaceOptions.find(
    (o) => o.value === currentNamespace,
  )?.logo
  const menuLogoSrc = currentNsLogo || logo
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // 随断点同步：大屏默认展开，平板/手机默认收起
  useEffect(() => {
    if (isDesktop) {
      queueMicrotask(() => setCollapsed(false))
    } else {
      queueMicrotask(() => setCollapsed(true))
    }
  }, [isDesktop])

  // 根据当前路径计算选中项（支持子路由前缀匹配，如 /strategies/uid 仍选中「策略列表」）
  const currentPath = location.pathname
  const currentItem = findMenuItemByPathOrPrefix(menuItems, currentPath)
  const selectedKeys = React.useMemo(
    () => (currentItem ? [currentItem.key] : []),
    [currentItem],
  )
  const defaultOpenKeys = currentItem
    ? getParentKeys(menuItems, currentItem.key)
    : []
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys)

  // 收起时不传 openKeys，Menu 非受控以便悬停弹出子菜单；展开时传 openKeys 受控
  const menuOpenKeys = collapsed ? undefined : openKeys

  // 菜单从收起变为展开时，恢复当前路径对应的父级展开
  useEffect(() => {
    if (!collapsed && currentItem) {
      const parentKeys = getParentKeys(menuItems, currentItem.key)
      if (parentKeys.length > 0) {
        queueMicrotask(() => setOpenKeys(parentKeys))
      }
    }
  }, [collapsed, currentItem, menuItems])

  // 路径变化时同步展开项（仅菜单未收起时）
  useEffect(() => {
    if (collapsed) return
    if (currentItem) {
      const parentKeys = getParentKeys(menuItems, currentItem.key)
      if (parentKeys.length > 0) {
        queueMicrotask(() => setOpenKeys(parentKeys))
      }
    }
  }, [collapsed, currentPath, currentItem, menuItems])

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const menuItem = findMenuItemByKey(menuItems, e.key)
    if (menuItem && menuItem.path) {
      navigate(menuItem.path)
    }
  }

  // 处理子菜单展开/收起（有选中项时，其父级菜单始终保持展开）
  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const parentKeys = currentItem
      ? getParentKeys(menuItems, currentItem.key)
      : []
    setOpenKeys([...new Set([...parentKeys, ...keys])])
  }

  // 递归转换菜单项格式
  const convertMenuItems = (items: MenuItem[]): MenuProps['items'] => {
    return items.map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
      children: item.children ? convertMenuItems(item.children) : undefined,
    }))
  }

  const menuItemsData: MenuProps['items'] = convertMenuItems(menuItems)

  // 生成面包屑数据（支持子路由：无精确 path 时用当前匹配的菜单项链，并追加「策略详情」等末级标题）
  const exactBreadcrumb = getBreadcrumbItems(menuItems, location.pathname)
  let breadcrumbItems: MenuItem[] =
    exactBreadcrumb.length > 0
      ? exactBreadcrumb
      : currentItem
        ? getBreadcrumbItemsByKey(menuItems, currentItem.key)
        : []
  // 子路由（如 /strategies/:uid）时追加详情级面包屑
  if (
    breadcrumbItems.length > 0 &&
    currentItem?.path &&
    location.pathname !== currentItem.path &&
    currentItem.path.length < location.pathname.length
  ) {
    const detailLabel =
      currentItem.key === 'strategies'
        ? t('strategy.modal.detail.title')
        : t('common.detail')
    breadcrumbItems = [
      ...breadcrumbItems,
      { key: '__detail__', label: detailLabel },
    ]
  }
  const breadcrumbData = breadcrumbItems.map((item) => ({
    title: <span>{item.label}</span>,
  }))

  return (
    <Layout className='h-full w-full'>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        breakpoint='lg'
        collapsedWidth={isDesktop ? 80 : 0}
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true)
        }}
      >
        <div
          className={`logo h-16 w-full flex items-center gap-2 text-white shrink-0 border-b border-gray-700 ${collapsed ? 'justify-center' : 'justify-start px-5'}`}
          style={{ background: 'var(--ant-color-menu-bg, #001529)' }}
        >
          <img
            src={menuLogoSrc}
            alt='logo'
            className='h-8 w-9 shrink-0 object-contain'
          />
          <span
            className={`text-xl font-bold whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${
              collapsed ? 'hidden' : 'max-w-[11rem] opacity-100'
            }`}
          >
            {t('layout.appName')}
          </span>
        </div>
        <Menu
          key={location.pathname}
          theme='dark'
          mode='inline'
          inlineCollapsed={collapsed}
          selectedKeys={selectedKeys}
          {...(menuOpenKeys !== undefined ? { openKeys: menuOpenKeys } : {})}
          items={menuItemsData}
          onClick={(e) => {
            handleMenuClick(e)
            if (!isDesktop) setCollapsed(true)
          }}
          onOpenChange={handleOpenChange}
        />
      </Sider>
      <Layout className='flex flex-col min-h-0 flex-1'>
        <Header
          className='h-14 md:h-16 shrink-0'
          style={{ padding: 0, background: colorBgContainer }}
        >
          <div className='flex items-center ml-2 md:ml-4 gap-2 md:gap-4 flex-wrap min-w-0'>
            <div
              onClick={() => setCollapsed(!collapsed)}
              className='cursor-pointer shrink-0 p-2 -ml-1'
              aria-label={collapsed ? '展开菜单' : '收起菜单'}
            >
              {collapsed ? (
                <MenuUnfoldOutlined className='text-base' />
              ) : (
                <MenuFoldOutlined className='text-base' />
              )}
            </div>
            {breadcrumbData.length > 0 && (
              <div className='min-w-0 overflow-hidden'>
                <Breadcrumb
                  items={breadcrumbData}
                  className='text-xs md:text-sm'
                />
              </div>
            )}
            <div className='flex-1 min-w-0 h-full flex items-center'>
              {header}
            </div>
            <HeaderComponent />
          </div>
        </Header>

        <Content className='m-2 md:m-4 flex-1 min-h-0 flex flex-col'>
          <div className='flex-1 min-h-0'>
            <Outlet />
          </div>
        </Content>
        <Footer
          className='h-10 md:h-12 flex items-center justify-center px-2 shrink-0'
          style={{ background: colorBgContainer }}
        >
          <div className='flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500 flex-wrap'>
            <div>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </div>
            <div>{t('footer.icp')}</div>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default LayoutComponent
