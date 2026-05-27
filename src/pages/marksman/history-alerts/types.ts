export interface HistoryFilterFormValues {
  keyword?: string
  timeRange?: [import('dayjs').Dayjs, import('dayjs').Dayjs]
  status?: number
  strategyGroupUids?: string[]
  levelUids?: string[]
  strategyUids?: string[]
  datasourceUids?: string[]
}
