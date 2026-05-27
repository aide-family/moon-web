import type {
  HistoryAlertExportTaskItem,
  HistoryAlertExportTaskEvent,
} from '@/api/marksman/alert'
import { HistoryAlertExportTaskStatus } from '@/api/marksman/alert/types'
import type { HistoryFilterFormValues } from './types'

export type { HistoryFilterFormValues }

const EXPORT_TASK_STATUS_STRING_MAP: Record<string, HistoryAlertExportTaskStatus> =
  {
    HISTORY_ALERT_EXPORT_TASK_STATUS_UNKNOWN:
      HistoryAlertExportTaskStatus.UNKNOWN,
    HISTORY_ALERT_EXPORT_TASK_STATUS_PENDING:
      HistoryAlertExportTaskStatus.PENDING,
    HISTORY_ALERT_EXPORT_TASK_STATUS_RUNNING:
      HistoryAlertExportTaskStatus.RUNNING,
    HISTORY_ALERT_EXPORT_TASK_STATUS_COMPLETED:
      HistoryAlertExportTaskStatus.COMPLETED,
    HISTORY_ALERT_EXPORT_TASK_STATUS_FAILED:
      HistoryAlertExportTaskStatus.FAILED,
    HISTORY_ALERT_EXPORT_TASK_STATUS_CANCELLED:
      HistoryAlertExportTaskStatus.CANCELLED,
  }

/** Backend protojson returns enum as string; SSE uses numeric status. */
export function normalizeExportTaskStatus(
  status?: HistoryAlertExportTaskStatus | number | string,
): HistoryAlertExportTaskStatus {
  if (status == null || status === '') {
    return HistoryAlertExportTaskStatus.UNKNOWN
  }
  if (typeof status === 'number') {
    return status as HistoryAlertExportTaskStatus
  }
  if (typeof status === 'string') {
    const mapped = EXPORT_TASK_STATUS_STRING_MAP[status]
    if (mapped != null) return mapped
    const parsed = Number(status)
    if (!Number.isNaN(parsed)) {
      return parsed as HistoryAlertExportTaskStatus
    }
  }
  return HistoryAlertExportTaskStatus.UNKNOWN
}

export function normalizeExportTaskItem(
  item: HistoryAlertExportTaskItem,
): HistoryAlertExportTaskItem {
  return {
    ...item,
    uid: item.uid != null ? String(item.uid) : undefined,
    status: normalizeExportTaskStatus(item.status),
    totalRows: item.totalRows != null ? String(item.totalRows) : undefined,
    processedRows:
      item.processedRows != null ? String(item.processedRows) : undefined,
  }
}

export function buildExportFilter(
  values: HistoryFilterFormValues,
): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    keyword: values.keyword?.trim() || undefined,
    status: values.status,
    strategyGroupUids: values.strategyGroupUids?.length
      ? values.strategyGroupUids
      : undefined,
    levelUids: values.levelUids?.length ? values.levelUids : undefined,
    strategyUids: values.strategyUids?.length ? values.strategyUids : undefined,
    datasourceUids: values.datasourceUids?.length
      ? values.datasourceUids
      : undefined,
  }
  const range = values.timeRange
  if (range?.[0] && range?.[1]) {
    filter.startAtUnix = String(range[0].unix())
    filter.endAtUnix = String(range[1].unix())
  }
  return filter
}

export function isExportTaskActive(
  status?: HistoryAlertExportTaskStatus | number | string,
): boolean {
  const normalized = normalizeExportTaskStatus(status)
  return (
    normalized === HistoryAlertExportTaskStatus.PENDING ||
    normalized === HistoryAlertExportTaskStatus.RUNNING
  )
}

export function isExportTaskCompleted(
  status?: HistoryAlertExportTaskStatus | number | string,
): boolean {
  return (
    normalizeExportTaskStatus(status) ===
    HistoryAlertExportTaskStatus.COMPLETED
  )
}

export function isExportTaskFailed(
  status?: HistoryAlertExportTaskStatus | number | string,
): boolean {
  const normalized = normalizeExportTaskStatus(status)
  return (
    normalized === HistoryAlertExportTaskStatus.FAILED ||
    normalized === HistoryAlertExportTaskStatus.CANCELLED
  )
}

export function getExportTaskDetail(record: HistoryAlertExportTaskItem): string {
  const status = normalizeExportTaskStatus(record.status)
  if (status === HistoryAlertExportTaskStatus.COMPLETED) {
    return record.fileName?.trim() || '-'
  }
  if (isExportTaskFailed(status)) {
    return record.errorMessage?.trim() || '-'
  }
  return '-'
}

export function mergeExportTaskEvent(
  items: HistoryAlertExportTaskItem[],
  event: HistoryAlertExportTaskEvent,
): HistoryAlertExportTaskItem[] {
  const nextItem = normalizeExportTaskItem({
    uid: String(event.uid),
    status: event.status,
    totalRows: String(event.totalRows ?? 0),
    processedRows: String(event.processedRows ?? 0),
    fileName: event.fileName,
    errorMessage: event.errorMessage,
    completedAt: event.completedAt,
  })
  const index = items.findIndex((item) => item.uid === nextItem.uid)
  if (index >= 0) {
    const merged = [...items]
    merged[index] = { ...merged[index], ...nextItem }
    return merged
  }
  return [nextItem, ...items]
}

export const EXPORT_TASK_STATUS_LABEL_KEYS: Record<
  HistoryAlertExportTaskStatus,
  string
> = {
  [HistoryAlertExportTaskStatus.UNKNOWN]:
    'historyAlert.exportTask.status.inProgress',
  [HistoryAlertExportTaskStatus.PENDING]:
    'historyAlert.exportTask.status.inProgress',
  [HistoryAlertExportTaskStatus.RUNNING]:
    'historyAlert.exportTask.status.inProgress',
  [HistoryAlertExportTaskStatus.COMPLETED]:
    'historyAlert.exportTask.status.success',
  [HistoryAlertExportTaskStatus.FAILED]:
    'historyAlert.exportTask.status.failed',
  [HistoryAlertExportTaskStatus.CANCELLED]:
    'historyAlert.exportTask.status.failed',
}

export const EXPORT_TASK_STATUS_COLORS: Record<
  HistoryAlertExportTaskStatus,
  string
> = {
  [HistoryAlertExportTaskStatus.UNKNOWN]: 'processing',
  [HistoryAlertExportTaskStatus.PENDING]: 'processing',
  [HistoryAlertExportTaskStatus.RUNNING]: 'processing',
  [HistoryAlertExportTaskStatus.COMPLETED]: 'success',
  [HistoryAlertExportTaskStatus.FAILED]: 'error',
  [HistoryAlertExportTaskStatus.CANCELLED]: 'error',
}
