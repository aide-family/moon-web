import {
  Condition,
  Pagination,
  PaginationReply,
  SelectType,
  Status,
  SustainType,
} from "../global";

/**修改字典 */
export interface UpdateDict {
    id: number
    name: string
    category: number
    color: string
    remark: string
    status: number
}
/**根据Id获取数据 */
export interface DictById {
    id: number
}
/**获取字典列表参数 */
export interface DictListReq {
    page: PageReqType
    keyword?: string
    category?: number
}

/**字典列表返回数据 */
export interface DictListRes {
    list: DictListItem[]
    page: PageResType
}

/**字典列表项 */
export interface DictListItem {
    id: number
    name: string
    category: Category
    color: string
    status: Status
    remark: string
    createdAt: number
    updatedAt: number
    deletedAt: number
}

/**获取字典详情参数 */
export interface DictDetailReq {
    id: number
    isDeleted: boolean
}
/**字典详情返回数据 */
export interface DictDetailRes {
    promDict: DictListItem
}
/** 获取字典列表, 用于下拉选择*/
export interface DictSelectReq {
    isDeleted?: boolean
    page: PageReqType
    keyword?: string
    category?: number
}
/**获取字典列表, 用于下拉选择返回数据 */
export interface DictSelectRes {
    list: DictSelectItem[]
    page: PageResType
}

/**字典下拉选择项 */
export interface DictSelectItem {
    value: number
    label: string
    category: number
    color: string
    status: number
    remark: string
    isDeleted: false
}
export interface dictBatchDeleteType {
    ids: number[]
}
export interface DictBatchUpdateStatusType {
    ids: number[]
    status: Status
}

export interface CountAlarmPageRequest {
    ids: number[]
}

export interface CountAlarmPageReply {
    alarmCount: { [key: number]: number | string }
}

export interface BindMyAlarmPagesRequest {
    alarmIds: number[]
}

export interface MyAlarmPageListResponse {
    list: DictListItem[]
}
/** 创建字典空响应体 */
export interface CreateDictNullResponse {}
/** 创建字典请求体 */
export interface CreateDictRequest {
  name: string
  category: number
  color: string
  remark: string
}

