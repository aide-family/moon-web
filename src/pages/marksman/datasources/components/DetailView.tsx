import React from 'react'
import { useRequest } from 'ahooks'
import {
  Modal,
  Descriptions,
  Button,
  Spin,
  Tooltip,
} from 'antd'
import {
  type DatasourceItem,
  getDatasourceStatus,
  type GetDatasourceStatusResponse,
} from '@/api/marksman/datasource/index'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import {
  emptyPlaceholder,
  getTypeLabel,
  getDriverLabel,
  getGlobalStatusLabel,
} from '@/utils/marksman'
import { GlobalStatus } from '@/api'

interface DetailViewProps {
  open?: boolean
  data?: DatasourceItem | null
  loading?: boolean
  onCancel?: () => void
  /** 内嵌模式：在右侧面板展示，不用 Modal */
  embedded?: boolean
}

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
      {emptyPlaceholder(data.uid)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.name')}>
      {emptyPlaceholder(data.name)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.type')}>
      {getTypeLabel(data.type, t)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.driver')}>
      {getDriverLabel(data.driver, t)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.level')}>
      {data.level ? (
        <div className='flex items-center gap-2'>
          <b
            className='text-xs text-(--ant-color-text-secondary) whitespace-nowrap'
            style={{ color: data.level?.bgColor ?? '#000' }}
          >
            {data.level?.name}
          </b>
          <span className='truncate'>{data.level?.remark}</span>
        </div>
      ) : (
        '-'
      )}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.status')}>
      {getGlobalStatusLabel(data.status ?? GlobalStatus.UNKNOWN, t)}
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.url')}>
      <span style={{ wordBreak: 'break-all' }}>
        {emptyPlaceholder(data.url)}
      </span>
    </Descriptions.Item>
    <Descriptions.Item label={t('datasource.detail.remark')}>
      {emptyPlaceholder(data.remark)}
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
  embedded = false,
}) => {
  const { t } = useLocale()

  const { data: statusRes, loading: statusLoading } = useRequest(
    () => {
      const endTime = dayjs()
      const startTime = endTime.subtract(3, 'hour')
      return getDatasourceStatus(data!.uid!, {
        endTime: endTime.unix(),
        startTime: startTime.unix(),
      })
    },
    {
      ready: !!data?.uid,
      refreshDeps: [data?.uid],
      pollingInterval: 30000,
      pollingWhenHidden: false,
    },
  )

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
    return <div className='h-full overflow-auto'>{body}</div>
  }

  return (
    <Modal
      title={t('datasource.modal.detail.title')}
      open={open}
      onCancel={onCancel}
      footer={<Button onClick={onCancel}>{t('common.close')}</Button>}
      width={700}
      destroyOnHidden
    >
      {body}
    </Modal>
  )
}

export default DetailView
