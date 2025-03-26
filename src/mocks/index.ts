import { LogItem } from '@/api/log'
import Mock from 'mockjs'
import { generateMockLogs } from './logAudit'

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

export default Mock
