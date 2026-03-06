import { DatabaseOutlined, UserOutlined, UsergroupAddOutlined, IdcardOutlined } from '@ant-design/icons'
import NamespaceList from '@/pages/goddess/namespaces'
import { AppConfigItem } from '@/apps/main/config'
import UsersList from '@/pages/goddess/users'
import MembersList from '@/pages/goddess/members'
import ProfilePage from '@/pages/main/profile'

/**
 * 系统管理 + 个人中心菜单项（命名空间、用户管理、成员管理、个人中心）
 * 各子应用（goddess、rabbit 等）均需包含此部分菜单
 */
export function getSystemManagementMenuItems(t: (key: string) => string): AppConfigItem[] {
  return [
    {
      key: 'namespaces',
      icon: <DatabaseOutlined />,
      label: t('menu.namespaces'),
      path: '/namespaces',
      element: <NamespaceList />,
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: t('menu.users'),
      path: '/users',
      element: <UsersList />,
    },
    {
      key: 'members',
      icon: <UsergroupAddOutlined />,
      label: t('menu.members'),
      path: '/members',
      element: <MembersList />,
    },
    {
      key: 'profile',
      icon: <IdcardOutlined />,
      label: t('menu.profile'),
      path: '/profile',
      element: <ProfilePage />,
    },
  ]
}
