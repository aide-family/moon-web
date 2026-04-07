import { http } from '../../index'
import type {
  ClusterMachineInfoListParams,
  ClusterMachineInfoListResponse,
  MachineInfoItem,
  ReportMachineInfosParams,
} from './types'

/** 获取本机信息 GET /v1/machine-info */
export const getMachineInfo = (): Promise<MachineInfoItem> => {
  return http.get<MachineInfoItem>('/machine-info')
}

/** 上报机器信息 POST /v1/machine-info/report */
export const reportMachineInfos = (
  params?: ReportMachineInfosParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    '/machine-info/report',
    params as Record<string, unknown>,
  )
}

/** 获取集群机器列表 GET /v1/machine-infos */
export const getClusterMachineInfoList = (
  params?: ClusterMachineInfoListParams,
): Promise<ClusterMachineInfoListResponse> => {
  return http.get<ClusterMachineInfoListResponse>(
    '/machine-infos',
    params as unknown as Record<string, unknown>,
  )
}

export type {
  CPUCoreItem,
  CPUProcessorItem,
  CPUInfo,
  MemoryInfo,
  DiskMountItem,
  DiskInfoItem,
  NetworkInfo,
  HostInfo,
  SystemInfo,
  MachineInfoItem,
  ClusterMachineInfoListParams,
  ClusterMachineInfoListResponse,
  ReportMachineInfosParams,
} from './types'
