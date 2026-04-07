import { http } from '../../index'
import type {
  ApproveSSHCommandAuditParams,
  ApproveSSHCommandAuditReply,
  ExecuteSSHCommandParams,
  ExecuteSSHCommandReply,
  RejectSSHCommandAuditParams,
  RejectSSHCommandAuditReply,
  SSHCommandAuditItem,
  SSHCommandAuditListParams,
  SSHCommandAuditListResponse,
  SSHCommandItem,
  SSHCommandListParams,
  SSHCommandListResponse,
  SubmitCreateSSHCommandParams,
  SubmitSSHCommandAuditReply,
  SubmitUpdateSSHCommandParams,
} from './types'

/** 获取 SSH 命令列表 GET /v1/ssh-commands */
export const getSSHCommandList = (
  params?: SSHCommandListParams,
): Promise<SSHCommandListResponse> => {
  return http.get<SSHCommandListResponse>(
    '/ssh-commands',
    params as unknown as Record<string, unknown>,
  )
}

/** 获取 SSH 命令详情 GET /v1/ssh-commands/{uid} */
export const getSSHCommandDetail = (uid: string): Promise<SSHCommandItem> => {
  return http.get<SSHCommandItem>(`/ssh-commands/${uid}`)
}

/** 提交新增命令审核 POST /v1/ssh-commands/submissions */
export const submitCreateSSHCommand = (
  params?: SubmitCreateSSHCommandParams,
): Promise<SubmitSSHCommandAuditReply> => {
  return http.post<SubmitSSHCommandAuditReply>(
    '/ssh-commands/submissions',
    params as Record<string, unknown>,
  )
}

/** 提交更新命令审核 POST /v1/ssh-commands/{commandUid}/submissions */
export const submitUpdateSSHCommand = (
  commandUid: string,
  params?: SubmitUpdateSSHCommandParams,
): Promise<SubmitSSHCommandAuditReply> => {
  return http.post<SubmitSSHCommandAuditReply>(
    `/ssh-commands/${commandUid}/submissions`,
    params as Record<string, unknown>,
  )
}

/** 执行 SSH 命令 POST /v1/ssh-commands/{commandUid}/execute */
export const executeSSHCommand = (
  commandUid: string,
  params?: ExecuteSSHCommandParams,
): Promise<ExecuteSSHCommandReply> => {
  return http.post<ExecuteSSHCommandReply>(
    `/ssh-commands/${commandUid}/execute`,
    params as Record<string, unknown>,
  )
}

/** 获取审核列表 GET /v1/ssh-command-audits */
export const getSSHCommandAuditList = (
  params?: SSHCommandAuditListParams,
): Promise<SSHCommandAuditListResponse> => {
  return http.get<SSHCommandAuditListResponse>(
    '/ssh-command-audits',
    params as unknown as Record<string, unknown>,
  )
}

/** 获取审核详情 GET /v1/ssh-command-audits/{uid} */
export const getSSHCommandAuditDetail = (
  uid: string,
): Promise<SSHCommandAuditItem> => {
  return http.get<SSHCommandAuditItem>(`/ssh-command-audits/${uid}`)
}

/** 审核通过 POST /v1/ssh-command-audits/{uid}/approve */
export const approveSSHCommandAudit = (
  uid: string,
  params?: ApproveSSHCommandAuditParams,
): Promise<ApproveSSHCommandAuditReply> => {
  return http.post<ApproveSSHCommandAuditReply>(
    `/ssh-command-audits/${uid}/approve`,
    params as Record<string, unknown>,
  )
}

/** 审核拒绝 POST /v1/ssh-command-audits/{uid}/reject */
export const rejectSSHCommandAudit = (
  uid: string,
  params?: RejectSSHCommandAuditParams,
): Promise<RejectSSHCommandAuditReply> => {
  return http.post<RejectSSHCommandAuditReply>(
    `/ssh-command-audits/${uid}/reject`,
    params as Record<string, unknown>,
  )
}

export type {
  SSHCommandItem,
  SSHCommandAuditItem,
  SSHCommandListParams,
  SSHCommandListResponse,
  SSHCommandAuditListParams,
  SSHCommandAuditListResponse,
  SubmitCreateSSHCommandParams,
  SubmitUpdateSSHCommandParams,
  SubmitSSHCommandAuditReply,
  ApproveSSHCommandAuditParams,
  ApproveSSHCommandAuditReply,
  RejectSSHCommandAuditParams,
  RejectSSHCommandAuditReply,
  ExecuteSSHCommandParams,
  ExecuteSSHCommandReply,
} from './types'
export { SSHCommandAuditStatus } from './types'
