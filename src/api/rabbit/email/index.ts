/**
 * 邮件相关 API
 * 数据来源：后端 API
 */

import { http } from '../../index'
import type {
  EmailListResponse,
  EmailListParams,
  EmailItem,
  CreateEmailParams,
  UpdateEmailParams,
  UpdateEmailStatusParams,
  EmailConfigSelectParams,
  EmailConfigSelectResponse,
} from './types'

/**
 * 获取邮件配置列表（用于表格展示）
 * @param params 查询参数
 * @returns 邮件配置列表
 */
export const getEmailTableList = (
  params?: EmailListParams,
): Promise<EmailListResponse> => {
  return http.get<EmailListResponse>('/email/configs', { ...params })
}

/**
 * 获取邮件配置详情
 * @param uid 邮件配置 UID
 * @returns 邮件配置详情
 */
export const getEmailDetail = (uid: string): Promise<EmailItem> => {
  return http.get<EmailItem>(`/email/${uid}`)
}

/**
 * 创建邮件配置
 * @param params 创建参数
 * @returns 创建的邮件配置
 */
export const createEmail = (params?: CreateEmailParams): Promise<EmailItem> => {
  return http.post<EmailItem>('/email/config', { ...params })
}

/**
 * 更新邮件配置
 * @param uid 邮件配置 UID
 * @param params 更新参数
 * @returns 更新后的邮件配置
 */
export const updateEmail = (
  uid: string,
  params?: UpdateEmailParams,
): Promise<EmailItem> => {
  return http.put<EmailItem>(`/email/config/${uid}`, { ...params })
}

/**
 * 删除邮件配置
 * @param uid 邮件配置 UID
 * @returns 删除结果
 */
export const deleteEmail = (uid: string): Promise<void> => {
  return http.delete<void>(`/email/config/${uid}`)
}

/**
 * 更新邮件配置状态
 * @param uid 邮件配置 UID
 * @param status 状态值
 * @returns 更新后的邮件配置
 */
export const updateEmailStatus = (
  params: UpdateEmailStatusParams,
): Promise<EmailItem> => {
  return http.put<EmailItem>(`/email/config/${params.uid}/status`, {
    status: params.status,
  })
}

/**
 * 邮件配置下拉列表（Email_SelectEmailConfig）
 * GET /email/configs/select，用于下拉选择，支持 keyword/limit/lastUID/status
 */
export const getEmailConfigSelectList = (
  params?: EmailConfigSelectParams,
): Promise<EmailConfigSelectResponse> => {
  return http.get<EmailConfigSelectResponse>('/email/configs/select', {
    ...params,
  })
}

// 导出类型
export type {
  EmailItem,
  EmailListResponse,
  EmailListParams,
  CreateEmailParams,
  UpdateEmailParams,
  UpdateEmailStatusParams,
  EmailItemSelect,
  EmailConfigSelectParams,
  EmailConfigSelectResponse,
} from './types'
