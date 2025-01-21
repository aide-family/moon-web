import { Status } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { AlarmNoticeGroupItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 创建告警组
 * @param params 创建告警组请求参数
 * @returns 创建告警组响应
 */
export function createAlarmGroup(params: CreateAlarmGroupRequest): Promise<CreateAlarmGroupReply> {
  return request.POST<CreateAlarmGroupReply>('/v1/group/alarm/create', params)
}

/**
 * 更新告警组
 * @param params 更新告警组请求参数
 * @returns 更新告警组响应
 */
export function updateAlarmGroup(params: UpdateAlarmGroupRequest): Promise<UpdateAlarmGroupReply> {
  return request.PUT<UpdateAlarmGroupReply>(`/v1/group/alarm/${params.id}`, params)
}

/**
 * 删除告警组
 * @param params 删除告警组请求参数
 * @returns 删除告警组响应
 */
export function deleteAlarmGroup(params: DeleteAlarmGroupRequest): Promise<DeleteAlarmGroupReply> {
  return request.DELETE<DeleteAlarmGroupReply>(`/v1/group/alarm/delete/${params.id}`)
}

/**
 * 获取告警组详情
 * @param params 获取告警组详情请求参数
 * @returns 获取告警组详情响应
 */
export function getAlarmGroup(params: GetAlarmGroupRequest): Promise<GetAlarmGroupReply> {
  return request.GET<GetAlarmGroupReply>(`/v1/group/alarm/detail/${params.id}`)
}

/**
 * 获取告警组列表
 * @param params 获取告警组列表请求参数
 * @returns 获取告警组列表响应
 */
export function listAlarmGroup(params: ListAlarmGroupRequest): Promise<ListAlarmGroupReply> {
  return request.POST<ListAlarmGroupReply>('/v1/group/alarm/list', params)
}

/**
 * 获取告警组列表下拉列表
 * @param params 获取告警组列表下拉列表请求参数
 * @returns 获取告警组列表下拉列表响应
 */
export function listAlarmGroupSelectList(params: ListAlarmGroupRequest): Promise<ListAlarmGroupSelectListReply> {
  return request.POST<ListAlarmGroupSelectListReply>('/v1/group/alarm/list/select', params)
}

/**
 * 更新告警组状态
 * @param params 更新告警组状态请求参数
 * @returns 更新告警组状态响应
 */
export function updateAlarmGroupStatus(params: UpdateAlarmGroupStatusRequest): Promise<UpdateAlarmGroupStatusReply> {
  return request.PUT<UpdateAlarmGroupStatusReply>('/v1/group/alarm/update/status', params)
}

/**
 * 我的告警组
 * @param params 我的告警组请求参数
 * @returns 我的告警组响应
 */
export function myAlarmGroups(params: MyAlarmGroupsRequest): Promise<MyAlarmGroupsReply> {
  return request.POST('/v1/group/alarm/my/list', params)
}

export interface NoticeMember {
  memberId: number
  notifyType: number
}
export interface CreateAlarmGroupRequest {
  name: string
  remark: string
  status: Status
  noticeMember: NoticeMember[]
  hookIds: number[]
  timeEngines: number[]
  templates: number[]
}
export interface CreateAlarmGroupReply {}

export interface UpdateAlarmGroupRequest {
  id: number
  update: CreateAlarmGroupRequest
}
export interface UpdateAlarmGroupReply {}

export interface ListAlarmGroupRequest {
  pagination: PaginationReq
  keyword?: string
  status?: number
}
export interface ListAlarmGroupReply {
  list: AlarmNoticeGroupItem[]
  pagination: PaginationReply
}

export interface ListAlarmGroupSelectListReply {
  list: SelectItem[]
}

export interface GetAlarmGroupRequest {
  id: number
}
export interface GetAlarmGroupReply {
  detail: AlarmNoticeGroupItem
}

export interface DeleteAlarmGroupRequest {
  id: number
}
export interface DeleteAlarmGroupReply {}

export interface UpdateAlarmGroupStatusRequest {
  ids: number[]
  status: number
}
export interface UpdateAlarmGroupStatusReply {}

export interface MyAlarmGroupsRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
}
export interface MyAlarmGroupsReply {
  list: AlarmNoticeGroupItem[]
  pagination: PaginationReply
}
