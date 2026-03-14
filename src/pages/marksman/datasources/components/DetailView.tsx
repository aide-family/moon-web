import React, { useEffect, useState } from 'react'
import { Modal, Descriptions, Button, Space, Spin, Tooltip } from 'antd'
import {
  type DatasourceItem,
  getDatasourceStatus,
  type GetDatasourceStatusResponse,
} from '@/api/marksman/datasource/index'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailViewProps {
  open?: boolean
  data?: DatasourceItem | null
  loading?: boolean
  onCancel?: () => void
  onEdit?: (data: DatasourceItem) => void
  /** 内嵌模式：在右侧面板展示，不用 Modal */
  embedded?: boolean
}

function getTypeLabel(
  value: string | undefined,
  t: (key: string) => string,
): string {
  if (value == null || value === '') return '-'
  return t(`datasource.type.${value}`) || value
}

function getDriverLabel(
  value: string | undefined,
  t: (key: string) => string,
): string {
  if (value == null || value === '') return '-'
  return t(`datasource.driver.${value}`) || value
}

const empty = (v: unknown) => (v == null || v === '' ? '-' : String(v))

/** 从状态接口响应中收集所有点（按时间排序），用于小格子展示 */
function collectStatusPoints(
  res: GetDatasourceStatusResponse,
): Array<{ timestamp?: string; value?: number }> {
  const points: Array<{ timestamp?: string; value?: number }> = []
  const series = res.series ?? []
  for (const s of series) {
    for (const p of s.points ?? []) {
      points.push(p)
    }
  }
  points.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return ta - tb
  })
  return points
}

/** 状态栏展示的格子数（只保留最新），格子均分容器宽度，单行无横向滚动 */
const MAX_STATUS_CELLS = 128

interface StatusGridStripProps {
  points: Array<{ timestamp?: string; value?: number }>
  loading?: boolean
  label: string
}

const StatusGridStrip: React.FC<StatusGridStripProps> = ({
  points,
  loading,
  label,
}) => {
  const { t } = useLocale()
  if (loading) {
    return (
      <div className='mb-4 min-w-0'>
        <div className='text-sm text-(--ant-color-text-secondary) mb-2'>
          {label}
        </div>
        <div className='h-5 w-full flex items-stretch'>
          <Spin size='small' />
        </div>
      </div>
    )
  }
  if (points.length === 0) {
    return (
      <div className='mb-4 min-w-0'>
        <div className='text-sm text-(--ant-color-text-secondary) mb-2'>
          {label}
        </div>
        <div className='text-(--ant-color-text-tertiary) text-sm'>
          {t('common.noData')}
        </div>
      </div>
    )
  }
  const latestPoints = points.slice(-MAX_STATUS_CELLS)
  const placeholderCount = Math.max(0, MAX_STATUS_CELLS - latestPoints.length)
  const placeholders = Array.from({ length: placeholderCount }, () => null)
  const cells = [...placeholders, ...latestPoints]
  return (
    <div className='mb-4 min-w-0 w-full'>
      <div className='text-sm text-(--ant-color-text-secondary) mb-2'>
        {label}
      </div>
      <div className='flex items-stretch h-5 w-full min-w-0'>
        {cells.map((p, i) => {
          const isPlaceholder = p === null
          const isUp = !isPlaceholder && p.value === 1
          const timeStr =
            !isPlaceholder && p?.timestamp
              ? dayjs(+p.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
              : ''
          const tip = isPlaceholder
            ? t('common.noData')
            : timeStr
              ? `${timeStr} · ${isUp ? t('datasource.status.up') : t('datasource.status.down')} (${p?.value ?? '-'})`
              : `${isUp ? t('datasource.status.up') : t('datasource.status.down')} (${p?.value ?? '-'})`
          return (
            <Tooltip key={i} title={tip}>
              <span
                className='flex-1 min-w-0 max-w-[15px] rounded-sm border border-(--ant-color-border) transition-colors'
                style={{
                  backgroundColor: isPlaceholder
                    ? 'var(--ant-color-fill-quaternary)'
                    : isUp
                      ? 'var(--ant-color-success)'
                      : 'var(--ant-color-error)',
                }}
              />
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}

const detailContent = (data: DatasourceItem, t: (key: string) => string) => (
  <Descriptions
    column={1}
    bordered
    size='small'
    styles={{ label: { width: 120, minWidth: 120 } }}
  >
    <Descriptions.Item label={t('datasource.detail.uid')}>
      {empty(data.uid)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.name')}>
      {empty(data.name)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.type')}>
      {getTypeLabel(data.type, t)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.driver')}>
      {getDriverLabel(data.driver, t)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.status')}>
      {empty(data.status)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.url')}>
      <span style={{ wordBreak: 'break-all' }}>{empty(data.url)}</span>
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.remark')}>
      {empty(data.remark)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.createdAt')}>
      {data.createdAt
        ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')
        : '-'}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.updatedAt')}>
      {data.updatedAt
        ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        : '-'}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.metadata')}>
      {data.metadata && Object.keys(data.metadata).length > 0 ? (
        <pre
          style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {JSON.stringify(data.metadata, null, 2)}
        </pre>
      ) : (
        '-'
      )}
    </Descriptions.Item>
  </Descriptions>
)

const DetailView: React.FC<DetailViewProps> = ({
  open = true,
  data,
  loading = false,
  onCancel,
  onEdit,
  embedded = false,
}) => {
  const { t } = useLocale()
  const [statusRes, setStatusRes] =
    useState<GetDatasourceStatusResponse | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    if (!data?.uid) {
      queueMicrotask(() => {
        setStatusRes(null)
        setStatusLoading(false)
      })
      return
    }
    let cancelled = false
    let isFirst = true
    const fetchStatus = () => {
      if (isFirst) {
        queueMicrotask(() => setStatusLoading(true))
        isFirst = false
      }
      const endTime = dayjs()
      const startTime = endTime.subtract(3, 'hour')
      getDatasourceStatus(data.uid!, {
        endTime: endTime.unix(),
        startTime: startTime.unix(),
      })
        .then((res) => {
          if (!cancelled) setStatusRes(res)
        })
        .catch(() => {
          if (!cancelled) setStatusRes(null)
        })
        .finally(() => {
          if (!cancelled) setStatusLoading(false)
        })
    }
    fetchStatus()
    const timer = setInterval(fetchStatus, 30 * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [data?.uid])

  const handleEdit = () => {
    if (data && onEdit) onEdit(data)
  }

  const statusPoints = statusRes ? collectStatusPoints(statusRes) : []
  const statusLabel = t('datasource.detail.status')

  const body = loading ? (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size='large' />
    </div>
  ) : data ? (
    <>
      <StatusGridStrip
        points={statusPoints}
        loading={statusLoading}
        label={statusLabel}
      />
      {detailContent(data, t)}
    </>
  ) : (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      {t('common.noData')}
    </div>
  )

  if (embedded) {
    return (
      <div className='flex flex-col h-full'>
        <div className='flex justify-end shrink-0 mb-2'>
          {data && onEdit && (
            <Button type='primary' size='small' onClick={handleEdit}>
              {t('common.edit')}
            </Button>
          )}
        </div>
        <div className='flex-1 min-h-0 overflow-auto'>{body}</div>
      </div>
    )
  }

  return (
    <Modal
      title={t('datasource.modal.detail.title')}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.close')}</Button>
          {data && onEdit && (
            <Button type='primary' onClick={handleEdit}>
              {t('common.edit')}
            </Button>
          )}
        </Space>
      }
      width={700}
      destroyOnHidden
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {body}
    </Modal>
  )
}

export default DetailView
