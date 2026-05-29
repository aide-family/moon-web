export interface KeyValueRow {
  key?: string
  value?: string
}

export const recordToKeyValueRows = (
  value?: Record<string, string>,
): KeyValueRow[] =>
  Object.entries(value ?? {}).map(([key, itemValue]) => ({
    key,
    value: itemValue,
  }))

export const keyValueRowsToRecord = (
  rows?: KeyValueRow[],
): Record<string, string> | undefined => {
  const entries = (rows ?? []).reduce<Array<[string, string]>>((acc, row) => {
    const key = row.key?.trim()
    const value = row.value?.trim() ?? ''
    if (!key) {
      if (value) {
        throw new Error('invalid key-value row')
      }
      return acc
    }
    acc.push([key, value])
    return acc
  }, [])
  return entries.length ? Object.fromEntries(entries) : undefined
}

export const formatRecordJson = (value?: Record<string, string>): string =>
  value && Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : '-'
