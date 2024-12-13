import { PaginationReply, PaginationReq } from '../global'
import { TopicItem } from '../model-types'
import request from '../request'

/**
 * 获取主题列表请求参数
 */
export interface GetTopicsRequest {
  /**
   * 主题名称
   */
  keyword?: string
  /**
   * 数据源ID
   */
  datasourceID: number
  /**
   * 分页参数
   */
  pagination: PaginationReq
}

/**
 * 获取主题列表响应
 */
export interface GetTopicsReply {
  /**
   * 主题列表
   */
  list: TopicItem[]
  /**
   * 主题总数
   */
  pagination: PaginationReply
}

/**
 * 同步主题请求参数
 */
export interface SyncTopicsRequest {
  /**
   * 数据源ID
   */
  datasourceID: number
}

/**
 * 获取主题列表
 * @param params 获取主题列表请求参数
 * @returns 获取主题列表响应
 */
export function getTopics(params: GetTopicsRequest): Promise<GetTopicsReply> {
  console.log(params)
  return Promise.resolve({
    list: [
      {
        name: 'test',
        id: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        remark: 'test remark',
        config: {
          test: 'test'
        }
      }
    ],
    pagination: {
      total: 100,
      pageNum: 1,
      pageSize: 10
    }
  })
  // return request.POST<GetTopicsReply>('/v1/datasource/mq/topics', params)
}

/**
 * 同步主题
 * @param params 同步主题请求参数
 * @returns 同步主题响应
 */
export function syncTopics(params: SyncTopicsRequest): Promise<null> {
  return request.POST<null>('/v1/datasource/mq/topics/sync', params)
}
