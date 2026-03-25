import type { AlertEventItem, ListRealtimeAlertParams } from '@/api/marksman/alert'
import { getRealtimeAlertDetail, getRealtimeAlertList } from '@/api/marksman/alert'
import type { AlertStatus } from '@/api/common/types'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder } from '@/utils/marksman'
import { Badge, Descriptions, Modal, Spin, Tag, message } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { ALERT_STATUS_MAP } from './realtimeAlertHelpers'

export interface RealtimeAlertDetailModalProps {
  open: boolean
  onCancel: () => void
  alertPageUid: string
  /** 列表行快照：作为 uid 来源及请求失败时的兜底 */
  fallbackRecord: AlertEventItem | null
  /** 与当前实时列表筛选一致，供列表接口兜底查询 */
  listStatus?: number
  listStartAtUnix?: string
  listEndAtUnix?: string
}

type FieldKind = 'text' | 'time' | 'status' | 'labels' | 'number' | 'bgColor'
interface DetailField {
  key: keyof AlertEventItem
  labelKey: string
  kind: FieldKind
  span?: 1 | 2
}

const DETAIL_FIELDS: DetailField[] = [
  { key: 'uid', labelKey: 'realtimeAlert.table.uid', kind: 'text', span: 2 },
  { key: 'strategyGroupUid', labelKey: 'realtimeAlert.detail.strategyGroupUid', kind: 'text' },
  { key: 'strategyGroupName', labelKey: 'realtimeAlert.detail.strategyGroupName', kind: 'text' },
  { key: 'strategyUid', labelKey: 'realtimeAlert.detail.strategyUid', kind: 'text' },
  { key: 'strategyName', labelKey: 'realtimeAlert.detail.strategyName', kind: 'text' },
  { key: 'levelUid', labelKey: 'realtimeAlert.detail.levelUid', kind: 'text' },
  { key: 'levelName', labelKey: 'realtimeAlert.table.levelName', kind: 'text' },
  { key: 'datasourceUid', labelKey: 'realtimeAlert.detail.datasourceUid', kind: 'text' },
  { key: 'datasourceName', labelKey: 'realtimeAlert.table.datasourceName', kind: 'text' },
  { key: 'firedAt', labelKey: 'realtimeAlert.table.firedAt', kind: 'time' },
  { key: 'duration', labelKey: 'realtimeAlert.table.duration', kind: 'text' },
  { key: 'status', labelKey: 'realtimeAlert.table.status', kind: 'status' },
  { key: 'value', labelKey: 'realtimeAlert.table.value', kind: 'number' },
  { key: 'bgColor', labelKey: 'realtimeAlert.detail.bgColor', kind: 'bgColor' },
  { key: 'intervenedAt', labelKey: 'realtimeAlert.table.intervenedAt', kind: 'time' },
  { key: 'intervenedBy', labelKey: 'realtimeAlert.detail.intervenedBy', kind: 'text' },
  { key: 'intervenedByName', labelKey: 'realtimeAlert.detail.intervenedByName', kind: 'text' },
  { key: 'suppressUntilAt', labelKey: 'realtimeAlert.table.suppressedUntil', kind: 'time' },
  { key: 'suppressedBy', labelKey: 'realtimeAlert.detail.suppressedBy', kind: 'text' },
  { key: 'suppressedByName', labelKey: 'realtimeAlert.detail.suppressedByName', kind: 'text' },
  { key: 'recoveredAt', labelKey: 'realtimeAlert.table.recoveredAt', kind: 'time' },
  { key: 'recoveredBy', labelKey: 'realtimeAlert.detail.recoveredBy', kind: 'text' },
  { key: 'recoveredByName', labelKey: 'realtimeAlert.detail.recoveredByName', kind: 'text' },
  { key: 'summary', labelKey: 'realtimeAlert.table.summary', kind: 'text', span: 2 },
  { key: 'description', labelKey: 'realtimeAlert.table.description', kind: 'text', span: 2 },
  { key: 'expr', labelKey: 'realtimeAlert.detail.expr', kind: 'text', span: 2 },
  { key: 'labels', labelKey: 'realtimeAlert.detail.labels', kind: 'labels', span: 2 },
  { key: 'suppressedReason', labelKey: 'realtimeAlert.detail.suppressedReason', kind: 'text', span: 2 },
  { key: 'recoveredReason', labelKey: 'realtimeAlert.detail.recoveredReason', kind: 'text', span: 2 },
]

