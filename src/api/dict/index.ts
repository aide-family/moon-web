import type { DictType, Status } from '../enum'
import type { EnumItem, PaginationReply, PaginationReq } from '../global'
import type { DictItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 创建字典
 * @param params 创建字典请求参数
 * @returns 创建字典响应
 */
export function createDict(params: CreateDictRequest): Promise<unknown> {
  return request.POST<unknown>('/v1/dict/create', params)
}

/**
 * 更新字典
 * @param params 更新字典请求参数
 * @returns 更新字典响应
 */
export function updateDict(params: UpdateDictRequest): Promise<unknown> {
  return request.PUT<unknown>(`/v1/dict/update/${params.id}`, params)
}

/**
 * 获取字典列表
 * @param params 获取字典列表请求参数
 * @returns 获取字典列表响应
 */
export function listDict(params: ListDictRequest): Promise<ListDictReply> {
  return request.POST<ListDictReply>('/v1/dict/list', params)
}

/**
 * 批量修改字典状态
 * @param params 批量修改字典状态请求参数
 * @returns 批量修改字典状态响应
 */
export function batchUpdateDictStatus(params: BatchUpdateDictStatusRequest): Promise<unknown> {
  return request.PUT<unknown>('/v1/dict/status', params)
}

/**
 * 删除字典
 * @param params 删除字典请求参数
 * @returns 删除字典响应
 */
export function deleteDict(params: DeleteDictRequest): Promise<unknown> {
  return request.DELETE<unknown>(`/v1/dict/delete/${params.id}`)
}

/**
 * 获取字典
 * @param params 获取字典请求参数
 * @returns 获取字典响应
 */
export function getDict(params: GetDictRequest): Promise<GetDictReply> {
  return request.GET<GetDictReply>(`/v1/dict/get/${params.id}`)
}

/**
 * 获取字典类型列表
 * @param params 获取字典类型列表请求参数
 * @returns 获取字典类型列表响应
 */
export function listDictType(params: ListDictTypeRequest): Promise<ListDictTypeReply> {
  return request.POST<ListDictTypeReply>('/v1/dict/type/list', params)
}

/**
 * 获取字典下拉列表
 * @param params 获取字典下拉列表请求参数
 * @returns 获取字典下拉列表响应
 */
export function dictSelectList(params: ListDictRequest): Promise<DictSelectListReply> {
  return request.POST<DictSelectListReply>('/v1/dict/select/list', params)
}

// 以下类型定义应基于实际的 proto 文件生成，此处仅为示例
export interface BatchUpdateDictStatusRequest {
  ids: number[]
  status: Status
}

export interface CreateDictRequest {
  name: string
  value: string
  dictType: DictType
  colorType: string
  cssClass: string
  icon: string
  imageUrl: string
  status: Status
  languageCode: string
  remark: string
}

export interface ListDictRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
  dictType?: DictType
  languageCode?: string
}

export interface ListDictReply {
  list: DictItem[]
  pagination: PaginationReply
}

export interface UpdateDictRequest {
  id: number
  data: CreateDictRequest
}

export interface DeleteDictRequest {
  id: number
}

export interface GetDictRequest {
  id: number
}

export interface GetDictReply {
  detail: DictItem
}

export type ListDictTypeRequest = {
  pagination: PaginationReq
  keyword?: string
}

export interface ListDictTypeReply {
  list: EnumItem[]
}

export interface DictSelectListReply {
  list: SelectItem[]
}
