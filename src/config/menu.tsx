import { IconFont } from '@/components/icon'
import { SettingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import type { ItemType } from 'antd/es/menu/interface'

export const defaultMenuItems: ItemType[] = [
  {
    label: '实时监控',
    key: '/home/realtime',
    icon: <IconFont type='icon-monitor3' />,
    children: [
      {
        label: '实时告警',
        key: '/home/realtime/alarm'
      },
      {
        label: '数据大盘',
        key: '/home/realtime/dashboard'
      },
      {
        label: '监控大盘',
        key: '/home/realtime/monitor'
      },
      {
        label: '服务监控',
        key: '/home/realtime/server'
      }
    ]
  },
  {
    label: '数据源',
    key: '/home/datasource',
    icon: <IconFont type='icon-zichanguanli2' />,
    children: [
      {
        label: 'Metric',
        key: '/home/datasource/metric'
      },
      {
        label: 'Event',
        key: '/home/datasource/event'
      },
      {
        label: 'Log',
        key: '/home/datasource/log'
      }
      // {
      //   label: 'Trace',
      //   key: '/home/datasource/trace'
      // }
    ]
  },
  {
    label: '策略管理',
    key: '/home/strategy',
    icon: <IconFont type='icon-tongzhimoban' />,
    children: [
      // {
      //   label: '策略组',
      //   key: '/home/strategy/group'
      // },
      {
        label: '策略列表',
        key: '/home/strategy/list'
      },
      {
        label: '我的订阅',
        key: '/home/strategy/subscribe'
      }
    ]
  },
  {
    label: '告警通知',
    key: '/home/notify',
    icon: <IconFont type='icon-icon_notice' />,
    children: [
      {
        label: '告警组',
        key: '/home/notify/group'
      },
      {
        label: 'Hook',
        key: '/home/notify/hook'
      },
      {
        label: '时间引擎',
        key: '/home/notify/rule'
      },
      {
        label: '通知模板',
        key: '/home/notify/template'
      }
      // {
      //   label: '告警记录',
      //   key: '/home/notify/record'
      // }
    ]
  },
  {
    label: '告警归档',
    key: '/home/archive',
    icon: <IconFont type='icon-zichanguanli1' />,
    children: [
      {
        label: '历史告警',
        key: '/home/archive/history-alert'
      },
      {
        label: '告警统计',
        key: '/home/archive/statistics-alert'
      },
      {
        label: '历史通知',
        key: '/home/archive/history-notify'
      }
    ]
  },
  {
    label: '团队管理',
    key: '/home/team',
    icon: <TeamOutlined />,
    children: [
      {
        label: '大盘管理',
        key: '/home/team/dashboard'
      },
      {
        label: '团队成员',
        key: '/home/team/members'
      },
      {
        label: '角色管理',
        key: '/home/team/role'
      },
      {
        label: '团队配置',
        key: '/home/team/config'
      },
      {
        label: '字典管理',
        key: '/home/team/dict'
      },
      {
        label: '资源管理',
        key: '/home/team/resource'
      }
      // {
      //   label: '日志审计',
      //   key: '/home/team/log-audit'
      // }
    ]
  },
  {
    label: '个人中心',
    key: '/home/self',
    icon: <UserOutlined />,
    children: [
      {
        label: '我的团队',
        key: '/home/self/space-manage'
      },
      {
        label: '个人设置',
        key: '/home/self/manage'
      }
    ]
  },
  {
    label: '系统管理',
    key: '/home/system',
    icon: <SettingOutlined />,
    children: [
      {
        label: '用户管理',
        key: '/home/system/user'
      },
      {
        label: '资源管理',
        key: '/home/system/resource'
      },
      {
        label: '团队管理',
        key: '/home/system/team'
      },
      {
        label: '通知模板',
        key: '/home/system/template'
      }
    ]
  }
  // {
  //   label: 'Moon社区',
  //   key: '/home/community',
  //   icon: <IconFont type='icon-tongzhimoban' />,
  //   children: [
  //     {
  //       label: '策略仓库',
  //       key: '/home/community/strategy-template'
  //     },
  //     {
  //       label: '讨论',
  //       key: '/home/community/discussion'
  //     }
  //   ]
  // }
]

export type BreadcrumbNameType = {
  name: string
  disabled?: boolean
  path?: () => Promise<{ default: React.ComponentType }>
}

export const breadcrumbNameMap: Record<string, BreadcrumbNameType> = {
  '/': {
    name: '首页'
  },
  '/team': {
    name: '团队管理'
  },
  '/team/members': {
    name: '团队成员',
    path: () => import('@/pages/team/members')
  },
  '/team/dict': {
    name: '字典管理',
    path: () => import('@/pages/team/dict')
  },
  '/team/role': {
    name: '角色管理',
    path: () => import('@/pages/team/role')
  },
  '/team/resource': {
    name: '资源管理',
    path: () => import('@/pages/team/members')
  },
  '/team/dashboard': {
    name: '大盘管理',
    path: () => import('@/pages/team/dashboard')
  },
  '/team/dashboard/chart': {
    name: '图表管理'
  },
  '/self': {
    name: '个人中心'
  },
  '/self/space-manage': {
    name: '我的团队',
    path: () => import('@/pages/self/space-manage')
  },
  '/self/manage': {
    name: '个人设置',
    path: () => import('@/pages/self/manage')
  },
  '/realtime': {
    name: '实时监控'
  },
  '/realtime/dashboard': {
    name: '数据大盘',
    path: () => import('@/pages/realtime/dashboard')
  },
  '/realtime/alarm': {
    name: '实时告警',
    path: () => import('@/pages/realtime/alarm')
  },
  '/realtime/server': {
    name: '服务监控',
    path: () => import('@/pages/realtime/server')
  },
  '/realtime/monitor': {
    name: '监控大盘',
    path: () => import('@/pages/realtime/monitor')
  },
  '/datasource': {
    name: '数据源'
  },
  '/datasource/metric': {
    name: 'Metric',
    path: () => import('@/pages/datasource/metric')
  },
  '/datasource/event': {
    name: 'Event',
    path: () => import('@/pages/datasource/event')
  },
  '/datasource/log': {
    name: 'Log',
    path: () => import('@/pages/datasource/log')
  },
  '/datasource/trace': {
    name: 'Trace'
    // path: () => import('@/pages/datasource/trace')
  },
  '/strategy': {
    name: '策略管理'
  },
  '/strategy/group': {
    name: '策略组',
    path: () => import('@/pages/strategy/group')
  },
  '/strategy/list': {
    name: '策略列表',
    path: () => import('@/pages/strategy/list')
  },
  '/strategy/subscribe': {
    name: '我的订阅',
    path: () => import('@/pages/strategy/subscribe')
  },
  '/notify': {
    name: '告警通知'
  },
  '/notify/group': {
    name: '告警组',
    path: () => import('@/pages/notify/group')
  },
  '/notify/hook': {
    name: 'Hook',
    path: () => import('@/pages/notify/hook')
  },
  '/notify/rule': {
    name: '时间引擎',
    path: () => import('@/pages/notify/rule')
  },
  '/notify/record': {
    name: '告警记录',
    path: () => import('@/pages/team/members')
  },
  '/notify/template': {
    name: '通知模板',
    path: () => import('@/pages/notify/template')
  },
  '/archive': {
    name: '告警归档'
  },
  '/archive/history-alert': {
    name: '历史告警',
    path: () => import('@/pages/archive/history-alert')
  },
  '/archive/statistics-alert': {
    name: '告警统计'
  },
  '/archive/history-notify': {
    name: '历史通知',
    path: () => import('@/pages/archive/history-notify')
  },
  '/community': {
    name: 'Moon社区'
  },
  '/community/strategy-template': {
    name: '策略仓库',
    path: () => import('@/pages/community/strategy-template')
  },
  '/community/discussion': {
    name: '讨论'
  },
  '/system': {
    name: '系统管理'
  },
  '/system/user': {
    name: '用户管理',
    path: () => import('@/pages/system/user')
  },
  '/system/resource': {
    name: '资源管理',
    path: () => import('@/pages/system/resource')
  },
  '/system/team': {
    name: '团队管理',
    path: () => import('@/pages/system/team')
  },
  '/system/template': {
    name: '通知模板',
    path: () => import('@/pages/system/template')
  }
}
