import { baseURL } from '@/api/request'
import { MetricsResponse } from '@/types/metrics'
import dayjs, { Dayjs } from 'dayjs'

export interface MetricQueryConfig {
  start?: Dayjs
  end?: Dayjs
  step?: number
  teamID: number
  datasourceID: number
  apiPath?: string
}

export const metricQueryRange = async (
  expr: string,
  config: MetricQueryConfig
): Promise<MetricsResponse | undefined> => {
  if (!expr) {
    return Promise.resolve(undefined)
  }
  const {
    teamID,
    datasourceID,
    apiPath = 'api/v1',
    start = dayjs().subtract(5, 'minute'),
    end = dayjs(),
    step = 14
  } = config
  const pathPrefix = `${baseURL}/metric/${teamID}/${datasourceID}`

  let path: string = 'query'
  const params: URLSearchParams = new URLSearchParams({
    query: expr
  })

  const abortController = new AbortController()

  path = 'query_range'
  params.append('start', start.unix().toString())
  params.append('end', end.unix().toString())
  params.append('step', `${step}`)

  return fetch(`${pathPrefix}/${apiPath}/${path}?${params}`, {
    cache: 'no-store',
    credentials: 'same-origin',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((resp) => resp?.json() || {})
    .then((query: MetricsResponse) => {
      return query
    })
}
