import type { AlertEventItem } from '@/api/marksman/alert'
import { getRealtimeAlertDetail } from '@/api/marksman/alert'
import type { AlertStatus } from '@/api/common/types'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder } from '@/utils/marksman'
import { Badge, Descriptions, Modal, Spin, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { ALERT_STATUS_MAP } from './realtimeAlertHelpers'

export interface RealtimeAlertDetailModalProps {
  open: boolean
  onCancel: () => void
  uid: string | null
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
  {
    key: 'strategyGroupName',
    labelKey: 'realtimeAlert.detail.strategyGroupName',
    kind: 'text',
  },
  {
    key: 'strategyName',
    labelKey: 'realtimeAlert.detail.strategyName',
    kind: 'text',
  },
  { key: 'levelName', labelKey: 'realtimeAlert.table.levelName', kind: 'text' },
  {
    key: 'datasourceName',
    labelKey: 'realtimeAlert.table.datasourceName',
    kind: 'text',
  },
  { key: 'firedAt', labelKey: 'realtimeAlert.table.firedAt', kind: 'time' },
  { key: 'duration', labelKey: 'realtimeAlert.table.duration', kind: 'text' },
  { key: 'status', labelKey: 'realtimeAlert.table.status', kind: 'status' },
  { key: 'value', labelKey: 'realtimeAlert.table.value', kind: 'number' },
  {
    key: 'intervenedAt',
    labelKey: 'realtimeAlert.table.intervenedAt',
    kind: 'time',
  },
  {
    key: 'intervenedByName',
    labelKey: 'realtimeAlert.detail.intervenedByName',
    kind: 'text',
  },
  {
    key: 'suppressUntilAt',
    labelKey: 'realtimeAlert.table.suppressedUntil',
    kind: 'time',
  },
  {
    key: 'suppressedByName',
    labelKey: 'realtimeAlert.detail.suppressedByName',
    kind: 'text',
  },
  {
    key: 'recoveredAt',
    labelKey: 'realtimeAlert.table.recoveredAt',
    kind: 'time',
  },
  {
    key: 'recoveredByName',
    labelKey: 'realtimeAlert.detail.recoveredByName',
    kind: 'text',
  },
  {
    key: 'summary',
    labelKey: 'realtimeAlert.table.summary',
    kind: 'text',
    span: 2,
  },
  {
    key: 'description',
    labelKey: 'realtimeAlert.table.description',
    kind: 'text',
    span: 2,
  },
  { key: 'expr', labelKey: 'realtimeAlert.detail.expr', kind: 'text', span: 2 },
  {
    key: 'labels',
    labelKey: 'realtimeAlert.detail.labels',
    kind: 'labels',
    span: 2,
  },
  {
    key: 'suppressedReason',
    labelKey: 'realtimeAlert.detail.suppressedReason',
    kind: 'text',
    span: 2,
  },
  {
    key: 'recoveredReason',
    labelKey: 'realtimeAlert.detail.recoveredReason',
    kind: 'text',
    span: 2,
  },
]

function formatLabelsJson(labels: Record<string, string> | undefined): string {
  if (labels == null || Object.keys(labels).length === 0) return ''
  try {
    return JSON.stringify(labels, null, 2)
  } catch {
    return String(labels)
  }
}

export const RealtimeAlertDetailModal: React.FC<
  RealtimeAlertDetailModalProps
> = ({ open, onCancel, uid }) => {
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
    if (!uid) return

    const seq = ++fetchSeqRef.current
    setLoading(true)
    setRecord(null)

    void (async () => {
      try {
        const detail = await getRealtimeAlertDetail(uid)
        if (fetchSeqRef.current !== seq) return
        setRecord(detail)
      } catch (e) {
        console.error('获取告警详情失败:', e)
        if (fetchSeqRef.current !== seq) return
        setRecord(null)
      } finally {
        if (fetchSeqRef.current === seq) setLoading(false)
      }
    })()
  }, [open, uid])

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
        // 只展示名称；id 用 Tooltip 展示
        if (field.key === 'strategyGroupName') {
          const strategyGroupUid = d.strategyGroupUid
          const nameText = emptyPlaceholder(v as string | undefined)
          if (!strategyGroupUid) return nameText
          return <Tooltip title={String(strategyGroupUid)}>{nameText}</Tooltip>
        }
        if (field.key === 'strategyName') {
          const strategyUid = d.strategyUid
          const nameText = emptyPlaceholder(v as string | undefined)
          if (!strategyUid) return nameText
          return <Tooltip title={String(strategyUid)}>{nameText}</Tooltip>
        }
        if (field.key === 'levelName') {
          const levelUid = d.levelUid
          const nameText = emptyPlaceholder(v as string | undefined)
          if (!levelUid) return nameText
          return <Tooltip title={String(levelUid)}>{nameText}</Tooltip>
        }
        if (field.key === 'datasourceName') {
          const datasourceUid = d.datasourceUid
          const nameText = emptyPlaceholder(v as string | undefined)
          const levelText = emptyPlaceholder(d.datasourceLevelName)
          const content = (
            <span className='inline-flex items-center gap-2 min-w-0'>
              {levelText && levelText !== '-' ? (
                <Tag color='default'>{levelText}</Tag>
              ) : null}
              <span className='truncate' title={nameText}>
                {nameText}
              </span>
            </span>
          )
          if (!datasourceUid) return content
          return <Tooltip title={String(datasourceUid)}>{content}</Tooltip>
        }
        if (field.key === 'intervenedByName') {
          const intervenedBy = d.intervenedBy
          const nameText = emptyPlaceholder(v as string | undefined)
          if (!intervenedBy) return nameText
          return <Tooltip title={String(intervenedBy)}>{nameText}</Tooltip>
        }
        if (field.key === 'suppressedByName') {
          const suppressedBy = d.suppressedBy
          const nameText = emptyPlaceholder(v as string | undefined)
          if (!suppressedBy) return nameText
          return <Tooltip title={String(suppressedBy)}>{nameText}</Tooltip>
        }
        if (field.key === 'recoveredByName') {
          const recoveredBy = d.recoveredBy
          const nameText = emptyPlaceholder(v as string | undefined)
          if (!recoveredBy) return nameText
          return <Tooltip title={String(recoveredBy)}>{nameText}</Tooltip>
        }

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
