import { Pagination, PaginationResponse } from '../global'

export interface CreateTeamRequest {
  name: string
  remark?: string
  logo?: string
  status?: number
  leaderId?: number
  adminIds?: number[]
}

export interface UpdateTeamRequest {
  id: number
  name: string
  remark?: string
}

export interface TeamListRequest {
  pagination: Pagination
  keyword?: string
  status?: number
  creatorId?: number
  leaderId?: number
}

export interface TeamItemResponse extends PaginationResponse<TeamItemType> {}

export interface TeamItemType {
  id: number
  name: string
  remark?: string
  logo?: string
  status?: number
  leaderId?: number
  adminIds?: number[]
  createTime?: string
  updateTime?: string
}
