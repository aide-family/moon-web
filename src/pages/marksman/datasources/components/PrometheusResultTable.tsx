import type { PrometheusApiResponse } from '@/api/marksman/metricQuery/types'
import { useLocale } from '@/contexts/LocaleContext'
import { Empty, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import {
  collectLabelKeys,
  type PrometheusTableRow,
  toTableRows,
} from '../utils/prometheus'

interface PrometheusResultTableProps {
  response: PrometheusApiResponse | null
  loading?: boolean
}

const PrometheusResultTable: React.FC<PrometheusResultTableProps> = ({
  response,
  loading,
}) => {
  const { t } = useLocale()

  const rows = useMemo(
    () => (response ? toTableRows(response) : []),
    [response],
  )

  const labelKeys = useMemo(() => collectLabelKeys(rows), [rows])

  const columns = useMemo<ColumnsType<PrometheusTableRow>>(() => {
    const labelColumns: ColumnsType<PrometheusTableRow> = labelKeys.map(
      (key) => ({
        title: key,
        key,
        ellipsis: true,
        width: 140,
        render: (_: unknown, row) => row.labels[key] ?? '-',
      }),
    )

    return [
      ...labelColumns,
      {
        title: t('datasource.quickQuery.table.value'),
        dataIndex: 'value',
        key: 'value',
        width: 120,
        ellipsis: true,
        render: (value: string) => (
          <span className='font-mono text-(--ant-color-text)'>{value}</span>
        ),
      },
      {
        title: t('datasource.quickQuery.table.timestamp'),
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 180,
        render: (ts: number) =>
          ts ? dayjs.unix(ts).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
    ]
  }, [labelKeys, t])

  if (!loading && rows.length === 0) {
    return (
      <div className='h-full min-h-0 flex-1 flex items-center justify-center'>
        <Empty description={t('datasource.quickQuery.empty')} />
      </div>
    )
  }

  return (
    <div className='h-full min-h-0 flex-1 overflow-auto'>
      <Table<PrometheusTableRow>
        size='small'
        rowKey='key'
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={
          rows.length > 50 ? { pageSize: 50, showSizeChanger: true } : false
        }
        locale={{ emptyText: t('datasource.quickQuery.empty') }}
      />
    </div>
  )
}

export default PrometheusResultTable
