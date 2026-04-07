export interface CPUCoreItem {
  id?: number
  hardwareThreads?: number
  logicalProcessors?: number[]
}

export interface CPUProcessorItem {
  id?: number
  vendor?: string
  model?: string
  totalCores?: number
  totalHardwareThreads?: number
  capabilities?: string[]
  cores?: CPUCoreItem[]
}

export interface CPUInfo {
  totalCores?: number
  totalHardwareThreads?: number
  processors?: CPUProcessorItem[]
}

export interface MemoryInfo {
  totalPhysicalBytes?: string
  totalUsableBytes?: string
  supportedPageSizes?: string[]
  usedBytes?: string
  freeBytes?: string
  sharedBytes?: string
  buffCacheBytes?: string
  availableBytes?: string
  swapTotalBytes?: string
  swapUsedBytes?: string
  swapFreeBytes?: string
}

export interface DiskMountItem {
  mountPoint?: string
  fsType?: string
  totalBytes?: string
  usedBytes?: string
  freeBytes?: string
  freeRate?: number
}

export interface DiskInfoItem {
  name?: string
  type?: string
  sizeBytes?: string
  vendor?: string
  model?: string
  serialNumber?: string
  wwn?: string
  mounts?: DiskMountItem[]
}

export interface NetworkInfo {
  localIp?: string
  outboundIp?: string
  cidr?: string
  dnsServers?: string[]
  totalRxBytes?: string
  totalTxBytes?: string
  nics?: string[]
}

export interface HostInfo {
  hostName?: string
  machineUuid?: string
}

export interface SystemInfo {
  arch?: string
  os?: string
  version?: string
  kernel?: string
}

export interface MachineInfoItem {
  cpu?: CPUInfo
  memory?: MemoryInfo
  disks?: DiskInfoItem[]
  network?: NetworkInfo
  host?: HostInfo
  system?: SystemInfo
}

export interface ClusterMachineInfoListParams {
  page?: number
  pageSize?: number
}

export interface ClusterMachineInfoListResponse {
  machines?: MachineInfoItem[]
  total?: string
  page?: number
  pageSize?: number
}

export interface ReportMachineInfosParams {
  machines?: MachineInfoItem[]
}
