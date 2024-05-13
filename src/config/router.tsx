import { Error403 } from '@/components/error'
import { lazy } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'

export const routers: RouteObject[] = [
  {
    path: '/home',
    Component: lazy(() => import('@/components/layout')),
    children: [
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
