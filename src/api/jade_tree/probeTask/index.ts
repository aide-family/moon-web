import { http } from '../../index'
import type {
  CreateProbeTaskParams,
  ProbeTaskItem,
  ProbeTaskListParams,
  ProbeTaskListResponse,
  UpdateProbeTaskParams,
  UpdateProbeTaskStatusParams,
} from './types'

/** 获取探测任务列表 GET /v1/probe-tasks */
export const getProbeTaskList = (
  params?: ProbeTaskListParams,
): Promise<ProbeTaskListResponse> => {
  return http.get<ProbeTaskListResponse>(
    '/probe-tasks',
    params as unknown as Record<string, unknown>,
  )
}

/** 获取探测任务详情 GET /v1/probe-tasks/{uid} */
export const getProbeTaskDetail = (uid: string): Promise<ProbeTaskItem> => {
  return http.get<ProbeTaskItem>(`/probe-tasks/${uid}`)
}

/** 创建探测任务 POST /v1/probe-tasks */
export const createProbeTask = (
  params?: CreateProbeTaskParams,
): Promise<ProbeTaskItem> => {
  return http.post<ProbeTaskItem>(
    '/probe-tasks',
    params as Record<string, unknown>,
  )
}

/** 更新探测任务 PUT /v1/probe-tasks/{uid} */
export const updateProbeTask = (
  uid: string,
  params?: UpdateProbeTaskParams,
): Promise<ProbeTaskItem> => {
  return http.put<ProbeTaskItem>(
    `/probe-tasks/${uid}`,
    params as Record<string, unknown>,
  )
}

/** 更新探测任务状态 PATCH /v1/probe-tasks/{uid}/status */
export const updateProbeTaskStatus = (
  uid: string,
  params?: UpdateProbeTaskStatusParams,
): Promise<ProbeTaskItem> => {
  return http.patch<ProbeTaskItem>(
    `/probe-tasks/${uid}/status`,
    params as Record<string, unknown>,
  )
}

/** 删除探测任务 DELETE /v1/probe-tasks/{uid} */
export const deleteProbeTask = (
  uid: string,
): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/probe-tasks/${uid}`)
}

export type {
  ProbeTaskItem,
  ProbeTaskListParams,
  ProbeTaskListResponse,
  CreateProbeTaskParams,
  UpdateProbeTaskParams,
  UpdateProbeTaskStatusParams,
} from './types'
export { ProbeTaskStatus } from './types'
