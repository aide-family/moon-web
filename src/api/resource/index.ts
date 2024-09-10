import { PaginationReply, PaginationReq, Status } from '../global'
import { ResourceItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 获取资源详情
 * @param {GetResourceRequest} params
 * @returns {Promise<GetResourceReply>}
 */
export function getResource(params: GetResourceRequest): Promise<GetResourceReply> {
  return request.GET<GetResourceReply>(`/v1/resource/${params.id}`)
}

/**
 * 获取资源列表
 * @param {ListResourceRequest} params
 * @returns {Promise<ListResourceReply>}
 */
export function listResource(params: ListResourceRequest): Promise<ListResourceReply> {
  return request.POST<ListResourceReply>('/v1/resource', params)
}

/**
 * 批量更新资源状态
 * @param {BatchUpdateResourceStatusRequest} params
 * @returns {Promise<BatchUpdateResourceStatusReply>}
 */
export function batchUpdateResourceStatus(
  params: BatchUpdateResourceStatusRequest
): Promise<BatchUpdateResourceStatusReply> {
  return request.PUT<BatchUpdateResourceStatusReply>('/v1/resource/status', params)
}

/**
 * 获取资源下拉列表
 * @param {ListResourceRequest} params
 * @returns {Promise<GetResourceSelectListReply>}
 */
export function getResourceSelectList(params: ListResourceRequest): Promise<GetResourceSelectListReply> {
  return request.POST<GetResourceSelectListReply>('/v1/resource/select', params)
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
}

export interface ListResourceReply {
  pagination: PaginationReply
  list: ResourceItem[]
}

export interface BatchUpdateResourceStatusRequest {
  ids: number[]
  status: Status
}

export interface BatchUpdateResourceStatusReply {}

export interface GetResourceSelectListReply {
  pagination: PaginationReply
  list: SelectItem[]
}
