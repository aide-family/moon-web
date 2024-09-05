import request from '@/api/request'
import { DefaultOptionType } from 'antd/es/select'
import { Status } from '../global'
import { CreateDictNullResponse, CreateDictRequest, DictListParams, DictListResponse, DictType } from './types'

const { POST } = request

/**
 * 创建字典
 * @method: POST /v1/dict/create
 * @param {CreateDictRequest} params
 * @returns {CreateDictNullResponse}
 */
async function createDict(params: CreateDictRequest): Promise<CreateDictNullResponse> {
  return await POST<CreateDictNullResponse>('/v1/dict/create', params)
}

/**
 * 字典列表
 * @method: post /v1/dict/list
 * @param {DictListParams} params
 * @returns {DictListResponse}
 */
async function dictList(params: DictListParams): Promise<DictListResponse> {
  return await POST<DictListResponse>('/v1/dict/list', params)
}

/**
 * 根据字典分类获取字典列表
 * @param dictType
 * @returns
 */
export const featchDictListByCrategory = (dictType: DictType) => {
  return async (keyword: string) => {
    return dictList({
      pagination: { pageNum: 1, pageSize: 999 },
      keyword,
      dictType: dictType,
      languageCode: 'zh-CN'
    }).then((resp) => {
      return resp.list.map((item) => {
        return {
          label: item.name,
          value: item.id,
          disabled: item.status != Status.ENABLE
        } as DefaultOptionType
      })
    })
  }
}

export { createDict, dictList }
