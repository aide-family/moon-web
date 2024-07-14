import type { ItemType } from 'antd/es/menu/hooks/useItems'
import { IconFont } from '@/components/icon'
import { SettingOutlined, UserOutlined } from '@ant-design/icons'

export const defaultMenuItems: ItemType[] = [
  {
    label: '实时监控',
    key: '/home/monitor',
    icon: <IconFont type='icon-monitor3' />,
    children: [
      {
        label: '数据大盘',
        key: '/home/monitor/dashboar',
      },
      {
        label: '实时告警',
        key: '/home/monitor/realtime',
      },
    ],
  },
  {
    label: '数据源',
    key: '/home/datasource',
    icon: <IconFont type='icon-zichanguanli2' />,
    children: [
      {
        label: 'Metric',
        key: '/home/datasource/metric',
      },
      {
        label: 'Log',
        key: '/home/datasource/log',
      },
      {
        label: 'Trace',
        key: '/home/datasource/trace',
      },
    ],
  },
  {
    label: '策略管理',
    key: '/home/strategy',
    icon: <IconFont type='icon-tongzhimoban' />,
    children: [
      {
        label: '策略组',
        key: '/home/strategy/group',
      },
      {
        label: '策略',
        key: '/home/strategy/list',
      },
    ],
  },
  {
    label: '告警通知',
    key: '/home/notify',
    icon: <IconFont type='icon-icon_notice' />,
    children: [
      {
        label: '告警组',
        key: '/home/notify/group',
      },
      {
        label: 'Hook',
        key: '/home/notify/hook',
      },
      {
        label: '通知规则',
        key: '/home/notify/rule',
      },
      {
        label: '告警记录',
        key: '/home/notify/record',
      },
    ],
  },
  {
    label: '告警归档',
    key: '/home/archive',
    icon: <IconFont type='icon-zichanguanli1' />,
    children: [
      {
        label: '历史告警',
        key: '/home/archive/history',
      },
      {
        label: '告警统计',
        key: '/home/archive/statistics',
      },
      {
        label: '历史通知',
        key: '/home/archive/notice',
      },
    ],
  },
  {
    label: '个人中心',
    key: '/home/self',
    icon: <UserOutlined />,
    children: [
      {
        label: '团队管理',
        key: '/home/self/space-manage',
      },
      {
        label: '个人设置',
        key: '/home/self/manage',
      },
    ],
  },
  {
    label: '系统管理',
    key: '/home/system',
    icon: <SettingOutlined />,
    children: [
      {
        label: '系统用户',
        key: '/home/system/users',
      },
      {
        label: '系统字典',
        key: '/home/system/dict',
      },
      {
        label: '系统菜单',
        key: '/home/system/menu',
      },
    ],
  },
  {
    label: 'Moon社区',
    key: '/home/community',
    icon: <IconFont type='icon-tongzhimoban' />,
    children: [
      {
        label: '策略仓库',
        key: '/home/community/strategy-template',
      },
      {
        label: '讨论',
        key: '/home/community/discussion',
      },
    ],
  },
]

export type BreadcrumbNameType = {
  name: string
  disabled?: boolean
}

export const breadcrumbNameMap: Record<string, BreadcrumbNameType> = {
  '/home': {
    name: '首页',
  },
  '/home/system': {
    name: '系统管理',
  },
  '/home/system/users': {
    name: '系统用户',
  },
  '/home/system/dict': {
    name: '系统字典',
  },
  '/home/system/menu': {
    name: '系统菜单',
  },
  '/home/self': {
    name: '个人中心',
  },
  '/home/self/space-manage': {
    name: '团队管理',
  },
  '/home/self/manage': {
    name: '个人设置',
  },
  '/home/monitor': {
    name: '实时监控',
  },
  '/home/monitor/dashboar': {
    name: '数据大盘',
  },
  '/home/monitor/realtime': {
    name: '实时告警',
  },
  '/home/datasource': {
    name: '数据源',
  },
  '/home/datasource/metric': {
    name: 'Metric',
  },
  '/home/datasource/log': {
    name: 'Log',
  },
  '/home/datasource/trace': {
    name: 'Trace',
  },
  '/home/strategy': {
    name: '策略管理',
  },
  '/home/strategy/group': {
    name: '策略组',
  },
  '/home/strategy/list': {
    name: '策略',
  },
  '/home/notify': {
    name: '告警通知',
  },
  '/home/notify/group': {
    name: '告警组',
  },
  '/home/notify/hook': {
    name: 'Hook',
  },
  '/home/notify/rule': {
    name: '通知规则',
  },
  '/home/notify/record': {
    name: '告警记录',
  },
  '/home/archive': {
    name: '告警归档',
  },
  '/home/archive/history': {
    name: '历史告警',
  },
  '/home/archive/statistics': {
    name: '告警统计',
  },
  '/home/archive/notice': {
    name: '历史通知',
  },
  '/home/community': {
    name: 'Moon社区',
  },
  '/home/community/strategy-template': {
    name: '策略仓库',
  },
  '/home/community/discussion': {
    name: '讨论',
  },
}
