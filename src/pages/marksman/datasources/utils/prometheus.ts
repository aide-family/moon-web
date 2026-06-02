import type {
  PrometheusApiResponse,
  PrometheusLabelSet,
  PrometheusMatrixResult,
  PrometheusVectorResult,
} from '@/api/marksman/metricQuery/types'

/** 将标签集格式化为 Prometheus 序列名称 */
export function formatSeriesName(metric: PrometheusLabelSet): string {
  const entries = Object.entries(metric ?? {})
  if (entries.length === 0) return '{}'
  return `{${entries.map(([k, v]) => `${k}="${v}"`).join(', ')}}`
}

export interface PrometheusTableRow {
  key: string
  series: string
  timestamp: number
  value: string
  labels: PrometheusLabelSet
}

function isVectorResult(
  item: PrometheusVectorResult | PrometheusMatrixResult,
): item is PrometheusVectorResult {
  return 'value' in item
}

/** 将 Prometheus 查询结果展平为表格行 */
export function toTableRows(
  response: PrometheusApiResponse,
): PrometheusTableRow[] {
  if (response.status !== 'success' || !response.data) return []

  const { resultType, result } = response.data

  if (resultType === 'scalar' || resultType === 'string') {
    const pair = result as [number, string]
    return [
      {
        key: 'scalar',
        series: resultType,
        timestamp: pair[0],
        value: pair[1],
        labels: {},
      },
    ]
  }

  const items = result as (PrometheusVectorResult | PrometheusMatrixResult)[]
  const rows: PrometheusTableRow[] = []

  items.forEach((item, index) => {
    const series = formatSeriesName(item.metric)
    if (isVectorResult(item)) {
      rows.push({
        key: `${series}-${index}`,
        series,
        timestamp: item.value[0],
        value: item.value[1],
        labels: item.metric,
      })
      return
    }

    const values = item.values ?? []
    const latest = values[values.length - 1]
    if (!latest) return
    rows.push({
      key: `${series}-${index}`,
      series,
      timestamp: latest[0],
      value: latest[1],
      labels: item.metric,
    })
  })

  return rows
}

export interface PrometheusGraphSeries {
  name: string
  points: { time: number; value: number }[]
}

/** 将 matrix 结果转为折线图序列 */
export function toGraphSeries(
  response: PrometheusApiResponse,
): PrometheusGraphSeries[] {
  if (response.status !== 'success' || response.data?.resultType !== 'matrix') {
    return []
  }

  return (response.data.result as PrometheusMatrixResult[]).map(
    (item, index) => ({
      name: formatSeriesName(item.metric) || `series-${index}`,
      points: (item.values ?? [])
        .map(([time, value]) => ({
          time,
          value: Number.parseFloat(value),
        }))
        .filter((p) => Number.isFinite(p.value)),
    }),
  )
}

/** 收集结果中所有标签键（用于动态列） */
export function collectLabelKeys(rows: PrometheusTableRow[]): string[] {
  const keys = new Set<string>()
  rows.forEach((row) => {
    Object.keys(row.labels).forEach((k) => keys.add(k))
  })
  return Array.from(keys).sort()
}

/** 提取 Prometheus 响应中的核心 result 数据（用于 JSON 展示） */
export function extractPrometheusResultData(
  response: PrometheusApiResponse,
): unknown {
  if (response.status === 'error') {
    return {
      errorType: response.errorType,
      error: response.error,
    }
  }
  return response.data?.result ?? null
}
