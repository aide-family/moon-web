import { Status } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { SelectItem, TeamRole } from '../model-types'
import request from '../request'

/**
 * 创建角色
 * @method: post /v1/team/role
 * @param {CreateRoleRequest} params
 * @returns {CreateRoleReply}
 */
export function createRole(params: CreateRoleRequest): Promise<CreateRoleReply> {
  return request.POST<CreateRoleReply>('/v1/team/role', params)
}

/**
 * 更新角色
 * @method: put /v1/team/role/{id}
 * @param {UpdateRoleRequest} params
 * @returns {UpdateRoleReply}
 */
export function updateRole(params: UpdateRoleRequest): Promise<UpdateRoleReply> {
  return request.PUT<UpdateRoleReply>(`/v1/team/role/${params.id}`, params)
}

/**
 * 删除角色
 * @method: delete /v1/team/role/{id}
 * @param {DeleteRoleRequest} params
 * @returns {DeleteRoleReply}
 */
export function deleteRole(params: DeleteRoleRequest): Promise<DeleteRoleReply> {
  return request.DELETE<DeleteRoleReply>(`/v1/team/role/${params.id}`)
}

/**
 * 获取角色详情
 * @method: get /v1/team/role/{id}
 * @param {GetRoleRequest} params
 * @returns {GetRoleReply}
 */
export function getRole(params: GetRoleRequest): Promise<GetRoleReply> {
  return request.GET<GetRoleReply>(`/v1/team/role/${params.id}`)
}

/**
 * 获取角色列表
 * @method: post /v1/team/role/list
 * @param {ListRoleRequest} params
 * @returns {ListRoleReply}
 */
export function listRole(params: ListRoleRequest): Promise<ListRoleReply> {
  return request.POST<ListRoleReply>('/v1/team/role/list', params)
}

/**
 * 更新角色状态
 * @method: put /v1/team/role/{id}/status
 * @param {UpdateRoleStatusRequest} params
 * @returns {UpdateRoleStatusReply}
 */
export function updateRoleStatus(params: UpdateRoleStatusRequest): Promise<UpdateRoleStatusReply> {
  return request.PUT<UpdateRoleStatusReply>(`/v1/team/role/${params.id}/status`, params)
}

/**
 * 获取角色下拉列表
 * @method: post /v1/team/role/select
 * @param {ListRoleRequest} params
 * @returns {GetRoleSelectListReply}
 */
export function getRoleSelectList(params: ListRoleRequest): Promise<GetRoleSelectListReply> {
  return request.POST<GetRoleSelectListReply>('/v1/team/role/select', params)
}

// 示例类型定义
export interface CreateRoleRequest {
  name: string
  remark: string
  permissions: number[]
}

export interface CreateRoleReply {}

export interface UpdateRoleRequest {
  id: number
  data: CreateRoleRequest
}

export interface UpdateRoleReply {}

export interface DeleteRoleRequest {
  id: number
}

export interface DeleteRoleReply {}

export interface GetRoleRequest {
  id: number
}

export interface GetRoleReply {
  detail: TeamRole
}

export interface ListRoleRequest {
  keyword?: string
  pagination: PaginationReq
  status?: Status
}

export interface ListRoleReply {
  list: TeamRole[]
  pagination: PaginationReply
}

export interface UpdateRoleStatusRequest {
  id: number
  status: number
}

export interface UpdateRoleStatusReply {}

export interface GetRoleSelectListReply {
  list: SelectItem[]
}
