import { Error403 } from '@/components/error'
import { lazy } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'

export const routers: RouteObject[] = [
  {
    path: '/login',
    Component: lazy(() => import('@/pages/login')),
  },
  {
    path: '/home',
    Component: lazy(() => import('@/components/layout')),
    children: [
      {
        path: '/home/self',
        Component: lazy(() => import('@/pages/self')),
        children: [
          {
            path: '/home/self/manage',
            Component: lazy(() => import('@/pages/self/manage')),
          },
          {
            path: '/home/self/space-manage',
            Component: lazy(() => import('@/pages/self/space-manage')),
          },
        ],
      },
      {
        path: '/home/system/users',
        Component: lazy(() => import('@/pages/system/users')),
      },
      {
        path: '/home/datasource',
        children: [
          {
            path: '/home/datasource/metric',
            Component: lazy(() => import('@/pages/datasource/metric')),
          },
        ],
      },
      {
        // 403
        path: '/home/*',
        element: <Error403 />,
      },
    ],
  },
  {
    path: '/',
    // 重定向/home
    element: <Navigate to='/home' replace={true} />,
  },
  {
    // 403
    path: '*',
    element: <Error403 />,
  },
]
