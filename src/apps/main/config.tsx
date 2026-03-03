import { ReactNode } from 'react'
import { UserOutlined, AppstoreOutlined, DatabaseOutlined, TeamOutlined, FileTextOutlined, MailOutlined, ApiOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons'
import type { MenuItem } from '@/components/layout/Layout'

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
    key: 'goddess',
    icon: <UserOutlined />,
    label: t('menu.goddess'),
    path: '/goddess',
    children: [
      {
        key: 'goddess-namespaces',
        icon: <DatabaseOutlined />,
        label: t('menu.namespaces'),
        path: '/goddess/namespaces',
        subApp: {
          name: 'goddess-namespaces',
          devUrl: 'http://localhost:5174/namespaces',
          prodUrl: 'http://localhost:4174/namespaces',
          path: '/goddess/namespaces',
        },
      },
      {
        key: 'goddess-users',
        icon: <TeamOutlined />,
        label: t('menu.users'),
        path: '/goddess/users',
        subApp: {
          name: 'goddess-users',
          devUrl: 'http://localhost:5174/users',
          prodUrl: 'http://localhost:4174/users',
          path: '/goddess/users',
        },
      },
    ],
  },
  {
    key: 'rabbit',
    icon: <AppstoreOutlined />,
    label: t('menu.rabbit'),
    path: '/rabbit',
    children: [
      {
        key: 'rabbit-templates',
        icon: <FileTextOutlined />,
        label: t('menu.rabbitTemplates'),
        path: '/rabbit/templates',
        subApp: {
          name: 'rabbit-templates',
          devUrl: 'http://localhost:5175/templates',
          prodUrl: 'http://localhost:4175/templates',
          path: '/rabbit/templates',
        },
      },
      {
        key: 'rabbit-emails',
        icon: <MailOutlined />,
        label: t('menu.rabbitEmails'),
        path: '/rabbit/emails',
        subApp: {
          name: 'rabbit-emails',
          devUrl: 'http://localhost:5175/emails',
          prodUrl: 'http://localhost:4175/emails',
          path: '/rabbit/emails',
        },
      },
      {
        key: 'rabbit-webhooks',
        icon: <ApiOutlined />,
        label: t('menu.rabbitWebhooks'),
        path: '/rabbit/webhooks',
        subApp: {
          name: 'rabbit-webhooks',
          devUrl: 'http://localhost:5175/webhooks',
          prodUrl: 'http://localhost:4175/webhooks',
          path: '/rabbit/webhooks',
        },
      },
      {
        key: 'rabbit-messages',
        icon: <MessageOutlined />,
        label: t('menu.rabbitMessages'),
        path: '/rabbit/messages',
        subApp: {
          name: 'rabbit-messages',
          devUrl: 'http://localhost:5175/messages',
          prodUrl: 'http://localhost:4175/messages',
          path: '/rabbit/messages',
        },
      },
      {
        key: 'rabbit-sender',
        icon: <SendOutlined />,
        label: t('menu.rabbitSender'),
        path: '/rabbit/sender',
        subApp: {
          name: 'rabbit-sender',
          devUrl: 'http://localhost:5175/sender',
          prodUrl: 'http://localhost:4175/sender',
          path: '/rabbit/sender',
        },
      }
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
