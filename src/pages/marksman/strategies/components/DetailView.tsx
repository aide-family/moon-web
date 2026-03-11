import React, { useState } from 'react'
import { Drawer, Descriptions, Button, Space, Spin, Tag, Divider } from 'antd'
import type { StrategyItem } from '@/api/strategy/index'
import { GlobalStatus } from '@/api'
import { useLocale } from '@/contexts/LocaleContext'
import RuleDetailModal from './RuleDetailModal'

interface DetailViewProps {
  open?: boolean
  data?: StrategyItem | null
  loading?: boolean
  onCancel?: () => void
  onEdit?: (data: StrategyItem) => void
  /** 规则明细保存成功后回调（如刷新详情） */
  onRuleDetailSuccess?: () => void
  /** 内嵌模式：在右侧面板展示，不用 Modal */
  embedded?: boolean
}

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

function detailContent(
  data: StrategyItem,
  t: (key: string) => string,
  onOpenRuleDetail: () => void
) {
  const s = normalizeStatus(data.status)
  const info = statusMap[s]
  const meta = data.metadata ?? {}

  return (
    <div className="space-y-6">
      {/* 基础信息 */}
      <div>
        <Divider orientation="left" orientationMargin={0} className="text-sm font-medium">
          {t('strategy.detail.section.basic')}
        </Divider>
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

      {/* 规则明细 */}
      <div>
        <Divider orientation="left" orientationMargin={0} className="text-sm font-medium">
          <Space>
            <span>{t('strategy.detail.section.ruleDetail')}</span>
            <Button type="link" size="small" onClick={onOpenRuleDetail}>
              {t('strategy.ruleDetail.add')}
            </Button>
          </Space>
        </Divider>
        <Descriptions column={1} bordered size="small" styles={{ label: { width: labelWidth, minWidth: labelWidth } }}>
          <Descriptions.Item label={t('strategy.detail.expr')}>{empty(meta.expr)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.customLabels')}>{empty(meta.labels)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.summary')}>{empty(meta.summary)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.description')}>{empty(meta.description)}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* 告警规则等级 */}
      <div>
        <Divider orientation="left" orientationMargin={0} className="text-sm font-medium">
          {t('strategy.detail.section.alertLevel')}
        </Divider>
        <Descriptions column={2} bordered size="small" styles={{ label: { width: labelWidth, minWidth: labelWidth } }}>
          <Descriptions.Item label={t('strategy.detail.level')}>{empty(meta.level)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.mode')}>{empty(meta.mode)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.condition')}>{empty(meta.condition)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.threshold')}>{empty(meta.threshold)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.duration')}>{empty(meta.duration)}</Descriptions.Item>
          <Descriptions.Item label={t('strategy.detail.status')}>
            {meta.ruleStatus != null ? empty(meta.ruleStatus) : <Tag color={info.color}>{t(info.text)}</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  )
}

const DetailView: React.FC<DetailViewProps> = ({
  open = true,
  data,
  loading = false,
  onCancel,
  onEdit,
  onRuleDetailSuccess,
  embedded = false,
}) => {
  const { t } = useLocale()
  const [ruleDetailModalOpen, setRuleDetailModalOpen] = useState(false)

  const handleEdit = () => {
    if (data && onEdit) onEdit(data)
  }

  const handleOpenRuleDetail = () => {
    setRuleDetailModalOpen(true)
  }

  const handleRuleDetailSuccess = () => {
    onRuleDetailSuccess?.()
  }

  const body = loading ? (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" />
    </div>
  ) : data ? (
    detailContent(data, t, handleOpenRuleDetail)
  ) : (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
  )

  if (embedded) {
    return (
      <>
        <div className="flex flex-col h-full">
          <div className="flex justify-end shrink-0 mb-2">
            {data && onEdit && (
              <Button type="primary" size="small" onClick={handleEdit}>
                {t('common.edit')}
              </Button>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-auto">{body}</div>
        </div>
        <RuleDetailModal
          open={ruleDetailModalOpen}
          strategyUID={data?.uid}
          onCancel={() => setRuleDetailModalOpen(false)}
          onSuccess={handleRuleDetailSuccess}
        />
      </>
    )
  }

  return (
    <>
      <Drawer
        title={t('strategy.modal.detail.title')}
        open={open}
        onClose={onCancel}
        size={1200}
        destroyOnHidden
        styles={{ body: { padding: '0 24px 24px' } }}
      >
        {body}
      </Drawer>
      <RuleDetailModal
        open={ruleDetailModalOpen}
        strategyUID={data?.uid}
        onCancel={() => setRuleDetailModalOpen(false)}
        onSuccess={handleRuleDetailSuccess}
      />
    </>
  )
}

export default DetailView
