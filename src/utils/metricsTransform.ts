import { MetricSeries, MetricsData, MetricsDataResult } from '@/types/metrics'

export const transformMetricsData = (data: MetricsData): MetricSeries[] => {
  return data.result.map((series: MetricsDataResult) => ({
    instance: JSON.stringify(series.metric),
    values: series.values.map((point: [number, string]) => ({
      timestamp: point[0] * 1000, // Convert to milliseconds
      value: parseFloat(point[1])
    }))
  }))
}

export const getDataRange = (data: MetricSeries[]) => {
  let min = Infinity
  let max = -Infinity

  data.forEach((series) => {
    series.values.forEach((point) => {
      min = Math.min(min, point.value)
      max = Math.max(max, point.value)
    })
  })

  // Remove padding to show exact min/max range
  return {
    min,
    max
  }
}

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
