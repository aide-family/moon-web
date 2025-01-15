import type { AlarmSendType, Status } from '@/api/enum'
import request, { buildHeader } from '@/api/request'
import type { PaginationReply, PaginationReq } from '../global'
import type { SendTemplateItem } from '../model-types'

const { POST, GET, PUT, DELETE } = request

/**
 * 创建告警通知模板
 * @param data
 * @returns
 */
export const createTemplate = (data: CreateTemplateRequest, isSystem?: boolean) =>
  POST('/v1/admin/template/send/create', data, buildHeader(isSystem))

/**
 * 更新告警通知模板
 * @param data
 * @returns
 */
export const updateTemplate = (data: UpdateTemplateRequest, isSystem?: boolean) =>
  PUT('/v1/admin/template/send/update', data, buildHeader(isSystem))

/**
 * 删除告警通知模板
 * @param data
 * @returns
 */
export const deleteTemplate = (id: number, isSystem?: boolean) =>
  DELETE(`/v1/admin/template/send/delete/${id}`, {}, buildHeader(isSystem))

/**
 * 获取告警通知模板
 * @param id
 * @returns
 */
export const getTemplate = (id: number, isSystem?: boolean): Promise<GetTemplateReply> =>
  GET(`/v1/admin/template/send/get/${id}`, {}, buildHeader(isSystem))

/**
 * 获取告警通知模板列表
 * @param data
 * @returns
 */
export const getTemplateList = (data: GetTemplateListRequest, isSystem?: boolean): Promise<GetTemplateListReply> =>
  POST('/v1/admin/template/send/list', data, buildHeader(isSystem))

/**
 * 更新告警通知模板状态
 * @param data
 * @returns
 */
export const updateTemplateStatus = (data: UpdateTemplateStatusRequest, isSystem?: boolean) =>
  PUT('/v1/admin/template/send/status', data, buildHeader(isSystem))

/**
 * 创建告警通知模板
 */
export type CreateTemplateRequest = {
  /** 模板名称 */
  name: string
  /** 模板内容 */
  content: string
  /** 模板发送类型 */
  sendType: AlarmSendType
  /** 模板备注 */
  remark: string
  /** 模板状态 */
  status: Status
  /** 模板类型 */
  templateType?: string
}

/**
 * 更新告警通知模板
 */
export type UpdateTemplateRequest = {
  /** 模板ID */
  id: number
  /** 模板数据 */
  data: CreateTemplateRequest
}

/**
 * 删除告警通知模板
 */
export type DeleteTemplateRequest = {
  /** 模板ID */
  id: number
}

/**
 * 获取告警通知模板
 */
export type GetTemplateRequest = {
  /** 模板ID */
  id: number
}

/**
 * 获取告警通知模板列表
 */
export type GetTemplateListRequest = {
  /** 分页 */
  pagination: PaginationReq
  /** 关键字 */
  keyword?: string
  /** 模板发送类型 */
  sendType?: AlarmSendType
  /** 模板状态 */
  status?: Status
}

/**
 * 更新告警通知模板状态
 */
export type UpdateTemplateStatusRequest = {
  /** 模板ID */
  ids: number[]
  /** 模板状态 */
  status: Status
}

/**
 * 获取告警通知模板列表
 */
export type GetTemplateListReply = {
  /** 模板列表 */
  list: SendTemplateItem[]
  /** 分页 */
  pagination: PaginationReply
}

/**
 * 获取告警通知模板
 */
export type GetTemplateReply = {
  /** 模板 */
  detail: SendTemplateItem
}
