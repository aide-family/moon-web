import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, App, Descriptions, Space, Spin, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getStrategyDetail } from '@/api/strategy/index'
import type { StrategyItem } from '@/api/strategy/index'
import { getStrategyMetric } from '@/api/strategyMetric'
import type { StrategyMetricLevelItem } from '@/api/strategyMetric/types'
import { GlobalStatus } from '@/api'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import DetailForm from './components/DetailForm'
import RuleDetailModal from './components/RuleDetailModal'
import AlertLevelModal from './components/AlertLevelModal'

const empty = (v: unknown) => (v == null || v === '') ? '-' : String(v)

function getTypeLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.type.${value}`) || value
}
function getDriverLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.driver.${value}`) || value
}

function normalizeStatus(status: string | undefined): GlobalStatus {
  if (status === GlobalStatus.ENABLED) return GlobalStatus.ENABLED
  if (status === GlobalStatus.DISABLED) return GlobalStatus.DISABLED
  return GlobalStatus.UNKNOWN
}

const statusMap: Record<GlobalStatus, { text: string; color: string }> = {
  [GlobalStatus.UNKNOWN]: { text: 'table.unknown', color: 'default' },
  [GlobalStatus.ENABLED]: { text: 'table.enable', color: 'success' },
  [GlobalStatus.DISABLED]: { text: 'table.disable', color: 'error' },
}

const labelWidth = 140

