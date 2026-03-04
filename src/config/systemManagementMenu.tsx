import { DatabaseOutlined, UserOutlined, UsergroupAddOutlined, IdcardOutlined } from '@ant-design/icons'
import type { MenuItem } from '@/components/layout/Layout'

/**
 * 系统管理 + 个人中心菜单项（命名空间、用户管理、成员管理、个人中心）
 * 各子应用（goddess、rabbit 等）均需包含此部分菜单
 */
export function getSystemManagementMenuItems(t: (key: string) => string): MenuItem[] {
  return [
    {
      key: 'namespaces',
      icon: <DatabaseOutlined />,
      label: t('menu.namespaces'),
      path: '/namespaces',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: t('menu.users'),
      path: '/users',
    },
    {
      key: 'members',
      icon: <UsergroupAddOutlined />,
      label: t('menu.members'),
      path: '/members',
    },
    {
      key: 'profile',
      icon: <IdcardOutlined />,
      label: t('menu.profile'),
      path: '/profile',
    },
  ]
}
