import { ReactNode } from 'react'
import { UserOutlined, AppstoreOutlined, SettingOutlined, DatabaseOutlined } from '@ant-design/icons'
import type { MenuItem } from '@/components/layout/Layout'
import NamespaceList from '@/pages/main/namespaces'
import type { LocaleType } from '@/contexts/LocaleContext'

/**
 * 子应用配置
 */
export interface SubAppConfig {
  /** 子应用名称（用于 micro-app 的 name 属性） */
  name: string
  /** 开发环境 URL */
  devUrl: string
  /** 生产环境 URL */
  prodUrl: string
  /** 子应用路径（用于路由） */
  path: string
}

/**
 * 应用配置项
 */
export interface AppConfigItem {
  /** 菜单 key */
  key: string
  /** 菜单图标 */
  icon: ReactNode
  /** 菜单标签 */
  label: string
  /** 菜单路径（父菜单可以为空） */
  path?: string
  /** 子应用配置（如果有） */
  subApp?: SubAppConfig
  /** 直接指定路由要渲染的组件（如果有） */
  element?: ReactNode
  /** 子菜单配置 */
  children?: AppConfigItem[]
}

/**
 * 获取应用配置（支持国际化）
 */
export const getAppConfig = (t: (key: string) => string): AppConfigItem[] => [
  {
    key: 'template',
    icon: <AppstoreOutlined />,
    label: t('menu.template'),
    path: '/template',
    children: [
      {
        key: 'template1',
        icon: <AppstoreOutlined />,
        label: t('menu.template1'),
        path: '/template/template1',
        subApp: {
          name: 'template1',
          devUrl: 'http://localhost:5173/template1',
          prodUrl: 'http://localhost:4173/template1',
          path: '/template/template1',
        },
      },
      {
        key: 'template2',
        icon: <AppstoreOutlined />,
        label: t('menu.template2'),
        path: '/template/template2',
        subApp: {
          name: 'template2',
          devUrl: 'http://localhost:5173/template2',
          prodUrl: 'http://localhost:4173/template2',
          path: '/template/template2',
        },
      },
    ],
  },
  {
    key: 'test',
    icon: <UserOutlined />,
    label: t('menu.test'),
    path: '/test',
    children: [
      {
        key: 'test1',
        icon: <UserOutlined />,
        label: t('menu.test1'),
        path: '/test/test1',
        subApp: {
          name: 'test1',
          devUrl: 'http://localhost:5174/test1',
          prodUrl: 'http://localhost:4174/test1',
          path: '/test/test1',
        },
      },
      {
        key: 'test2',
        icon: <UserOutlined />,
        label: t('menu.test2'),
        path: '/test/test2',
        subApp: {
          name: 'test2',
          devUrl: 'http://localhost:5174/test2',
          prodUrl: 'http://localhost:4174/test2',
          path: '/test/test2',
        },
      },
    ],
  },
  {
    key: 'namespaces',
    icon: <DatabaseOutlined />,
    label: t('menu.namespaces'),
    path: '/namespaces',
    element: <NamespaceList />,
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: t('menu.settings'),
    path: '/settings',
    children: [
      {
        key: 'settings1',
        icon: <SettingOutlined />,
        label: t('menu.settings1'),
        path: '/settings/settings1',
        element: <div>{t('menu.settings1')}</div>,
      },
      {
        key: 'settings2',
        icon: <SettingOutlined />,
        label: t('menu.settings2'),
        path: '/settings/settings2',
        element: <div>{t('menu.settings2')}</div>,
      },
    ],
  },
]

/**
 * 将应用配置转换为菜单项
 */
export function convertToMenuItems(config: AppConfigItem[]): MenuItem[] {
  return config.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    path: item.path,
    children: item.children ? convertToMenuItems(item.children) : undefined,
  }))
}

/**
 * 获取所有子应用配置（扁平化）
 */
export function getAllSubAppConfigs(config: AppConfigItem[]): Record<string, SubAppConfig> {
  const result: Record<string, SubAppConfig> = {}
  
  function traverse(items: AppConfigItem[]) {
    for (const item of items) {
      if (item.subApp) {
        result[item.subApp.name] = item.subApp
      }
      if (item.children) {
        traverse(item.children)
      }
    }
  }
  
  traverse(config)
  return result
}

/**
 * 获取默认路由路径（第一个有 path 的菜单项）
 */
export function getDefaultPath(config: AppConfigItem[]): string {
  function findFirstPath(items: AppConfigItem[]): string | null {
    for (const item of items) {
      if (item.path && !item.children) {
        return item.path
      }
      if (item.children) {
        const childPath = findFirstPath(item.children)
        if (childPath) return childPath
      }
    }
    return null
  }
  
  return findFirstPath(config) || '/'
}
