import { UserItem } from '../authorization/user'
import { Pagination, PaginationResponse, Status } from '../global'

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
  logo?: string
  status?: number
}

export interface TeamListRequest {
  pagination: Pagination
  keyword?: string
  status?: number
  creatorId?: number
  leaderId?: number
}

export interface TeamItemResponse extends PaginationResponse<TeamItemType> {}

export interface MyTeam {
  list?: TeamItemType[]
}

export interface TeamMemberItem {
  userId: number
  id: number
  roles?: number[]
  status: Status
  createdAt: string
  updatedAt: string
  user?: UserItem
}

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
  leader?: UserItem
  creator?: UserItem
  admin?: TeamMemberItem[]
}
