import request from '@/api/request'
import { 
  CreateDictRequest,
  CreateDictNullResponse,
  DictBatchUpdateStatusType,
  DictById,
  DictDetailRes,
  DictListReq,
  DictListRes,
  DictSelectReq,
  DictSelectRes,
  MyAlarmPageListResponse,
  UpdateDict,
  dictBatchDeleteType } from './types'
import { Status } from '../global'
const { POST, PUT, DELTED, GET } = request

/**
 * 创建字典
 * @method: POST /v1/dict/create
 * @param {CreateDictRequest} params
 * @returns {CreateDictNullResponse}
 */
async function createDict(
  params: CreateDictRequest
): Promise<CreateDictNullResponse> {
  return await POST<StrategyTemplateNullResponse>(
    '/v1/dict/create',
    params
  )
}

export {
  createDict
}
