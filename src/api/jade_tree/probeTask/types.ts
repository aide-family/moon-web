export enum ProbeTaskStatus {
  UNKNOWN = 'UNKNOWN',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export interface ProbeTaskItem {
  uid?: string
  type?: string
  host?: string
  port?: string
  url?: string
  name?: string
  status?: ProbeTaskStatus
  timeoutSeconds?: number
  createdAt?: string
  updatedAt?: string
}

export interface ProbeTaskListParams {
  page?: number
  pageSize?: number
}

export interface ProbeTaskListResponse {
  items?: ProbeTaskItem[]
  total?: string
  page?: number
  pageSize?: number
}

export interface CreateProbeTaskParams {
  type?: string
  host?: string
  port?: string
  url?: string
  name?: string
  status?: ProbeTaskStatus
  timeoutSeconds?: number
}

export interface UpdateProbeTaskParams {
  uid?: string
  type?: string
  host?: string
  port?: string
  url?: string
  name?: string
  timeoutSeconds?: number
}

export interface UpdateProbeTaskStatusParams {
  uid?: string
  status?: ProbeTaskStatus
}
