import request from '@/api/request'
import { Status } from '../global'
import {
  CreateStrategyGroupRequest,
  CreateStrategyRequest,
  GetStrategyGroupListRequest,
  GetStrategyGroupListResponse,
  GetStrategyGroupResponse,
  GetStrategyListRequest,
  GetStrategyListResponse,
  StrategyGroupItemType,
  StrategyGroupNullResponse,
  StrategyNullResponse,
  UpdateStrategyGroupRequest,
  UpdateStrategyRequest
} from './types'

const { POST, PUT, DELTED, GET } = request

/**
 * 获取策略组详情
 * @method GET /v1/group/strategy/{id}
 * @param {number} id
 * @returns {StrategyGroupItemType}
 */
async function getStrategyGroup(id: number): Promise<StrategyGroupItemType> {
  const { detail } = await GET<GetStrategyGroupResponse>(`/v1/group/strategy/${id}`)
  return detail
}

/**
 * 获取策略组列表
 * @method POST /v1/group/strategy/list
 * @param {CreateStrategyGroupRequest} params
 * @returns {GetStrategyGroupListResponse}
 */
async function getStrategyGroupList(params: GetStrategyGroupListRequest): Promise<GetStrategyGroupListResponse> {
  return await POST<GetStrategyGroupListResponse>('/v1/group/strategy/list', params)
}

/**
 * 创建策略组
 * @method POST /v1/group/strategy/create
 * @param {CreateStrategyGroupRequest} params
 * @returns {StrategyGroupNullResponse}
 */
async function createStrategyGroup(params: CreateStrategyGroupRequest): Promise<StrategyGroupNullResponse> {
  return await POST<StrategyGroupNullResponse>('/v1/group/strategy/create', params)
}

/**
 * 删除策略组
 * @method DELETE /v1/group/strategy/{id}
 * @param {number} id
 * @returns {StrategyGroupNullResponse}
 */
async function deleteStrategyGroup(id: number): Promise<StrategyGroupNullResponse> {
  return await DELTED(`/v1/group/strategy/${id}`)
}

/**
 * 更新策略组
 * @method PUT /v1/group/strategy/{id}
 * @param {number} id
 * @returns {StrategyGroupNullResponse}
 */
async function updateStrategyGroup(id: number, params: UpdateStrategyGroupRequest): Promise<StrategyGroupNullResponse> {
  return await PUT<StrategyGroupNullResponse>(`/v1/group/strategy/${id}`, params)
}

/**
 *  修改策略分组状态
 * @method PUT /v1/group/strategy/update/status
 * @param {number[]} ids
 * @param {Status} status
 * @returns {StrategyGroupNullResponse}
 */
async function changeStrategyGroup(ids: number[], status: Status): Promise<StrategyGroupNullResponse> {
  return await PUT<StrategyGroupNullResponse>(`/v1/group/strategy/update/status`, {
    ids,
    status
  })
}

/**
 * 获取策略列表
 * @method POST /v1/strategy/list
 * @param {GetStrategyListRequest} params
 * @returns {GetStrategyListResponse}
 */
async function getStrategyList(params: GetStrategyListRequest): Promise<GetStrategyListResponse> {
  return await POST<GetStrategyListResponse>('/v1/strategy/list', params)
}

/**
 * 创建策略
 * @method POST /v1/strategy/create
 * @param {CreateStrategyRequest} params
 * @returns {StrategyNullResponse}
 */
async function createStrategy(params: CreateStrategyRequest): Promise<StrategyNullResponse> {
  return await POST<StrategyNullResponse>('/v1/strategy/create', params)
}

async function updateStrategy(params: UpdateStrategyRequest): Promise<StrategyNullResponse> {
  return await PUT<StrategyNullResponse>(`/v1/strategy/update/${params.id}`, params)
}

export {
  changeStrategyGroup,
  createStrategy,
  createStrategyGroup,
  deleteStrategyGroup,
  getStrategyGroup,
  getStrategyGroupList,
  getStrategyList,
  updateStrategy,
  updateStrategyGroup
}
