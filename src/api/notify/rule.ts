import request from '@/api/request'
import { Status, TimeEngineRuleType } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { TimeEngineRuleItem } from '../model-types'

/**
 * 创建时间引擎规则请求
 */
export interface CreateTimeEngineRuleRequest {
  /* 规则名称 */
  name: string
  /* 规则备注 */
  remark: string
  /* 规则类型 */
  category: TimeEngineRuleType
  /* 规则 */
  rules: number[]
  /* 状态 */
  status: Status
}

/**
 * 更新时间引擎规则请求
 */
export interface UpdateTimeEngineRuleRequest {
  /* 规则ID */
  id: number
  /* 明细数据 */
  data: CreateTimeEngineRuleRequest
}

/**
 * 更新时间引擎规则状态请求
 */
export interface UpdateTimeEngineRuleStatusRequest {
  /* 规则ID */
  ids: number[]
  /* 状态 */
  status: Status
}

/**
 * 获取时间引擎规则列表请求
 */
export interface ListTimeEngineRuleRequest {
  /* 分页 */
  pagination: PaginationReq
  /** 模糊查询 */
  keyword?: string
  /* 状态 */
  status?: Status
  /* 规则类型 */
  category?: TimeEngineRuleType
}

/**
 * 获取时间引擎规则列表返回
 */
export interface ListTimeEngineRuleReply {
  /* 规则列表 */
  list: TimeEngineRuleItem[]
  /* 分页 */
  pagination: PaginationReply
}

/**
 * 获取时间引擎规则明细返回
 */
export interface GetTimeEngineRuleDetailReply {
  /* 规则明细 */
  detail: TimeEngineRuleItem
}

/**
 * 创建时间引擎规则
 * @param data CreateTimeEngineRuleRequest
 * @returns
 */
export const createTimeEngineRule = (data: CreateTimeEngineRuleRequest) => {
  return request.POST('/v1/admin/alarm/time_engine_rule/create', data)
}

/**
 * 更新时间引擎规则
 * @param data UpdateTimeEngineRuleRequest
 * @returns
 */
export const updateTimeEngineRule = (data: UpdateTimeEngineRuleRequest) => {
  return request.PUT('/v1/admin/alarm/time_engine_rule/update', data)
}

/**
 * 更新时间引擎规则状态
 * @param data UpdateTimeEngineRuleStatusRequest
 * @returns
 */
export const updateTimeEngineRuleStatus = (data: UpdateTimeEngineRuleStatusRequest) => {
  return request.PUT('/v1/admin/alarm/time_engine_rule/status', data)
}

/**
 * 删除时间引擎规则
 * @param id
 * @returns
 */
export const deleteTimeEngineRule = (id: number) => {
  return request.DELETE(`/v1/admin/alarm/time_engine_rule/delete/${id}`)
}

/**
 * 获取时间引擎规则明细
 * @param id
 * @returns
 */
export const getTimeEngineRule = (id: number): Promise<GetTimeEngineRuleDetailReply> => {
  return request.GET<GetTimeEngineRuleDetailReply>(`/v1/admin/alarm/time_engine_rule/get/${id}`)
}

/**
 * 获取时间引擎规则列表
 * @param data ListTimeEngineRuleRequest
 * @returns
 */
export const listTimeEngineRule = (data: ListTimeEngineRuleRequest): Promise<ListTimeEngineRuleReply> => {
  return request.POST<ListTimeEngineRuleReply>('/v1/admin/alarm/time_engine_rule/list', data)
}
