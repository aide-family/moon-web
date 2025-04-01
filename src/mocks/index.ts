import { LogItem } from '@/api/log'
import { GetMenuReply, TreeMenuRequest } from '@/api/menu'
import Mock from 'mockjs'
import { generateMockLogs } from './logAudit'
import { mockTreeMenuReply } from './menu'

// 定义接口响应类型
export interface ApiResponse<LogItem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: LogItem[]
  pagination: {
    pageNum: number
    pageSize: number
    total: number
  }
}

// 模拟接口
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Mock.mock('/api/logs', 'post', (options: any): ApiResponse<LogItem> => {
  // 生成 100 条日志
  const allLogs = generateMockLogs(100)

  // 分页处理
  const body = JSON.parse(options.body)
  const pageNum = parseInt(body.pagination.pageNum || '1', 10)
  const pageSize = parseInt(body.pagination.pageSize || '10', 10)
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = allLogs.slice(startIndex, endIndex)
  return {
    list: paginatedData,
    pagination: {
      pageNum: pageNum,
      pageSize: pageSize,
      total: allLogs.length
    }
  }
})

Mock.mock('/v1/admin/menu/tree', 'get', () => {
  return mockTreeMenuReply
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTreeMenu(params: TreeMenuRequest): Promise<any> {
  console.log(params)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTreeMenuReply)
    }, 500) // 模拟网络延迟
  })
}

// 递归查找
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findByIdRecursive(arr: any[], id: number): any | undefined {
  for (const item of arr) {
    if (item.id === id) {
      return item
    }
    if (item.children && item.children.length > 0) {
      const found = findByIdRecursive(item.children, id)
      if (found) {
        return found
      }
    }
  }
  return undefined
}
export const getMenu = (parms: { id: number }): Promise<GetMenuReply> => {
  const menu = findByIdRecursive(mockTreeMenuReply.menuTree, parms.id)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ menu })
    }, 500) // 模拟网络延迟
  })
}

Mock.setup({
  timeout: 500
})

export default Mock
