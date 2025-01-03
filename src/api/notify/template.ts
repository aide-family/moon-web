import { AlarmSendType, Status } from '@/api/enum'
import request from '@/api/request'
import { PaginationReply, PaginationReq } from '../global'
import { SendTemplateItem } from '../model-types'

const { POST, GET, PUT, DELETE } = request

/**
 * 创建告警通知模板
 * @param data
 * @returns
 */
export const createTemplate = (data: CreateTemplateRequest) => POST('/v1/admin/template/send/create', data)

/**
 * 更新告警通知模板
 * @param data
 * @returns
 */
export const updateTemplate = (data: UpdateTemplateRequest) => PUT('/v1/admin/template/send/update', data)

/**
 * 删除告警通知模板
 * @param data
 * @returns
 */
export const deleteTemplate = (id: number) => DELETE(`/v1/admin/template/send/delete/${id}`)

/**
 * 获取告警通知模板
 * @param id
 * @returns
 */
export const getTemplate = (id: number): Promise<GetTemplateReply> => GET(`/v1/admin/template/send/get/${id}`)

/**
 * 获取告警通知模板列表
 * @param data
 * @returns
 */
export const getTemplateList = (data: GetTemplateListRequest): Promise<GetTemplateListReply> =>
  POST('/v1/admin/template/send/list', data)

/**
 * 更新告警通知模板状态
 * @param data
 * @returns
 */
export const updateTemplateStatus = (data: UpdateTemplateStatusRequest) => PUT('/v1/admin/template/send/status', data)

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
