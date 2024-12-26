import type { MetricSeries, MetricsData, MetricsDataResult } from '@/types/metrics'

export const transformMetricsData = (data: MetricsData): MetricSeries[] => {
  return data.result.map((series: MetricsDataResult) => ({
    instance: JSON.stringify(series.metric),
    values: series.values.map((point: [number, string]) => ({
      timestamp: point[0] * 1000, // Convert to milliseconds
      value: Number.parseFloat(point[1])
    }))
  }))
}

export const getDataRange = (data: MetricSeries[]) => {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const series of data) {
    for (const point of series.values) {
      min = Math.min(min, point.value)
      max = Math.max(max, point.value)
    }
  }

  return { min, max }
}

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
