export interface MetricDataPoint {
  timestamp: number
  value: number
}

export interface MetricSeries {
  instance: string
  values: MetricDataPoint[]
}

export interface MetricsData {
  resultType: string
  result: MetricsDataResult[]
}

export interface MetricsDataResult {
  metric: {
    instance: string
  }
  values: [number, string][]
}

export interface MetricsResponse {
  data: MetricsData
  status: string | { [key: string]: string }
}
