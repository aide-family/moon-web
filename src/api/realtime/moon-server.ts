import type { ServerItem } from '../model-types'
import request from '../request'

/**
 * 获取houyi服务列表
 * @param params 获取服务数量参数
 * @returns 获取服务数量响应
 */
export function getHouyiServer(params: GetHouyiServerRequest): Promise<GetServerReply> {
  return request.GET<GetServerReply>(`/v1/server/list?type=${params.type}`)
}

/**
 * 获取rabbit服务列表
 * @param params 获取服务数量参数
 * @returns 获取服务数量响应
 */
export function getRabbitServer(params: GetRabbitServerRequest): Promise<GetServerReply> {
  return request.GET<GetServerReply>(`/v1/server/list?type=${params.type}`)
}

// 以下类型定义基于 proto 文件
export interface GetHouyiServerRequest {
  type: 'houyi'
}

export interface GetRabbitServerRequest {
  type: 'rabbit'
}

export interface GetServerReply {
  list: ServerItem[]
}
