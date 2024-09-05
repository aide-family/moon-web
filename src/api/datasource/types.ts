import { UserItem } from '../authorization/user'
import { DataSourceType, MetricType, Pagination, SelectType, Status, StorageType } from '../global'

export interface DatasourceSelectParams {
  status?: Status
  keyword?: string
  limit?: number
  storageType?: StorageType
}

export interface DatasourceSelectResponse {
  data: SelectType[]
}

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

export interface MetricItemType {
  name: string
  help?: string
  type: MetricType
  labels?: MetricLabelType[]
  unit?: string
  labelCount?: number
  id: number
}

export interface MetricLabelType {
  name: string
  values?: MetricLabelValueType[]
  id: number
}

export interface MetricLabelValueType {
  id: number
  value: string
}

export interface MetricListRequest {
  pagination: Pagination
  keyword?: string
  metricType?: MetricType
  datasourceId?: number
}
