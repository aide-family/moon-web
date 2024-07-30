import { UserItem } from '../authorization/user'
import { DataSourceType, Pagination, PaginationResponse, Status, StorageType } from '../global'
import request from '../request'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DatasourceItemType {
  id: number
  name: string
  type?: DataSourceType
  endpoint: string
  status?: Status
  createdAt?: string
  updatedAt?: string
  config?: Record<string, any>
  remark?: string
  storageType?: StorageType
  creator?: UserItem
}

export interface DatasourceListRequest {
  pagination: Pagination
  keyword?: string
  status?: Status
  type?: DataSourceType
  storageType?: StorageType
}

export interface DatasourceCreateRequest {
  name: string
  type: DataSourceType
  endpoint: string
  status: Status
  config?: Record<string, any>
  configStr?: string
  remark?: string
  storageType: StorageType
}

/**
 * 获取数据源列表
 * POST /v1/datasource/list
 */
const getDatasourceList = (params: DatasourceListRequest) => {
  return request.POST<PaginationResponse<DatasourceItemType>>('/v1/datasource/list', params)
}

/**
 * 创建数据源
 * POST /v1/datasource
 */
const createDatasource = (params: DatasourceCreateRequest) => {
  return request.POST('/v1/datasource', params)
}

export default {
  getDatasourceList,
  createDatasource
}
