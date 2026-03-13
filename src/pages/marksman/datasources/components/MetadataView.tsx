import {
  type MetricSummaryItem,
  getDatasourceMetrics,
} from '@/api/marksman/datasource/index'
import { useLocale } from '@/contexts/LocaleContext'
import { Spin, Table } from 'antd'
import React, { useEffect, useState } from 'react'

interface MetadataViewProps {
  /** 数据源 uid，为空时不请求 */
  uid: string | null
}

const MetadataView: React.FC<MetadataViewProps> = ({ uid }) => {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MetricSummaryItem[]>([])

  useEffect(() => {
    if (!uid) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const res = await getDatasourceMetrics(uid!)
        if (!cancelled) setData(res.metrics ?? [])
      } catch {
        if (!cancelled) setData([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    // 延后到微任务再 setState，避免 effect 内同步 setState 触发级联渲染
    queueMicrotask(run)
    return () => {
      cancelled = true
    }
  }, [uid])

  // 无 uid 时直接展示空，不依赖 setState，避免 effect 内同步 setState
  const displayData = uid ? data : []

  if (loading) {
    return (
      <div className='p-4 h-full overflow-auto'>
        <div className='flex justify-center py-8'>
          <Spin />
        </div>
      </div>
    )
  }

  if (displayData.length === 0) {
    return (
      <div className='p-4 h-full overflow-auto'>
        <div className='text-(--ant-color-text-tertiary) py-4'>
          {t('datasource.metadata.empty')}
        </div>
      </div>
    )
  }

  return (
    <div className='p-4 h-full overflow-auto'>
      <Table<MetricSummaryItem>
        size='small'
        rowKey={(r) => r.name ?? String(Math.random())}
        dataSource={displayData}
        columns={[
          {
            title: t('datasource.metrics.name'),
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
          },
          {
            title: t('datasource.metrics.help'),
            key: 'help',
            ellipsis: true,
            render: (_: unknown, r: MetricSummaryItem) =>
              !r.help ? '-' : r.help,
          },
          {
            title: t('datasource.metrics.type'),
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (_: unknown, r: MetricSummaryItem) =>
              !r.type ? '-' : r.type,
          },
          {
            title: t('datasource.metrics.unit'),
            dataIndex: 'unit',
            key: 'unit',
            width: 100,
            render: (_: unknown, r: MetricSummaryItem) =>
              !r.unit ? '-' : r.unit,
          },
        ]}
        pagination={false}
        scroll={{ y: 'calc(100vh - 300px)', x: '800px' }}
      />
    </div>
  )
}

export default MetadataView
