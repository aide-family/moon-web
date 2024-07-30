import { CreateTeamRequest, MyTeam, TeamItemResponse, TeamItemType, TeamListRequest, UpdateTeamRequest } from './types'
import request, { NullObject } from '../request'
import { Status } from '../global'

const { POST, PUT } = request

/**
 * 创建团队
 * POST /v1/team
 */
const createTeamApi = (params: CreateTeamRequest) => {
  return POST<NullObject>('/v1/team', params)
}

/**
 * 更新团队
 * PUT /v1/team/{id}
 */
const updateTeamApi = (params: UpdateTeamRequest) => {
  return PUT<NullObject>(`/v1/team/${params.id}`, params)
}

/**
 * 获取团队详情
 * GET /v1/team/{id}
 */
const getTeamApi = (id: number) => {
  return request.GET<{ team: TeamItemType }>(`/v1/team/${id}`)
}

/**
 * 获取团队列表
 * POST /v1/team/list
 */
const getTeamListApi = (params: TeamListRequest) => {
  return request.POST<TeamItemResponse>('/v1/team/list', params)
}

/**
 * 修改团队状态
 * PUT /v1/team/{id}/status
 */
const setTeamStatusApi = (id: number, status: Status) => {
  return PUT<NullObject>(`/v1/team/${id}/status`, { status })
}

/**
 * 我的团队， 查看当前用户的团队列表
 * GET /v1/my/team
 */
const getMyTeamApi = () => {
  return request.GET<MyTeam>('/v1/my/team')
}

export default {
  createTeamApi,
  updateTeamApi,
  getTeamApi,
  getTeamListApi,
  setTeamStatusApi,
  getMyTeamApi
}
