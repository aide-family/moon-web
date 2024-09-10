import { PaginationReply, PaginationReq } from '../global'
import { TeamItem, TeamMemberItem } from '../model-types'
import request from '../request'

/**
 * 创建团队
 * @method: post /v1/team
 * @param {CreateTeamRequest} params
 * @returns {CreateTeamReply}
 */
export function createTeam(params: CreateTeamRequest): Promise<CreateTeamReply> {
  return request.POST<CreateTeamReply>('/v1/team', params)
}

/**
 * 更新团队
 * @method: put /v1/team/{id}
 * @param {UpdateTeamRequest} params
 * @returns {UpdateTeamReply}
 */
export function updateTeam(params: UpdateTeamRequest): Promise<UpdateTeamReply> {
  return request.PUT<UpdateTeamReply>(`/v1/team/${params.id}`, params)
}

/**
 * 获取团队详情
 * @method: get /v1/team/{id}
 * @param {GetTeamRequest} params
 * @returns {GetTeamReply}
 */
export function getTeam(params: GetTeamRequest): Promise<GetTeamReply> {
  return request.GET<GetTeamReply>(`/v1/team/${params.id}`)
}

/**
 * 获取团队列表
 * @method: post /v1/team/list
 * @param {ListTeamRequest} params
 * @returns {ListTeamReply}
 */
export function listTeam(params: ListTeamRequest): Promise<ListTeamReply> {
  return request.POST<ListTeamReply>('/v1/team/list', params)
}

/**
 * 修改团队状态
 * @method: put /v1/team/{id}/status
 * @param {UpdateTeamStatusRequest} params
 * @returns {UpdateTeamStatusReply}
 */
export function updateTeamStatus(params: UpdateTeamStatusRequest): Promise<UpdateTeamStatusReply> {
  return request.PUT<UpdateTeamStatusReply>(`/v1/team/${params.id}/status`, params)
}

/**
 * 我的团队
 * @method: get /v1/my/team
 * @param {MyTeamRequest} params
 * @returns {MyTeamReply}
 */
export function myTeam(): Promise<MyTeamReply> {
  return request.GET<MyTeamReply>('/v1/my/team')
}

/**
 * 添加团队成员
 * @method: post /v1/team/{id}/member/add
 * @param {AddTeamMemberRequest} params
 * @returns {AddTeamMemberReply}
 */
export function addTeamMember(params: AddTeamMemberRequest): Promise<AddTeamMemberReply> {
  return request.POST<AddTeamMemberReply>(`/v1/team/${params.id}/member/add`, params)
}

/**
 * 移除团队成员
 * @method: delete /v1/team/{id}/member/{userId}
 * @param {RemoveTeamMemberRequest} params
 * @returns {RemoveTeamMemberReply}
 */
export function removeTeamMember(params: RemoveTeamMemberRequest): Promise<RemoveTeamMemberReply> {
  return request.DELETE<RemoveTeamMemberReply>(`/v1/team/${params.id}/member/${params.userId}`)
}

/**
 * 设置成管理员
 * @method: put /v1/team/{id}/member/set/admin
 * @param {SetTeamAdminRequest} params
 * @returns {SetTeamAdminReply}
 */
export function setTeamAdmin(params: SetTeamAdminRequest): Promise<SetTeamAdminReply> {
  return request.PUT<SetTeamAdminReply>(`/v1/team/${params.id}/member/set/admin`, params)
}

/**
 * 移除团队管理员
 * @method: delete /v1/team/{id}/member/remove/admin
 * @param {RemoveTeamAdminRequest} params
 * @returns {RemoveTeamAdminReply}
 */
export function removeTeamAdmin(params: RemoveTeamAdminRequest): Promise<RemoveTeamAdminReply> {
  return request.DELETE<RemoveTeamAdminReply>(`/v1/team/${params.id}/member/remove/admin`, params)
}

/**
 * 设置成员角色
 * @method: put /v1/team/{id}/member/{userId}/role
 * @param {SetMemberRoleRequest} params
 * @returns {SetMemberRoleReply}
 */
export function setMemberRole(params: SetMemberRoleRequest): Promise<SetMemberRoleReply> {
  return request.PUT<SetMemberRoleReply>(`/v1/team/${params.id}/member/${params.userId}/role`, params)
}

/**
 * 获取团队成员列表
 * @method: post /v1/team/{id}/member/list
 * @param {ListTeamMemberRequest} params
 * @returns {ListTeamMemberReply}
 */
export function listTeamMember(params: ListTeamMemberRequest): Promise<ListTeamMemberReply> {
  return request.POST<ListTeamMemberReply>(`/v1/team/${params.id}/member/list`, params)
}

/**
 * 移交超级管理员
 * @method: put /v1/team/{id}/leader/transfer
 * @param {TransferTeamLeaderRequest} params
 * @returns {TransferTeamLeaderReply}
 */
export function transferTeamLeader(params: TransferTeamLeaderRequest): Promise<TransferTeamLeaderReply> {
  return request.PUT<TransferTeamLeaderReply>(`/v1/team/${params.id}/leader/transfer`, params)
}

// 示例类型定义
export interface CreateTeamRequest {
  name: string
  remark: string
  logo: string
  status: number
  leaderId?: number
  adminIds: number[]
}

export interface CreateTeamReply {}

export interface UpdateTeamRequest {
  id: number
  name: string
  remark: string
  logo: string
  status: number
}

export interface UpdateTeamReply {}

export interface GetTeamRequest {
  id: number
}

export interface GetTeamReply {
  detail: TeamItem
}

export interface ListTeamRequest {
  keyword?: string
  pagination: PaginationReq
  status?: number
  creatorId?: number
  leaderId?: number
  ids?: number[]
}

export interface ListTeamReply {
  pagination: PaginationReply
  list: TeamItem[]
}

export interface UpdateTeamStatusRequest {
  id: number
  status: number
}

export interface UpdateTeamStatusReply {}

export interface MyTeamReply {
  list: TeamItem[]
}

export interface AddTeamMemberRequest {
  id: number
  members: MemberItem[]
}

export interface AddTeamMemberReply {}

export interface MemberItem {
  user_id: number
  role?: number
  roles?: number[]
}

export interface RemoveTeamMemberRequest {
  id: number
  userId: number
}

export interface RemoveTeamMemberReply {}

export interface SetTeamAdminRequest {
  id: number
  userIds: number[]
}

export interface SetTeamAdminReply {}

export interface RemoveTeamAdminRequest {
  id: number
  userIds: number[]
}

export interface RemoveTeamAdminReply {}

export interface SetMemberRoleRequest {
  id: number
  userId: number
  roles: number[]
}

export interface SetMemberRoleReply {}

export interface ListTeamMemberRequest {
  id: number
  keyword?: string
  pagination: PaginationReq
  gender?: number
  status?: number
  role?: number
  memberIds?: number[]
}

export interface ListTeamMemberReply {
  pagination: PaginationReply
  list: TeamMemberItem[]
}

export interface TransferTeamLeaderRequest {
  id: number
  userId: number
}

export interface TransferTeamLeaderReply {}
