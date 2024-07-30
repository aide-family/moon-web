import request from '@/api/request'
import {
  CreateStrategyTemplateRequest,
  GetStrategyTemplateListRequest,
  GetStrategyTemplateListResponse,
  GetStrategyTemplateResponse,
  StrategyTemplateItemType,
  StrategyTemplateNullResponse,
  UpdateStrategyTemplateRequest,
  ValidateAnnotationTemplateRequest,
  ValidateAnnotationTemplateResponse
} from './types'
import { Status } from '../global'

const { POST, PUT, DELTED, GET } = request
/**
 * 创建策略模版
 * @method: POST /v1/template/strategy/create
 * @param {CreateStrategyTemplateRequest} params
 * @returns {StrategyTemplateNullResponse}
 */
async function createStrategyTemplate(params: CreateStrategyTemplateRequest): Promise<StrategyTemplateNullResponse> {
  return await POST<StrategyTemplateNullResponse>('/v1/template/strategy/create', params)
}

/**
 * 删除策略模版
 * @method DELETE /v1/template/strategy/delete/{id}
 * @param {number} id
 * @returns {StrategyTemplateNullResponse}
 */
async function deleteStrategyTemplate(id: number): Promise<StrategyTemplateNullResponse> {
  return await DELTED(`/v1/template/strategy/delete/${id}`)
}

/**
 * 获取策略模版详情
 * @method GET /v1/template/strategy/get/{id}
 * @param {number} id
 * @returns {StrategyTemplateItemType}
 */
async function getStrategyTemplate(id: number): Promise<StrategyTemplateItemType> {
  const { detail } = await GET<GetStrategyTemplateResponse>(`/v1/template/strategy/get/${id}`)
  return detail
}

/**
 * 获取策略模版列表
 * @method POST /v1/template/strategy/list
 * @param {number} page
 */
async function getStrategyTemplateList(
  params: GetStrategyTemplateListRequest
): Promise<GetStrategyTemplateListResponse> {
  return await POST<GetStrategyTemplateListResponse>('/v1/template/strategy/list', params)
}

/**
 * 更改模板启用状态
 * @method PUT /v1/template/strategy/status
 * @param {number[]} ids
 * @param {Status} status
 * @returns {StrategyTemplateNullResponse}
 */
async function changeStrategyTemplateStatus(ids: number[], status: Status): Promise<StrategyTemplateNullResponse> {
  return await PUT<StrategyTemplateNullResponse>('/v1/template/strategy/status', {
    ids,
    status
  })
}

/**
 * 更新策略模版
 * @method PUT /v1/template/strategy/update/{id}
 * @param {number} id
 * @param {UpdateStrategyTemplateRequest} params
 * @returns {StrategyTemplateNullResponse}
 */
async function updateStrategyTemplate(
  id: number,
  params: UpdateStrategyTemplateRequest
): Promise<StrategyTemplateNullResponse> {
  return await PUT<StrategyTemplateNullResponse>(`/v1/template/strategy/update/${id}`, params)
}

/**
 * 模板校验（返回校验成功的数据或者错误明细）
 * POST /v1/template/annotations/validate
 */
async function validateAnnotationTemplate(
  params: ValidateAnnotationTemplateRequest
): Promise<ValidateAnnotationTemplateResponse> {
  return await POST<ValidateAnnotationTemplateResponse>('/v1/template/annotations/validate', params)
}

export {
  createStrategyTemplate,
  deleteStrategyTemplate,
  getStrategyTemplate,
  getStrategyTemplateList,
  changeStrategyTemplateStatus,
  updateStrategyTemplate,
  validateAnnotationTemplate
}
