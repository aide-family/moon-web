import { MenuTree } from '@/api/menu'
import { ErrorResponse } from '@/api/request'
import { breadcrumbNameMap } from '@/config/menu'
import { FormInstance } from 'antd'
import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'

// 公共错误处理方法（支持泛型）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleFormError = <T extends Record<string, any>>(
  form: FormInstance<T>, // 可以使用 FormInstance<T> 替代 any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: ErrorResponse | any
) => {
  if (err.code === 400) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(err?.metadata).forEach((key: any) => {
      form.setFields([{ name: key, errors: [err?.metadata?.[key]] }])
    })
  }
}

// 转换路由树
export const transformRoutersTree = (menuTree: MenuTree[]): RouteObject[] => {
  return menuTree.map((item) => {
    const routersItem: RouteObject = {
      path: item.key,
      ...(!item.children && {
        Component: lazy(breadcrumbNameMap[item.key]?.path || (() => import('@/components/error/Error404')))
      }),
      children: item.children ? transformRoutersTree(item.children) : undefined
    }
    return routersItem
  })
}
