import { Error403 } from '@/components/error'
import { lazy } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'

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
            path: '/home/realtime/dashboard',
            Component: lazy(() => import('@/pages/realtime/dashboard'))
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
          }
        ]
      },

      {
        path: '/home/datasource',
        children: [
          {
            path: '/home/datasource/metric',
            Component: lazy(() => import('@/pages/datasource/metric'))
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
        element: <Error403 />
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
