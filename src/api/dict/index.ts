import request from '@/api/request'
import { 
  CreateDictRequest,
  CreateDictNullResponse
 } from './types'
 
const { POST } = request

/**
 * 创建字典
 * @method: POST /v1/dict/create
 * @param {CreateDictRequest} params
 * @returns {CreateDictNullResponse}
 */

async function createDict(
  params: CreateDictRequest
): Promise<CreateDictNullResponse> {
  return await POST<CreateDictNullResponse>(
    '/v1/dict/create',
    params
  )
}

export {
  createDict
}
