import { DatasourceType, Status, StorageType } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { DatasourceItem, MetricQueryResult, SelectItem } from '../model-types'
import request from '../request'

/**
 * 创建数据源
 * @param params 创建数据源请求参数
 * @returns 创建数据源响应
 */
export function createDatasource(params: CreateDatasourceRequest): Promise<CreateDatasourceReply> {
  return request.POST<CreateDatasourceReply>('/v1/datasource', params)
}

/**
 * 更新数据源
 * @param params 更新数据源请求参数
 * @returns 更新数据源响应
 */
export function updateDatasource(params: UpdateDatasourceRequest): Promise<UpdateDatasourceReply> {
  return request.PUT<UpdateDatasourceReply>(`/v1/datasource/${params.id}`, params)
}

/**
 * 删除数据源
 * @param params 删除数据源请求参数
 * @returns 删除数据源响应
 */
export function deleteDatasource(params: DeleteDatasourceRequest): Promise<DeleteDatasourceReply> {
  return request.DELETE<DeleteDatasourceReply>(`/v1/datasource/${params.id}`)
}

/**
 * 获取数据源详情
 * @param params 获取数据源详情请求参数
 * @returns 获取数据源详情响应
 */
export function getDatasource(params: GetDatasourceRequest): Promise<GetDatasourceReply> {
  return request.GET<GetDatasourceReply>(`/v1/datasource/${params.id}`)
}

/**
 * 获取数据源列表
 * @param params 获取数据源列表请求参数
 * @returns 获取数据源列表响应
 */
export function listDatasource(params: ListDatasourceRequest): Promise<ListDatasourceReply> {
  return request.POST<ListDatasourceReply>('/v1/datasource/list', params)
}

/**
 * 更新数据源状态
 * @param params 更新数据源状态请求参数
 * @returns 更新数据源状态响应
 */
export function updateDatasourceStatus(params: UpdateDatasourceStatusRequest): Promise<UpdateDatasourceStatusReply> {
  return request.PUT<UpdateDatasourceStatusReply>(`/v1/datasource/${params.id}/status`, params)
}

/**
 * 获取数据源下拉列表
 * @param params 获取数据源下拉列表请求参数
 * @returns 获取数据源下拉列表响应
 */
export function getDatasourceSelect(params: ListDatasourceRequest): Promise<GetDatasourceSelectReply> {
  return request.POST<GetDatasourceSelectReply>('/v1/datasource/select', params)
}

/**
 * 同步数据源元数据
 * @param params 同步数据源元数据请求参数
 * @returns 同步数据源元数据响应
 */
export function syncDatasourceMeta(params: SyncDatasourceMetaRequest): Promise<SyncDatasourceMetaReply> {
  return request.POST<SyncDatasourceMetaReply>(`/v1/datasource/${params.id}/sync`, {})
}

/**
 * 获取数据
 * @param params 获取数据请求参数
 * @returns 获取数据响应
 */
export function datasourceQuery(params: DatasourceQueryRequest): Promise<DatasourceQueryReply> {
  return request.POST<DatasourceQueryReply>(`/v1/datasource/${params.id}/query`, params)
}

// 以下类型定义应基于实际的 proto 文件生成，此处仅为示例
export interface CreateDatasourceRequest {
  name: string
  datasourceType: DatasourceType
  endpoint: string
  status: Status
  remark?: string
  config?: { [key: string]: string }
  storageType?: StorageType
}

export interface CreateDatasourceReply {}

export interface UpdateDatasourceRequest {
  id: number
  name: string
  status: Status
  remark?: string
}

export interface UpdateDatasourceReply {}

export interface DeleteDatasourceRequest {
  id: number
}

export interface DeleteDatasourceReply {}

export interface GetDatasourceRequest {
  id: number
}

export interface GetDatasourceReply {
  data: DatasourceItem
}

export interface ListDatasourceRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
  datasourceType?: DatasourceType
  storageType?: StorageType
}

export interface ListDatasourceReply {
  pagination: PaginationReply
  list: DatasourceItem[]
}

export interface UpdateDatasourceStatusRequest {
  id: number
  status: Status
}

export interface UpdateDatasourceStatusReply {}

export interface GetDatasourceSelectReply {
  list: SelectItem[]
}

export interface SyncDatasourceMetaRequest {
  id: number
}

export interface SyncDatasourceMetaReply {}

export interface DatasourceQueryRequest {
  id: number
  query: string
  range: string[]
  step?: number
}

export interface DatasourceQueryReply {
  list: MetricQueryResult[]
}

export interface ProxyQueryRequest {
  to: string
  datasourceID: number
  datasource: DatasourceItem
}
