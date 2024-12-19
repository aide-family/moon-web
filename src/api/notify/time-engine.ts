import request from '@/api/request'
import { Status } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { TimeEngineItem } from '../model-types'

/**
 * 创建时间引擎请求
 */
export interface CreateTimeEngineRequest {
  /* 名称 */
  name: string
  /* 备注 */
  remark: string
  /* 引擎规则 */
  rules: number[]
  /* 状态 */
  status: Status
}

/**
 * 更新时间引擎请求
 */
export interface UpdateTimeEngineRequest {
  /* ID */
  id: number
  /* 明细数据 */
  data: CreateTimeEngineRequest
}

/**
 * 更新时间引擎状态请求
 */
export interface UpdateTimeEngineStatusRequest {
  /* ID */
  ids: number[]
  /* 状态 */
  status: Status
}

/**
 * 获取时间引擎列表请求
 */
export interface ListTimeEngineRequest {
  /* 分页 */
  pagination: PaginationReq
  /** 模糊查询 */
  keyword?: string
  /* 状态 */
  status?: Status
}

/**
 * 获取时间引擎列表返回
 */
export interface ListTimeEngineReply {
  /* 列表 */
  list: TimeEngineItem[]
  /* 分页 */
  pagination: PaginationReply
}

/**
 * 获取时间引擎明细返回
 */
export interface GetTimeEngineDetailReply {
  /* 明细 */
  detail: TimeEngineItem
}

/**
 * 创建时间引擎
 * @param data CreateTimeEngineRequest
 * @returns
 */
export const createTimeEngine = (data: CreateTimeEngineRequest) => {
  return request.POST('/v1/admin/alarm/time_engine/create', data)
}

/**
 * 更新时间引擎
 * @param data UpdateTimeEngineRequest
 * @returns
 */
export const updateTimeEngine = (data: UpdateTimeEngineRequest) => {
  return request.PUT('/v1/admin/alarm/time_engine/update', data)
}

/**
 * 更新时间引擎状态
 * @param data UpdateTimeEngineStatusRequest
 * @returns
 */
export const updateTimeEngineStatus = (data: UpdateTimeEngineStatusRequest) => {
  return request.PUT('/v1/admin/alarm/time_engine/status', data)
}

/**
 * 删除时间引擎
 * @param id
 * @returns
 */
export const deleteTimeEngine = (id: number) => {
  return request.DELETE(`/v1/admin/alarm/time_engine/delete/${id}`)
}

/**
 * 获取时间引擎明细
 * @param id
 * @returns
 */
export const getTimeEngine = (id: number): Promise<GetTimeEngineDetailReply> => {
  return request.GET<GetTimeEngineDetailReply>(`/v1/admin/alarm/time_engine/get/${id}`)
}

/**
 * 获取时间引擎列表
 * @param data ListTimeEngineRequest
 * @returns
 */
export const listTimeEngine = (data: ListTimeEngineRequest): Promise<ListTimeEngineReply> => {
  return request.POST<ListTimeEngineReply>('/v1/admin/alarm/time_engine/list', data)
}
