import { Status } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { TeamConfigItem, TeamItem, TeamMemberItem } from '../model-types'
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
  return request.PUT<UpdateTeamStatusReply>(`/v1/team/status`, params)
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
  return request.POST<AddTeamMemberReply>(`/v1/team/member/add`, params)
}

/**
 * 移除团队成员
 * @method: delete /v1/team/{id}/member/{userId}
 * @param {RemoveTeamMemberRequest} params
 * @returns {RemoveTeamMemberReply}
 */
export function removeTeamMember(params: RemoveTeamMemberRequest): Promise<RemoveTeamMemberReply> {
  return request.DELETE<RemoveTeamMemberReply>(`/v1/team/member`, params)
}

/**
 * 设置成管理员
 * @method: put /v1/team/{id}/member/set/admin
 * @param {SetTeamAdminRequest} params
 * @returns {SetTeamAdminReply}
 */
export function setTeamAdmin(params: SetTeamAdminRequest): Promise<SetTeamAdminReply> {
  return request.PUT<SetTeamAdminReply>(`/v1/team/member/set/admin`, params)
}

/**
 * 移除团队管理员
 * @method: delete /v1/team/{id}/member/remove/admin
 * @param {RemoveTeamAdminRequest} params
 * @returns {RemoveTeamAdminReply}
 */
export function removeTeamAdmin(params: RemoveTeamAdminRequest): Promise<RemoveTeamAdminReply> {
  return request.DELETE<RemoveTeamAdminReply>(`/v1/team/member/remove/admin`, params)
}

/**
 * 设置成员角色
 * @method: put /v1/team/{id}/member/{userId}/role
 * @param {SetMemberRoleRequest} params
 * @returns {SetMemberRoleReply}
 */
export function setMemberRole(params: SetMemberRoleRequest): Promise<SetMemberRoleReply> {
  return request.PUT<SetMemberRoleReply>(`/v1/team/member/role`, params)
}

/**
 * 获取团队成员列表
 * @method: post /v1/team/{id}/member/list
 * @param {ListTeamMemberRequest} params
 * @returns {ListTeamMemberReply}
 */
export function listTeamMember(params: ListTeamMemberRequest): Promise<ListTeamMemberReply> {
  return request.POST<ListTeamMemberReply>(`/v1/team/member/list`, params)
}

/**
 * 移交超级管理员
 * @method: put /v1/team/{id}/leader/transfer
 * @param {TransferTeamLeaderRequest} params
 * @returns {TransferTeamLeaderReply}
 */
export function transferTeamLeader(params: TransferTeamLeaderRequest): Promise<TransferTeamLeaderReply> {
  return request.PUT<TransferTeamLeaderReply>(`/v1/team/leader/transfer`, params)
}

/**
 * 更改团队成员状态
 * @method: put /v1/team/member/status
 */
export function batchUpdateTeamMembersStatus(params: BatchUpdateTeamMemberStatusRequest): Promise<null> {
  return request.PUT(`/v1/team/member/status`, params)
}

/**
 * 团队成员详情
 * @method: get /v1/team/member/detail/{id}
 */
export function getTeamMemberDetail(params: GetTeamMemberDetailRequest): Promise<GetTeamMemberDetailReply> {
  return request.GET<GetTeamMemberDetailReply>(`/v1/team/member/detail/${params.id}`)
}

/**
 * 获取团队配置
 * @method: get /v1/team/config
 */
export function getTeamConfig(): Promise<TeamConfigItem> {
  return request.GET<TeamConfigItem>('/v1/team/get/config')
}

/**
 * 更新团队配置
 * @method: put /v1/team/config
 */
export function updateTeamConfig(params: TeamConfigItem): Promise<null> {
  return request.PUT('/v1/team/set/config', params)
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

export interface CreateTeamReply {
  detail?: TeamItem
}

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
  status: Status
}

export interface UpdateTeamStatusReply {}

export interface MyTeamReply {
  list: TeamItem[]
}

export interface AddTeamMemberRequest {
  members: MemberItem[]
}

export interface AddTeamMemberReply {}

export interface MemberItem {
  memberID: number
  role?: number
  roles?: number[]
}

export interface RemoveTeamMemberRequest {
  memberID: number
}

export interface RemoveTeamMemberReply {}

export interface SetTeamAdminRequest {
  memberIds: number[]
}

export interface SetTeamAdminReply {}

export interface RemoveTeamAdminRequest {
  memberIds: number[]
}

export interface RemoveTeamAdminReply {}

export interface SetMemberRoleRequest {
  memberID: number
  roles: number[]
}

export interface SetMemberRoleReply {}

export interface ListTeamMemberRequest {
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
  memberID: number
}

export interface TransferTeamLeaderReply {}

export interface BatchUpdateTeamMemberStatusRequest {
  status: Status
  memberIds: number[]
}

export interface GetTeamMemberDetailRequest {
  id: number
}

export interface GetTeamMemberDetailReply {
  detail: TeamMemberItem
}
