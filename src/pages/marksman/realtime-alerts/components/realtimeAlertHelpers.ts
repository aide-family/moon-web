import type {
  AlertEventItem,
  AlertPageFilter,
  ListRealtimeAlertParams,
} from '@/api/marksman/alert'

/** 告警状态与前端展示映射（后端 status 为数字，此处仅做展示用） */
export const ALERT_STATUS_MAP: Record<number, { key: string; color: string }> =
  {
    0: { key: 'realtimeAlert.filter.status.firing', color: 'error' },
    1: { key: 'realtimeAlert.filter.status.intervened', color: 'processing' },
    2: { key: 'realtimeAlert.filter.status.recovered', color: 'success' },
    3: { key: 'realtimeAlert.filter.status.suppressed', color: 'default' },
  }

export const defaultListParams: ListRealtimeAlertParams = {
  page: 1,
  pageSize: 10,
  status: undefined,
  startAtUnix: undefined,
  endAtUnix: undefined,
}

const MOCK_LEVEL_NAMES = ['P0', 'P1', 'P2', 'P3', 'Warning', 'Critical', 'Info']
const MOCK_SUMMARIES = [
  'CPU 使用率超过阈值',
  '内存使用率告警',
  '磁盘空间不足',
  '接口响应时间过长',
  '服务实例不可用',
  '数据库连接数过高',
  '请求 QPS 超限',
  '错误率上升',
  'Pod 重启频繁',
  '网络延迟异常',
]

/** 生成模拟实时告警数据（接口无数据时用于页面效果预览） */
export function getMockRealtimeAlerts(count: number): AlertEventItem[] {
  const items: AlertEventItem[] = []
  const now = Date.now()
  for (let i = 1; i <= count; i++) {
    const status = ((i - 1) % 4) as 0 | 1 | 2 | 3
    const firedAt = new Date(now - (count - i) * 60 * 60 * 1000).toISOString()
    items.push({
      uid: `mock-alert-${i}`,
      strategyUid: `strategy-${(i % 5) + 1}`,
      levelUid: `level-${(i % 3) + 1}`,
      levelName: MOCK_LEVEL_NAMES[i % MOCK_LEVEL_NAMES.length],
      summary: MOCK_SUMMARIES[i % MOCK_SUMMARIES.length] + ` #${i}`,
      description: `模拟告警描述：第 ${i} 条记录，用于查看表格与分页效果。`,
      firedAt,
      value: Math.round(80 + Math.random() * 20 * 10) / 10,
      status,
      intervenedAt:
        status >= 1
          ? new Date(now - (count - i) * 30 * 60 * 1000).toISOString()
          : undefined,
      recoveredAt:
        status >= 2
          ? new Date(now - (count - i) * 15 * 60 * 1000).toISOString()
          : undefined,
      suppressUntilAt:
        status === 3
          ? new Date(now + 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      createdAt: firedAt,
      updatedAt: firedAt,
    })
  }
  return items
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
