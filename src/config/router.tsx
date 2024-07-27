/*
 * @Author: lcx 2689211674@qq.com
 * @Date: 2024-07-23 18:22:26
 * @LastEditors: lcx 2689211674@qq.com
 * @LastEditTime: 2024-07-26 10:38:16
 * @FilePath: /moon-web/src/config/router.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
        path: '/home/strategy',
        Component: lazy(() => import('@/pages/strategy')),
        children: [
          {
            path: '/home/strategy/group',
            Component: lazy(() => import('@/pages/strategy/group')),
          },
          {
            path: '/home/strategy/metric',
            Component: lazy(() => import('@/pages/strategy/metric')),
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
        path: '/home/community',
        children: [
          {
            path: '/home/community/strategy-template',
            Component: lazy(
              () => import('@/pages/community/strategy-template')
            ),
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