function formatLabelsJson(labels: Record<string, string> | undefined): string {
  if (labels == null || Object.keys(labels).length === 0) return ''
  try {
    return JSON.stringify(labels, null, 2)
  } catch {
    return String(labels)
  }
}

async function fetchLatestAlertEvent(params: {
  alertPageUid: string
  uid: string
  listFilter: Pick<ListRealtimeAlertParams, 'status' | 'startAtUnix' | 'endAtUnix'>
}): Promise<AlertEventItem> {
  const { alertPageUid, uid, listFilter } = params
  try {
    return await getRealtimeAlertDetail(uid)
  } catch {
    const res = await getRealtimeAlertList(alertPageUid, {
      page: 1,
      pageSize: 200,
      ...listFilter,
      keyword: uid,
    })
    const hit = res.items?.find((i) => i.uid === uid)
    if (hit) return hit
    throw new Error('ALERT_DETAIL_NOT_FOUND')
  }
}

export const RealtimeAlertDetailModal: React.FC<RealtimeAlertDetailModalProps> = ({
  open,
  onCancel,
  alertPageUid,
  fallbackRecord,
  listStatus,
  listStartAtUnix,
  listEndAtUnix,
}) => {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [record, setRecord] = useState<AlertEventItem | null>(null)
  const fetchSeqRef = useRef(0)

  useEffect(() => {
    if (!open) {
      setRecord(null)
      setLoading(false)
      return
    }
    if (!fallbackRecord?.uid) return

    const uid = fallbackRecord.uid
    const seq = ++fetchSeqRef.current
    setLoading(true)
    setRecord(null)

    void (async () => {
      try {
        const latest = await fetchLatestAlertEvent({
          alertPageUid,
          uid,
          listFilter: {
            status: listStatus,
            startAtUnix: listStartAtUnix,
            endAtUnix: listEndAtUnix,
          },
        })
        if (fetchSeqRef.current !== seq) return
        setRecord(latest)
      } catch (e) {
        console.error('获取告警详情失败:', e)
        if (fetchSeqRef.current !== seq) return
        message.warning(t('realtimeAlert.message.detailFallback'))
        setRecord(fallbackRecord)
      } finally {
        if (fetchSeqRef.current === seq) setLoading(false)
      }
    })()
  }, [
    open,
    fallbackRecord,
    alertPageUid,
    listStatus,
    listStartAtUnix,
    listEndAtUnix,
    t,
  ])

  const renderStatus = (status?: AlertStatus) => {
    if (status == null) return emptyPlaceholder(status)
    const info = ALERT_STATUS_MAP[status] ?? {
      key: 'table.unknown',
      color: 'default',
    }
    return <Tag color={info.color}>{t(info.key)}</Tag>
  }

  const renderField = (d: AlertEventItem, field: DetailField) => {
    const v = d[field.key]
    switch (field.kind) {
      case 'time':
        return typeof v === 'string' && v
          ? dayjs(v).format('YYYY-MM-DD HH:mm:ss')
          : '-'
      case 'status':
        return renderStatus(v as AlertStatus | undefined)
      case 'number':
        return v != null ? String(v) : '-'
      case 'labels': {
        const text = formatLabelsJson(v as Record<string, string> | undefined)
        if (!text) return '-'
        return (
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 240,
              overflow: 'auto',
            }}
          >
            {text}
          </pre>
        )
      }
      case 'bgColor': {
        const c = typeof v === 'string' ? v.trim() : ''
        if (!c) return '-'
        return (
          <span className='inline-flex items-center gap-2 min-w-0'>
            <Badge color={c} size='small' />
            <span className='truncate' title={c}>
              {c}
            </span>
          </span>
        )
      }
      default:
        return emptyPlaceholder(v as string | undefined)
    }
  }

  return (
    <Modal
      title={t('realtimeAlert.modal.detail.title')}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={880}
      destroyOnHidden
    >
      {loading ? (
        <div className='flex justify-center py-10'>
          <Spin />
        </div>
      ) : record ? (
        <Descriptions
          column={2}
          bordered
          size='small'
          styles={{ label: { width: 170, minWidth: 170 } }}
        >
          {DETAIL_FIELDS.map((field) => (
            <Descriptions.Item
              key={field.key}
              label={t(field.labelKey)}
              span={field.span ?? 1}
            >
              {renderField(record, field)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <div className='text-center text-(--ant-color-text-secondary) py-6'>
          {t('common.noData')}
        </div>
      )}
    </Modal>
  )
}
