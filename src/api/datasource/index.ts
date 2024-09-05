import request from '@/api/request'
import { PaginationResponse } from '../global'
import {
  DatasourceCreateRequest,
  DatasourceItemType,
  DatasourceListRequest,
  DatasourceSelectParams,
  DatasourceSelectResponse
} from './types'

const { POST } = request

/**
 * 获取数据源列表
 * POST /v1/datasource/list
 */
export const getDatasourceList = (params: DatasourceListRequest) => {
  return POST<PaginationResponse<DatasourceItemType>>('/v1/datasource/list', params)
}

/**
 * 创建数据源
 * POST /v1/datasource
 */
export const createDatasource = (params: DatasourceCreateRequest) => {
  return POST('/v1/datasource', params)
}

/**
 * 数据源下拉列表
 * post /v1/datasource/select
 */
export const getDatasourceSelect = (params: DatasourceSelectParams) => {
  return POST<DatasourceSelectResponse>('/v1/datasource/select', params)
}
