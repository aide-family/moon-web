import { IconFont } from '@/components/icon'
import { SettingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/es/menu/interface'

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
        label: '服务监控',
        key: '/home/realtime/server'
      },
      {
        label: '数据大盘',
        key: '/home/realtime/dashboard'
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
      }
      // {
      //   label: 'Log',
      //   key: '/home/datasource/log'
      // },
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
      {
        label: '策略组',
        key: '/home/strategy/group'
      },
      {
        label: '策略列表',
        key: '/home/strategy/list'
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
        key: '/home/archive/history'
      }
      // {
      //   label: '告警统计',
      //   key: '/home/archive/statistics'
      // },
      // {
      //   label: '历史通知',
      //   key: '/home/archive/notice'
      // }
    ]
  },
  {
    label: '团队管理',
    key: '/home/team',
    icon: <TeamOutlined />,
    children: [
      {
        label: '团队成员',
        key: '/home/team/members'
      },
      {
        label: '字典管理',
        key: '/home/team/dict'
      },
      {
        label: '角色管理',
        key: '/home/team/role'
      },
      {
        label: '资源管理',
        key: '/home/team/resource'
      },
      {
        label: '团队配置',
        key: '/home/team/config'
      }
      // {
      //   label: '大盘管理',
      //   key: '/home/team/dashboard'
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
}

export const breadcrumbNameMap: Record<string, BreadcrumbNameType> = {
  '/home': {
    name: '首页'
  },
  '/home/team': {
    name: '团队管理'
  },
  '/home/team/members': {
    name: '团队成员'
  },
  '/home/team/dict': {
    name: '字典管理'
  },
  '/home/team/role': {
    name: '角色管理'
  },
  '/home/team/resource': {
    name: '资源管理'
  },
  '/home/team/dashboard': {
    name: '大盘管理'
  },
  '/home/self': {
    name: '个人中心'
  },
  '/home/self/space-manage': {
    name: '我的团队'
  },
  '/home/self/manage': {
    name: '个人设置'
  },
  '/home/realtime': {
    name: '实时监控'
  },
  '/home/realtime/dashboard': {
    name: '数据大盘'
  },
  '/home/realtime/alarm': {
    name: '实时告警'
  },
  '/home/realtime/server': {
    name: '服务监控'
  },
  '/home/datasource': {
    name: '数据源'
  },
  '/home/datasource/metric': {
    name: 'Metric'
  },
  '/home/datasource/event': {
    name: 'Event'
  },
  '/home/datasource/log': {
    name: 'Log'
  },
  '/home/datasource/trace': {
    name: 'Trace'
  },
  '/home/strategy': {
    name: '策略管理'
  },
  '/home/strategy/group': {
    name: '策略组'
  },
  '/home/strategy/list': {
    name: '策略列表'
  },
  '/home/notify': {
    name: '告警通知'
  },
  '/home/notify/group': {
    name: '告警组'
  },
  '/home/notify/hook': {
    name: 'Hook'
  },
  '/home/notify/rule': {
    name: '时间引擎'
  },
  '/home/notify/record': {
    name: '告警记录'
  },
  '/home/archive': {
    name: '告警归档'
  },
  '/home/archive/history': {
    name: '历史告警'
  },
  '/home/archive/statistics': {
    name: '告警统计'
  },
  '/home/archive/notice': {
    name: '历史通知'
  },
  '/home/community': {
    name: 'Moon社区'
  },
  '/home/community/strategy-template': {
    name: '策略仓库'
  },
  '/home/community/discussion': {
    name: '讨论'
  },
  '/home/system': {
    name: '系统管理'
  },
  '/home/system/user': {
    name: '用户管理'
  },
  '/home/system/resource': {
    name: '资源管理'
  }
}
