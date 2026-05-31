import type { DatasourceFilter } from '@/api/marksman/strategyMetric/types'
import type { KeyValueRow } from '@/components/keyValueUtils'
import {
  keyValueRowsToRecord,
  recordToKeyValueRows,
} from '@/components/keyValueUtils'

export interface DatasourceFilterFormValues {
  datasourceUids?: string[]
  excludeDatasourceUids?: string[]
  datasourceLabels?: KeyValueRow[]
  excludeDatasourceLabels?: KeyValueRow[]
}

export function isDatasourceFilterEmpty(filter?: DatasourceFilter): boolean {
  if (!filter) return true
  return (
    !(filter.datasourceUids?.length ?? 0) &&
    !(filter.excludeDatasourceUids?.length ?? 0) &&
    !Object.keys(filter.datasourceLabels ?? {}).length &&
    !Object.keys(filter.excludeDatasourceLabels ?? {}).length
  )
}

export function datasourceFilterToForm(
  filter?: DatasourceFilter,
): DatasourceFilterFormValues {
  if (!filter || isDatasourceFilterEmpty(filter)) {
    return {}
  }
  return {
    datasourceUids: filter.datasourceUids?.length
      ? filter.datasourceUids
      : undefined,
    excludeDatasourceUids: filter.excludeDatasourceUids?.length
      ? filter.excludeDatasourceUids
      : undefined,
    datasourceLabels: recordToKeyValueRows(filter.datasourceLabels),
    excludeDatasourceLabels: recordToKeyValueRows(
      filter.excludeDatasourceLabels,
    ),
  }
}

export function formToDatasourceFilter(
  form: DatasourceFilterFormValues | undefined,
): DatasourceFilter | undefined {
  if (!form) return undefined

  const datasourceUids = form.datasourceUids?.filter(Boolean)
  const excludeDatasourceUids = form.excludeDatasourceUids?.filter(Boolean)
  const datasourceLabels = keyValueRowsToRecord(form.datasourceLabels)
  const excludeDatasourceLabels = keyValueRowsToRecord(
    form.excludeDatasourceLabels,
  )

  const hasAny =
    (datasourceUids?.length ?? 0) > 0 ||
    (excludeDatasourceUids?.length ?? 0) > 0 ||
    Boolean(datasourceLabels && Object.keys(datasourceLabels).length > 0) ||
    Boolean(
      excludeDatasourceLabels &&
        Object.keys(excludeDatasourceLabels).length > 0,
    )

  if (!hasAny) return undefined

  return {
    ...(datasourceUids?.length ? { datasourceUids } : {}),
    ...(excludeDatasourceUids?.length ? { excludeDatasourceUids } : {}),
    ...(datasourceLabels ? { datasourceLabels } : {}),
    ...(excludeDatasourceLabels ? { excludeDatasourceLabels } : {}),
  }
}

export function formatLabelRecord(labels?: Record<string, string>): string {
  if (!labels || !Object.keys(labels).length) return '-'
  return Object.entries(labels)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
}
