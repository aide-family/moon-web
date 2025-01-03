import type { Status } from '../enum'
import type { PaginationReply, PaginationReq } from '../global'
import type { ResourceItem, SelectItem } from '../model-types'
import request, { buildHeader } from '../request'

/**
 * 获取资源详情
 * @param {GetResourceRequest} params
 * @returns {Promise<GetResourceReply>}
 */
export function getResource(params: GetResourceRequest, isSystem?: boolean): Promise<GetResourceReply> {
  return request.GET<GetResourceReply>(`/v1/resource/${params.id}`, {}, buildHeader(isSystem))
}

/**
 * 获取资源列表
 * @param {ListResourceRequest} params
 * @returns {Promise<ListResourceReply>}
 */
export function listResource(params: ListResourceRequest, isSystem?: boolean): Promise<ListResourceReply> {
  return request.POST<ListResourceReply>('/v1/resource', params, buildHeader(isSystem))
}

/**
 * 批量更新资源状态
 * @param {BatchUpdateResourceStatusRequest} params
 * @returns {Promise<BatchUpdateResourceStatusReply>}
 */
export function batchUpdateResourceStatus(
  params: BatchUpdateResourceStatusRequest,
  isSystem?: boolean
): Promise<BatchUpdateResourceStatusReply> {
  return request.PUT<BatchUpdateResourceStatusReply>('/v1/resource/status', params, buildHeader(isSystem))
}

/**
 * 获取资源下拉列表
 * @param {ListResourceRequest} params
 * @returns {Promise<GetResourceSelectListReply>}
 */
export function getResourceSelectList(
  params: ListResourceRequest,
  isSystem?: boolean
): Promise<GetResourceSelectListReply> {
  return request.POST<GetResourceSelectListReply>('/v1/resource/select', params, buildHeader(isSystem))
}

// Types for the requests and responses
export interface GetResourceRequest {
  id: number
}

export interface GetResourceReply {
  detail: ResourceItem
}

export interface ListResourceRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
  isAll?: boolean
}

export interface ListResourceReply {
  pagination: PaginationReply
  list: ResourceItem[]
}

export interface BatchUpdateResourceStatusRequest {
  ids: number[]
  status: Status
}

export type BatchUpdateResourceStatusReply = {}

export interface GetResourceSelectListReply {
  pagination: PaginationReply
  list: SelectItem[]
}
