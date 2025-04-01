import { MenuType, Status } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { MenuItem } from '../model-types'
import request from '../request'

/**
 * 获取菜单树
 * @param params 树形菜单请求参数
 * @returns 树形菜单响应
 */
export function getTreeMenu(params: TreeMenuRequest): Promise<TreeMenuReply> {
  return request.GET<TreeMenuReply>('/v1/admin/menu/tree', params)
}

/**
 * 批量创建菜单
 * @param params 批量创建菜单请求参数
 * @returns 批量创建菜单响应
 */
export function batchCreateMenu(params: BatchCreateMenuRequest): Promise<BatchCreateMenuReply> {
  return request.POST<BatchCreateMenuReply>('/v1/menu/batch/create', params)
}

/**
 * 创建菜单
 * @param params 创建菜单请求参数
 * @returns 批量创建菜单响应
 */
export function createMenu(params: CreateMenuRequest): Promise<BatchCreateMenuReply> {
  return request.POST<CreateMenuReply>('/v1/menu/create', params)
}

/**
 * 更新菜单
 * @param params 更新菜单请求参数
 * @returns 更新菜单响应
 */
export function updateMenu(params: UpdateMenuRequest): Promise<UpdateMenuReply> {
  return request.PUT<UpdateMenuReply>(`/v1/menu/update/${params.id}`, params.data)
}

/**
 * 删除菜单
 * @param params 删除菜单请求参数
 * @returns 删除菜单响应
 */
export function deleteMenu(params: DeleteMenuRequest): Promise<DeleteMenuReply> {
  return request.DELETE<DeleteMenuReply>(`/v1/menu/delete/${params.id}`)
}

/**
 * 通过ID获取菜单
 * @param params 获取菜单请求参数
 * @returns 获取菜单响应
 */
export function getMenu(params: GetMenuRequest): Promise<GetMenuReply> {
  return request.GET<GetMenuReply>(`/v1/menu/get/${params.id}`)
}

/**
 * 获取菜单分页列表
 * @param params 分页列表请求参数
 * @returns 分页列表响应
 */
export function getMenuListPage(params: ListMenuRequest): Promise<ListMenuReply> {
  return request.POST<ListMenuReply>('/v1/menu/page', params)
}

/**
 * 批量修改菜单状态
 * @param params 修改状态请求参数
 * @returns 修改状态响应
 */
export function batchUpdateMenuStatus(params: BatchUpdateMenuStatusRequest): Promise<BatchUpdateMenuStatusReply> {
  return request.PUT<BatchUpdateMenuStatusReply>('/v1/menu/status', params)
}

/**
 * 批量修改菜单类型
 * @param params 修改类型请求参数
 * @returns 修改类型响应
 */
export function batchUpdateMenuType(params: BatchUpdateMenuTypeRequest): Promise<BatchUpdateMenuTypeReply> {
  return request.PUT<BatchUpdateMenuTypeReply>('/v1/menu/type', params)
}

// 以下类型定义应基于实际的proto文件生成，此处仅为示例
export interface TreeMenuRequest {}

export interface TreeMenuReply {
  menuTree: MenuTree[]
}

export interface MenuTree extends MenuItem {
  children?: MenuTree[]
}

export interface BatchCreateMenuRequest {
  menus: CreateMenuRequest[]
}

export interface BatchCreateMenuReply {}
export interface CreateMenuReply {}

export interface CreateMenuRequest {
  name: string
  menuType: MenuType
  permission: string
  icon: string
  component: string
  level: number
  sort?: number
  path: string
  enName: string
  parentId?: number
  status: Status
}

export interface UpdateMenuRequest {
  id: number
  data: CreateMenuRequest
}

export interface UpdateMenuReply {}

export interface DeleteMenuRequest {
  id: number
}

export interface DeleteMenuReply {}

export interface GetMenuRequest {
  id: number
}

export interface GetMenuReply {
  menu: MenuItem
}

export interface ListMenuRequest {
  pagination: PaginationReq
  keyword: string
  status?: Status
  menuType?: MenuType
}

export interface ListMenuReply {
  list: MenuItem[]
  pagination: PaginationReply
}

export interface BatchUpdateMenuTypeRequest {
  ids: number[]
  type: MenuType
}

export interface BatchUpdateMenuTypeReply {}

export interface BatchUpdateMenuStatusRequest {
  ids: number[]
  status: Status
}

export interface BatchUpdateMenuStatusReply {}
