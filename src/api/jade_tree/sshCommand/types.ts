export enum SSHCommandAuditStatus {
  UNKNOWN = 'SSHCommandAuditStatus_UNKNOWN',
  PENDING = 'SSHCommandAuditStatus_PENDING',
  APPROVED = 'SSHCommandAuditStatus_APPROVED',
  REJECTED = 'SSHCommandAuditStatus_REJECTED',
}

export enum SSHCommandAuditKind {
  UNKNOWN = 'SSHCommandAuditKind_UNKNOWN',
  CREATE = 'SSHCommandAuditKind_CREATE',
  UPDATE = 'SSHCommandAuditKind_UPDATE',
}

export interface SSHCommandItem {
  uid?: string
  name?: string
  description?: string
  content?: string
  workDir?: string
  env?: Record<string, string>
  disabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SSHCommandAuditItem {
  uid?: string
  targetCommandUid?: string
  kind?: SSHCommandAuditKind
  status?: SSHCommandAuditStatus
  name?: string
  description?: string
  content?: string
  workDir?: string
  env?: Record<string, string>
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
  reviewedAt?: string
  reviewerUid?: string
}

export interface SSHCommandListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface SSHCommandListResponse {
  items?: SSHCommandItem[]
  total?: string
  page?: number
  pageSize?: number
}

export interface SSHCommandAuditListParams {
  page?: number
  pageSize?: number
  statusFilter?: SSHCommandAuditStatus
  keyword?: string
  kind?: SSHCommandAuditKind
}

export interface SSHCommandAuditListResponse {
  items?: SSHCommandAuditItem[]
  total?: string
  page?: number
  pageSize?: number
}

export interface SubmitCreateSSHCommandParams {
  name?: string
  description?: string
  content?: string
  workDir?: string
  env?: Record<string, string>
}

export interface SubmitUpdateSSHCommandParams {
  commandUid?: string
  name?: string
  description?: string
  content?: string
  workDir?: string
  env?: Record<string, string>
}

export interface SubmitSSHCommandAuditReply {
  audit?: SSHCommandAuditItem
}

export interface ApproveSSHCommandAuditParams {
  uid?: string
}

export interface ApproveSSHCommandAuditReply {
  audit?: SSHCommandAuditItem
  command?: SSHCommandItem
}

export interface RejectSSHCommandAuditParams {
  uid?: string
  reason?: string
}

export interface RejectSSHCommandAuditReply {
  audit?: SSHCommandAuditItem
}

export interface ExecuteSSHCommandParams {
  commandUid?: string
  host?: string
  port?: number
  username?: string
  password?: string
  privateKey?: string
  timeoutSeconds?: number
}

export interface ExecuteSSHCommandReply {
  stdout?: string
  stderr?: string
  exitCode?: number
}