export default function StrategyDetailPage() {
  const { uid } = useParams<{ uid: string }>()
  const navigate = useNavigate()
  const { t } = useLocale()
  const [data, setData] = useState<StrategyItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [editingData, setEditingData] = useState<StrategyItem | null>(null)
  const [ruleDetailModalOpen, setRuleDetailModalOpen] = useState(false)
  const [alertLevelModalOpen, setAlertLevelModalOpen] = useState(false)
  const [levels, setLevels] = useState<StrategyMetricLevelItem[]>([])

  useEffect(() => {
    if (!uid) {
      queueMicrotask(() => {
        setData(null)
        setLevels([])
        setLoading(false)
      })
      return
    }
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setLoading(true)
    })
    getStrategyDetail(uid)
      .then((detailRes) => {
        if (cancelled) return
        setData(detailRes)
        if (detailRes?.type === 'METRICS') {
          return getStrategyMetric(uid).then((metricRes) => {
            if (!cancelled) setLevels(metricRes?.levels ?? [])
          }).catch(() => {
            if (!cancelled) setLevels([])
          })
        }
        setLevels([])
      })
      .catch(() => {
        if (!cancelled) {
          setData(null)
          setLevels([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [uid])

  const handleBack = () => {
    navigate('/strategies')
  }

  const handleEdit = (item: StrategyItem) => {
    setEditingData(item)
    setDetailFormOpen(true)
  }

  const handleFormSuccess = () => {
    setDetailFormOpen(false)
    setEditingData(null)
    if (uid) {
      setLoading(true)
      getStrategyDetail(uid)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false))
    }
  }

  const handleRuleDetailSuccess = () => {
    setRuleDetailModalOpen(false)
    if (uid) {
      setLoading(true)
      getStrategyDetail(uid)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false))
    }
  }

  const handleAlertLevelSuccess = () => {
    setAlertLevelModalOpen(false)
    if (uid) {
      getStrategyMetric(uid)
        .then((res) => setLevels(res?.levels ?? []))
        .catch(() => setLevels([]))
    }
  }

  const sectionTitle = (label: string, right?: React.ReactNode, showEdit = false) => (
    <div className="text-sm font-medium mb-2 flex items-center gap-2">
      <span>{label}</span>
      {showEdit && (
        <Button type="link" size="small" onClick={() => data && handleEdit(data)}>
          {t('common.edit')}
        </Button>
      )}
      {right}
    </div>
  )

  const renderBody = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )
    }
    if (!data) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
      )
    }
    const s = normalizeStatus(data.status)
    const info = statusMap[s]
    const meta = data.metadata ?? {}

    return (
      <div className="space-y-6">
        {/* 基础信息 */}
        <div>
          {sectionTitle(t('strategy.detail.section.basic'), undefined, true)}
          <Descriptions column={2} bordered size="small" styles={{ label: { width: labelWidth, minWidth: labelWidth } }}>
            <Descriptions.Item label={t('strategy.detail.name')}>
              <Space>
                <span>{empty(data.name)}</span>
                <Tag color={info.color}>{t(info.text)}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('strategy.detail.type')}>{getTypeLabel(data.type, t)}</Descriptions.Item>
            <Descriptions.Item label={t('strategy.detail.remark')} span={2}>{empty(data.remark)}</Descriptions.Item>
            <Descriptions.Item label={t('strategy.detail.metadata')} span={2}>
              {data.metadata && Object.keys(data.metadata).length > 0 ? (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflow: 'auto' }}>
                  {JSON.stringify(data.metadata, null, 2)}
                </pre>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('strategy.detail.driver')}>{getDriverLabel(data.driver, t)}</Descriptions.Item>
          </Descriptions>
        </div>

        {/* 规则明细（仅 METRICS 类型） */}
        {data.type === 'METRICS' && (
          <div>
            {sectionTitle(
              t('strategy.detail.section.ruleDetail'),
              <Button type="link" size="small" onClick={() => setRuleDetailModalOpen(true)}>
                {t('strategy.ruleDetail.add')}
              </Button>
            )}
            <Descriptions column={1} bordered size="small" styles={{ label: { width: labelWidth, minWidth: labelWidth } }}>
              <Descriptions.Item label={t('strategy.detail.expr')}>{empty(meta.expr)}</Descriptions.Item>
              <Descriptions.Item label={t('strategy.detail.customLabels')}>{empty(meta.labels)}</Descriptions.Item>
              <Descriptions.Item label={t('strategy.detail.summary')}>{empty(meta.summary)}</Descriptions.Item>
              <Descriptions.Item label={t('strategy.detail.description')}>{empty(meta.description)}</Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {/* 告警规则等级（仅 METRICS 类型） */}
        {data.type === 'METRICS' && (
          <div>
            {sectionTitle(
              t('strategy.detail.section.alertLevel'),
              <Button type="link" size="small" onClick={() => setAlertLevelModalOpen(true)}>
                {t('strategy.alertLevel.add')}
              </Button>
            )}
            <Table<StrategyMetricLevelItem>
              size="small"
              bordered
              rowKey={(_, i) => String(i)}
              pagination={false}
              dataSource={levels}
              columns={[
                { title: t('strategy.detail.level'), dataIndex: ['level', 'uid'], key: 'level', width: 120, render: empty },
                { title: t('strategy.detail.mode'), dataIndex: ['level', 'mode'], key: 'mode', width: 80, render: empty },
                { title: t('strategy.detail.condition'), dataIndex: ['level', 'condition'], key: 'condition', width: 80, render: empty },
                {
                  title: t('strategy.detail.threshold'),
                  dataIndex: ['level', 'values'],
                  key: 'values',
                  render: (v: number[] | undefined) => (v?.length ? v.join(', ') : '-'),
                },
                { title: t('strategy.detail.duration'), dataIndex: ['level', 'duration'], key: 'duration', width: 100, render: empty },
                {
                  title: t('strategy.detail.status'),
                  dataIndex: ['level', 'status'],
                  key: 'status',
                  width: 80,
                  render: (v: number | undefined) => (v != null ? String(v) : '-'),
                },
              ] as ColumnsType<StrategyMetricLevelItem>}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <App>
      <PageContent>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
              {t('common.back')}
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">{renderBody()}</div>
            <RuleDetailModal
              open={ruleDetailModalOpen}
              strategyUID={data?.uid}
              onCancel={() => setRuleDetailModalOpen(false)}
              onSuccess={handleRuleDetailSuccess}
            />
            <AlertLevelModal
              open={alertLevelModalOpen}
              strategyUID={data?.uid}
              onCancel={() => setAlertLevelModalOpen(false)}
              onSuccess={handleAlertLevelSuccess}
            />
          </div>
        </div>

        <DetailForm
          open={detailFormOpen}
          mode="edit"
          initialData={editingData}
          onCancel={() => {
            setDetailFormOpen(false)
            setEditingData(null)
          }}
          onSuccess={handleFormSuccess}
        />
      </PageContent>
    </App>
  )
}
