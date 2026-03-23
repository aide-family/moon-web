import type {
  AlertPageFilter,
  ListRealtimeAlertParams,
} from '@/api/marksman/alert'
import { AlertStatus } from '@/api/common/types'

/** 告警状态与前端展示映射（后端 status 为数字，此处仅做展示用） */
export const ALERT_STATUS_MAP: Record<AlertStatus, { key: string; color: string }> =
  {
    [AlertStatus.ALERT_STATUS_UNKNOWN]: { key: 'realtimeAlert.filter.status.unknown', color: 'default' },
    [AlertStatus.ALERT_EVENT_STATUS_FIRING]: { key: 'realtimeAlert.filter.status.firing', color: 'error' },
    [AlertStatus.ALERT_EVENT_STATUS_RECOVERED]: { key: 'realtimeAlert.filter.status.recovered', color: 'success' },
    [AlertStatus.ALERT_EVENT_STATUS_RECOVERED_BY_MANUAL]: { key: 'realtimeAlert.filter.status.recoveredByManual', color: 'processing' },
  }

export const defaultListParams: ListRealtimeAlertParams = {
  page: 1,
  pageSize: 50,
}


export function buildCreateAlertPageFilter(values: {
  filterStrategyGroupUids?: string[]
  filterLevelUids?: string[]
  filterStrategyUids?: string[]
}): AlertPageFilter | undefined {
  const strategyGroupUids = (values.filterStrategyGroupUids ?? []).filter(
    Boolean,
  )
  const levelUids = (values.filterLevelUids ?? []).filter(Boolean)
  const strategyUids = (values.filterStrategyUids ?? []).filter(Boolean)
  if (
    strategyGroupUids.length === 0 &&
    levelUids.length === 0 &&
    strategyUids.length === 0
  ) {
    return undefined
  }
  const out: AlertPageFilter = {}
  if (strategyGroupUids.length > 0) out.strategyGroupUids = strategyGroupUids
  if (levelUids.length > 0) out.levelUids = levelUids
  if (strategyUids.length > 0) out.strategyUids = strategyUids
  return out
}
