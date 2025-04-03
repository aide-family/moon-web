import { Error403, Error404 } from '@/components/error'
import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'

export const routers: RouteObject[] = [
  {
    path: '/login',
    Component: lazy(() => import('@/pages/login'))
  },
  {
    path: '/oauth/register/email',
    Component: lazy(() => import('@/pages/login/oauth/email'))
  },
  {
    path: '/register',
    Component: lazy(() => import('@/pages/login/register/register'))
  },
  {
    path: '/home',
    Component: lazy(() => import('@/components/layout')),
    children: [
      {
        path: '/home/realtime',
        children: [
          {
            path: '/home/realtime/alarm',
            Component: lazy(() => import('@/pages/realtime/alarm'))
          },
          {
            path: '/home/realtime/server',
            Component: lazy(() => import('@/pages/realtime/server'))
          },
          {
            path: '/home/realtime/dashboard',
            Component: lazy(() => import('@/pages/realtime/dashboard'))
          },
          {
            path: '/home/realtime/monitor',
            Component: lazy(() => import('@/pages/realtime/monitor'))
          }
        ]
      },
      {
        path: '/home/archive',
        children: [
          {
            path: '/home/archive/history-alert',
            Component: lazy(() => import('@/pages/archive/history-alert'))
          },
          // {
          //   path: '/home/archive/statistics-alert',
          //   Component: lazy(() => import('@/pages/archive/alert-statistics'))
          // },
          {
            path: '/home/archive/history-notify',
            Component: lazy(() => import('@/pages/archive/history-notify'))
          }
        ]
      },
      {
        path: '/home/self',
        Component: lazy(() => import('@/pages/self')),
        children: [
          {
            path: '/home/self/manage',
            Component: lazy(() => import('@/pages/self/manage'))
          },
          {
            path: '/home/self/space-manage',
            Component: lazy(() => import('@/pages/self/space-manage'))
          }
        ]
      },
      {
        path: '/home/strategy',
        Component: lazy(() => import('@/pages/strategy')),
        children: [
          {
            path: '/home/strategy/group',
            Component: lazy(() => import('@/pages/strategy/group'))
          },
          {
            path: '/home/strategy/list',
            Component: lazy(() => import('@/pages/strategy/list'))
          },
          {
            path: '/home/strategy/subscribe',
            Component: lazy(() => import('@/pages/strategy/subscribe'))
          }
        ]
      },
      {
        path: '/home/team',
        children: [
          {
            path: '/home/team/members',
            Component: lazy(() => import('@/pages/team/members'))
          },
          {
            path: '/home/team/dict',
            Component: lazy(() => import('@/pages/team/dict'))
          },
          {
            path: '/home/team/role',
            Component: lazy(() => import('@/pages/team/role'))
          },
          {
            path: '/home/team/resource',
            Component: lazy(() => import('@/pages/team/resource'))
          },
          {
            path: '/home/team/dashboard',
            Component: lazy(() => import('@/pages/team/dashboard'))
          },
          {
            path: '/home/team/dashboard/chart',
            Component: lazy(() => import('@/pages/team/dashboard/chart'))
          },
          {
            path: '/home/team/config',
            Component: lazy(() => import('@/pages/team/config'))
          },
          {
            path: '/home/team/log-audit',
            Component: lazy(() => import('@/pages/team/log-audit'))
          }
        ]
      },

      {
        path: '/home/datasource',
        children: [
          {
            path: '/home/datasource/metric',
            Component: lazy(() => import('@/pages/datasource/metric'))
          },
          {
            path: '/home/datasource/event',
            Component: lazy(() => import('@/pages/datasource/event'))
          },
          {
            path: '/home/datasource/log',
            Component: lazy(() => import('@/pages/datasource/log'))
          }
        ]
      },
      {
        path: '/home/community',
        children: [
          {
            path: '/home/community/strategy-template',
            Component: lazy(() => import('@/pages/community/strategy-template'))
          }
        ]
      },
      {
        path: '/home/notify',
        children: [
          {
            path: '/home/notify/hook',
            Component: lazy(() => import('@/pages/notify/hook'))
          },
          {
            path: '/home/notify/group',
            Component: lazy(() => import('@/pages/notify/group'))
          },
          {
            path: '/home/notify/rule',
            Component: lazy(() => import('@/pages/notify/rule'))
          },
          {
            path: '/home/notify/template',
            Component: lazy(() => import('@/pages/notify/template'))
          }
        ]
      },
      {
        path: '/home/system',
        children: [
          {
            path: '/home/system/user',
            Component: lazy(() => import('@/pages/system/user'))
          },
          {
            path: '/home/system/resource',
            Component: lazy(() => import('@/pages/system/resource'))
          },
          {
            path: '/home/system/team',
            Component: lazy(() => import('@/pages/system/team'))
          },
          {
            path: '/home/system/template',
            Component: lazy(() => import('@/pages/system/template'))
          }
        ]
      },
      {
        path: '/home',
        // 重定向/home
        element: <Navigate to='/home/realtime/alarm' replace={true} />
      },
      {
        // 403
        path: '/home/*',
        element: <Error404 />
      }
    ]
  },
  {
    path: '/',
    // 重定向/home
    element: <Navigate to='/home' replace={true} />
  },
  {
    // 403
    path: '*',
    element: <Error403 />
  }
]
export const defaultRouters: RouteObject[] = [
  {
    path: '/login',
    Component: lazy(() => import('@/pages/login'))
  },
  {
    path: '/oauth/register/email',
    Component: lazy(() => import('@/pages/login/oauth/email'))
  },

  {
    path: '/',
    Component: lazy(() => import('@/components/layout')),
    children: []
  },
  {
    path: '/register',
    Component: lazy(() => import('@/pages/login/register/register'))
  },
  // {
  //   path: '/',
  //   // 重定向/home
  //   element: <Navigate to='/login' replace={true} />
  // },
  {
    // 403
    path: '*',
    element: <Error403 />
  }
]
