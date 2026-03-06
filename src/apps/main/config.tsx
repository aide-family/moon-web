import React, { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import { UserOutlined, AppstoreOutlined, FileTextOutlined, MailOutlined, ApiOutlined, MessageOutlined, SendOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import type { MenuItem } from '@/components/layout/Layout'
import { getSystemManagementMenuItems } from '@/config/systemManagementMenu'
import { SubAppContainer } from '@/components/SubAppContainer'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import type { SubAppConfig } from '@/types/subApp'

export type { SubAppConfig }

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
  // 系统管理：主系统直接渲染，不通过微前端子应用
  {
    key: 'goddess',
    icon: <UserOutlined />,
    label: t('menu.goddess'),
    path: '/goddess',
    children: [...getSystemManagementMenuItems(t) as AppConfigItem[]],
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
  // 策略管理服务（后端端口 8003）
  {
    key: 'marksman',
    icon: <SafetyCertificateOutlined />,
    label: t('menu.marksman'),
    path: '/marksman',
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

/**
 * 从应用配置生成路由（支持 subApp 微前端、element 本地组件、占位页）
 * 主应用与子系统（rabbit、goddess）统一使用；子系统若配置 subApp 也会渲染微前端
 */
export function generateRoutes(
  config: AppConfigItem[],
  subAppConfigMap: Record<string, SubAppConfig>
): React.ReactNode[] {
  const routes: React.ReactNode[] = []
  function traverse(items: AppConfigItem[]) {
    for (const item of items) {
      if (item.path) {
        if (item.subApp) {
          routes.push(
            <Route
              key={item.subApp.name}
              path={item.path}
              element={<SubAppContainer appName={item.subApp.name} subAppConfigMap={subAppConfigMap} />}
            />
          )
        } else if (item.element) {
          routes.push(<Route key={item.key} path={item.path} element={item.element} />)
        } else if (!item.children) {
          routes.push(
            <Route
              key={item.key}
              path={item.path}
              element={<PlaceholderPage label={item.label} path={item.path} />}
            />
          )
        }
      }
      if (item.children) traverse(item.children)
    }
  }
  traverse(config)
  return routes
}
