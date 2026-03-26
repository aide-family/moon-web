import { useEffect, useState } from 'react'
import {
  Button,
  Descriptions,
  Divider,
  Empty,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import type { StrategyItem } from '@/api/marksman/strategy/index'
import {
  deleteStrategyMetricLevel,
  getStrategyMetric,
  saveStrategyMetricLevel,
  updateStrategyMetricLevelStatus,
} from '@/api/marksman/strategyMetric'
import type {
  StrategyMetricItem,
  StrategyMetricLevelItem,
} from '@/api/marksman/strategyMetric/types'
import type { SaveStrategyMetricLevelParams } from '@/api/marksman/strategyMetric'
import {
  getLevelSelectList,
  LevelType,
  type LevelItemSelect,
} from '@/api/marksman/level'
import { ConditionMetric, GlobalStatus, SampleMode } from '@/api'
import { useLocale } from '@/contexts/LocaleContext'
import {
  emptyPlaceholder,
  getTypeLabel,
  getDriverLabel,
  getStatusTagInfo,
} from '@/utils/marksman'
import DetailForm from './DetailForm'
import RuleDetailModal from './RuleDetailModal'

/** 将 labels 对象格式化为可读字符串，避免 [object Object] */
function formatLabels(labels: unknown): string {
  if (labels == null) return '-'
  if (typeof labels === 'string') return labels === '' ? '-' : labels
  if (typeof labels === 'object' && !Array.isArray(labels) && labels !== null) {
    const entries = Object.entries(labels as Record<string, unknown>)
      .filter(([, val]) => val != null && val !== '')
      .map(([k, val]) => `${k}=${val}`)
    return entries.length > 0 ? entries.join(', ') : '-'
  }
  return String(labels)
}

const labelWidth = 140

/** 接口可能返回数字，前端统一按全局状态展示；保存时再转回数字 */
function normalizeLevelStatus(raw: number | string | undefined): GlobalStatus {
  if (raw === 1 || raw === GlobalStatus.ENABLED) return GlobalStatus.ENABLED
  if (raw === 0 || raw === GlobalStatus.DISABLED) return GlobalStatus.DISABLED
  return GlobalStatus.UNKNOWN
}

/** 接口可能返回数字，前端统一按枚举字符串展示与提交 */
function normalizeMode(raw: number | string | undefined): string {
  if (raw == null || raw === '') return SampleMode.SAMPLE_MODE_UNKNOWN
  const s = String(raw)
  if (Object.values(SampleMode).includes(s as SampleMode)) return s
  return s || SampleMode.SAMPLE_MODE_UNKNOWN
}

/** 条件为「范围」时显示两个阈值输入框 */
const RANGE_CONDITION = [
  ConditionMetric.CONDITION_METRIC_IN,
  ConditionMetric.CONDITION_METRIC_NOT_IN,
]

export interface MetricsDetailContentProps {
  strategyUID: string
}

export default function MetricsDetailContent({
  strategyUID,
}: MetricsDetailContentProps) {
  const { t } = useLocale()
  const [data, setData] = useState<StrategyMetricItem | null>(null)
  const [levels, setLevels] = useState<StrategyMetricLevelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [editingData, setEditingData] = useState<StrategyItem | null>(null)
  const [ruleDetailModalOpen, setRuleDetailModalOpen] = useState(false)
  const [editingLevelKey, setEditingLevelKey] = useState<string | null>(null)
  const [editingLevelData, setEditingLevelData] =
    useState<StrategyMetricLevelItem | null>(null)
  const [levelSaving, setLevelSaving] = useState(false)
  const [levelSelectOptions, setLevelSelectOptions] = useState<
    LevelItemSelect[]
  >([])

  const fetchData = () => {
    setLoading(true)
    getStrategyMetric(strategyUID)
      .then((detailRes) => {
        setData(detailRes)
        setLevels(detailRes?.levels ?? [])
      })
      .catch(() => {
        setData(null)
        setLevels([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    queueMicrotask(() => {
      fetchData()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchData intentionally stable per strategyUID
  }, [strategyUID])

  useEffect(() => {
    getLevelSelectList({
      limit: 100,
      status: GlobalStatus.ENABLED,
      type: LevelType.LEVEL_TYPE_ALERT,
    })
      .then((res) => setLevelSelectOptions(res?.items ?? []))
      .catch(() => setLevelSelectOptions([]))
  }, [])

  const handleEdit = (item: StrategyItem) => {
    setEditingData(item)
    setDetailFormOpen(true)
  }

  const handleFormSuccess = () => {
    setDetailFormOpen(false)
    setEditingData(null)
    fetchData()
  }

  const handleRuleDetailSuccess = () => {
    setRuleDetailModalOpen(false)
    fetchData()
  }

  const refreshLevels = () => {
    getStrategyMetric(strategyUID)
      .then((res) => setLevels(res?.levels ?? []))
      .catch(() => setLevels([]))
  }

  const handleAddLevelRow = () => {
    setLevels((prev) => [...prev, { level: {} }])
    setEditingLevelKey(`level-${levels.length}`)
    setEditingLevelData({
      status: GlobalStatus.ENABLED,
    })
  }

  const handleEditLevel = (index: number) => {
    const item = levels[index]
    const row = item
    setEditingLevelKey(`level-${index}`)
    setEditingLevelData({
      levelUID: item?.levelUID,
      mode: row?.mode,
      condition: row?.condition,
      values: row?.values,
      duration: row?.duration,
      status: row?.status,
    })
  }

  const handleSaveLevel = async () => {
    if (!data?.strategyUID || !editingLevelData) return
    const params: SaveStrategyMetricLevelParams = {
      strategyUID: data.strategyUID,
      levelUID: editingLevelData.levelUID?.trim() || undefined,
      mode:
        editingLevelData.mode &&
        editingLevelData.mode !== SampleMode.SAMPLE_MODE_UNKNOWN
          ? editingLevelData.mode
          : undefined,
      condition:
        editingLevelData.condition &&
        editingLevelData.condition !== ConditionMetric.CONDITION_METRIC_UNKNOWN
          ? editingLevelData.condition
          : undefined,
      duration: editingLevelData.duration?.trim() || undefined,
      status: editingLevelData.status,
      values: editingLevelData.values,
    }
    setLevelSaving(true)
    try {
      await saveStrategyMetricLevel(data.strategyUID, params)
      message.success(t('message.update.success'))
      setEditingLevelKey(null)
      setEditingLevelData(null)
      refreshLevels()
    } catch (err) {
      console.error('保存告警规则等级失败:', err)
      message.error(t('message.error'))
    } finally {
      setLevelSaving(false)
    }
  }

  const handleCancelEditLevel = () => {
    const key = editingLevelKey
    setEditingLevelKey(null)
    setEditingLevelData(null)
    if (key != null && key.startsWith('level-')) {
      const idx = Number(key.replace('level-', ''))
      if (
        Number.isFinite(idx) &&
        levels[idx]?.level &&
        !levels[idx].level?.uid
      ) {
        setLevels((prev) => prev.filter((_, i) => i !== idx))
      }
    }
  }

  const handleToggleLevelStatus = (index: number) => {
    const item = levels[index]
    const level = item?.level
    if (!data?.strategyUID || !level?.uid) return
    const strategyUID = data.strategyUID
    const levelUid = level.uid
    const current = normalizeLevelStatus(item?.status)
    const nextStatus =
      current === GlobalStatus.ENABLED
        ? GlobalStatus.DISABLED
        : GlobalStatus.ENABLED
    const action =
      current === GlobalStatus.ENABLED
        ? t(`common.status.${GlobalStatus.DISABLED}`)
        : t(`common.status.${GlobalStatus.ENABLED}`)
    const levelName =
      levelSelectOptions.find((o) => o.value === level.uid)?.label ?? level.uid
    Modal.confirm({
      title: t('strategy.alertLevel.confirm.status.title', { action }),
      content: t('strategy.alertLevel.confirm.status.content', {
        name: levelName,
      }),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        setLevelSaving(true)
        try {
          await updateStrategyMetricLevelStatus({
            strategyUID,
            uid: levelUid,
            status: nextStatus,
          })
          message.success(t('message.update.success'))
          refreshLevels()
        } catch (err) {
          console.error('切换告警等级状态失败:', err)
          message.error(t('message.error'))
        } finally {
          setLevelSaving(false)
        }
      },
    })
  }

  const handleDeleteLevel = (metricLevelItem: StrategyMetricLevelItem) => {
    if (!data?.strategyUID || !metricLevelItem?.levelUID) return
    const strategyUID = data.strategyUID
    const levelUid = metricLevelItem?.levelUID ?? ''
    const levelName =
      levelSelectOptions.find((o) => o.value === levelUid)?.label ?? levelUid
    Modal.confirm({
      title: t('strategy.alertLevel.confirm.delete.title'),
      content: t('strategy.alertLevel.confirm.delete.content', {
        name: levelName,
      }),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        setLevelSaving(true)
        try {
          await deleteStrategyMetricLevel(strategyUID, levelUid)
          message.success(t('message.delete.success'))
          refreshLevels()
        } catch (err) {
          console.error('删除告警等级失败:', err)
          message.error(t('message.error'))
        } finally {
          setLevelSaving(false)
        }
      },
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size='large' />
      </div>
    )
  }
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        {t('common.noData')}
      </div>
    )
  }

  const strategy = data.strategy
  if (!strategy) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        {t('common.noData')}
      </div>
    )
  }

  const info = getStatusTagInfo(strategy.status ?? GlobalStatus.UNKNOWN)

  return (
    <>
      <div className='space-y-6'>
        {/* 基础信息 */}
        <div>
          <Divider
            titlePlacement='left'
            styles={{ content: { marginInlineStart: 0 } }}
          >
            <Space>
              <span className='text-sm font-medium'>
                {t('strategy.detail.section.basic')}
              </span>
              <Button
                type='link'
                size='small'
                onClick={() => handleEdit(strategy)}
                icon={<EditOutlined />}
              />
            </Space>
          </Divider>
          <Descriptions
            column={2}
            bordered
            size='small'
            styles={{ label: { width: labelWidth, minWidth: labelWidth } }}
          >
            <Descriptions.Item label={t('strategy.detail.name')}>
              <Space>
                <span>{emptyPlaceholder(strategy.name)}</span>
                <Tag color={info.color}>{t(info.textKey)}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('strategy.detail.type')}>
              {getTypeLabel(strategy.type, t)} /{' '}
              {getDriverLabel(strategy.driver, t)}
            </Descriptions.Item>
            <Descriptions.Item label={t('strategy.detail.remark')} span={2}>
              {emptyPlaceholder(strategy.remark)}
            </Descriptions.Item>
            <Descriptions.Item label={t('strategy.detail.metadata')} span={2}>
              {strategy.metadata &&
              Object.keys(strategy.metadata).length > 0 ? (
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(strategy.metadata, null, 2)}
                </pre>
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* 规则明细 */}
        <div>
          <Divider
            titlePlacement='left'
            styles={{ content: { marginInlineStart: 0 } }}
          >
            <Space>
              <span className='text-sm font-medium'>
                {t('strategy.detail.section.ruleDetail')}
              </span>
              <Button
                type='link'
                size='small'
                onClick={() => setRuleDetailModalOpen(true)}
                icon={data.expr ? <EditOutlined /> : <PlusOutlined />}
              />
            </Space>
          </Divider>
          {data.expr ? (
            <Descriptions
              column={1}
              bordered
              size='small'
              styles={{ label: { width: labelWidth, minWidth: labelWidth } }}
            >
              <Descriptions.Item label={t('strategy.detail.expr')}>
                {emptyPlaceholder(data.expr)}
              </Descriptions.Item>
              <Descriptions.Item label={t('strategy.detail.customLabels')}>
                {formatLabels(data.labels)}
              </Descriptions.Item>
              <Descriptions.Item label={t('strategy.detail.summary')}>
                {emptyPlaceholder(data.summary)}
              </Descriptions.Item>
              <Descriptions.Item label={t('strategy.detail.description')}>
                {emptyPlaceholder(data.description)}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty />
          )}
        </div>

        {/* 告警规则等级 */}
        <div>
          <Divider
            titlePlacement='left'
            styles={{ content: { marginInlineStart: 0 } }}
          >
            <Space>
              <span className='text-sm font-medium'>
                {t('strategy.detail.section.alertLevel')}
              </span>
              <Button
                type='link'
                size='small'
                disabled={editingLevelKey != null}
                onClick={handleAddLevelRow}
                icon={<PlusOutlined />}
              />
            </Space>
          </Divider>
          <Table<StrategyMetricLevelItem>
            size='small'
            bordered
            tableLayout='fixed'
            rowKey={(record) =>
              record.levelUID ??
              `level-${record.strategyUID ?? ''}-${record.levelUID ?? ''}-${record.duration ?? ''}`
            }
            pagination={false}
            loading={levelSaving}
            dataSource={levels}
            columns={
              [
                {
                  title: t('strategy.detail.level'),
                  dataIndex: ['levelUID'],
                  key: 'level',
                  render: (
                    v: string | undefined,
                    _r: StrategyMetricLevelItem,
                    index: number,
                  ) => {
                    const isEditing = editingLevelKey === `level-${index}`
                    const val = isEditing ? editingLevelData?.levelUID : v
                    if (isEditing) {
                      const usedUids = new Set(
                        levels
                          .map((item, i) =>
                            i === index
                              ? null
                              : (item?.levelUID ??
                                (item as { uid?: string })?.uid),
                          )
                          .filter(
                            (uid): uid is string => uid != null && uid !== '',
                          ),
                      )
                      return (
                        <Select
                          className='w-full'
                          placeholder={t(
                            'strategy.alertLevel.levelUID.placeholder',
                          )}
                          value={val || undefined}
                          onChange={(s) =>
                            setEditingLevelData((prev) =>
                              prev
                                ? { ...prev, levelUID: s ?? undefined }
                                : { levelUID: s ?? undefined },
                            )
                          }
                          options={levelSelectOptions
                            .filter((o) => o.value != null && o.value !== '')
                            .map((o) => ({
                              value: o.value!,
                              label: o.label ?? o.value,
                              disabled: o.disabled || usedUids.has(o.value!),
                            }))}
                          optionFilterProp='label'
                          showSearch
                          filterOption={(input, opt) =>
                            (opt?.label ?? '')
                              .toString()
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      )
                    }
                    const label = levelSelectOptions.find(
                      (o) => o.value === v,
                    )?.label
                    return label ?? emptyPlaceholder(v)
                  },
                },
                {
                  title: t('strategy.detail.mode'),
                  dataIndex: ['mode'],
                  key: 'mode',
                  minWidth: 140,
                  align: 'center',
                  render: (
                    v: number | string | undefined,
                    _r: StrategyMetricLevelItem,
                    index: number,
                  ) => {
                    const isEditing = editingLevelKey === `level-${index}`
                    const rawVal = isEditing ? editingLevelData?.mode : v
                    const strVal = normalizeMode(rawVal)
                    if (isEditing) {
                      return (
                        <Select
                          className='w-full'
                          placeholder={t(
                            'strategy.alertLevel.mode.placeholder',
                          )}
                          value={
                            strVal === SampleMode.SAMPLE_MODE_UNKNOWN
                              ? undefined
                              : strVal
                          }
                          onChange={(s) =>
                            setEditingLevelData((prev) =>
                              prev
                                ? { ...prev, mode: s as SampleMode }
                                : { mode: s as SampleMode },
                            )
                          }
                          options={Object.values(SampleMode)
                            .filter((m) => m !== SampleMode.SAMPLE_MODE_UNKNOWN)
                            .map((m) => ({
                              value: m,
                              label: t(`strategy.sampleMode.${m}`),
                            }))}
                        />
                      )
                    }
                    return (
                      t(`strategy.sampleMode.${strVal}`) || emptyPlaceholder(v)
                    )
                  },
                },
                {
                  title: t('strategy.detail.condition'),
                  dataIndex: ['condition'],
                  key: 'condition',
                  minWidth: 140,
                  align: 'center',
                  render: (
                    v: number | string | undefined,
                    _r: StrategyMetricLevelItem,
                    index: number,
                  ) => {
                    const isEditing = editingLevelKey === `level-${index}`
                    const rawVal = isEditing ? editingLevelData?.condition : v
                    if (isEditing) {
                      return (
                        <Select
                          className='w-full'
                          placeholder={t(
                            'strategy.alertLevel.condition.placeholder',
                          )}
                          value={rawVal}
                          onChange={(s) =>
                            setEditingLevelData((prev) =>
                              prev
                                ? { ...prev, condition: s as ConditionMetric }
                                : { condition: s as ConditionMetric },
                            )
                          }
                          options={Object.values(ConditionMetric)
                            .filter(
                              (c) =>
                                c !== ConditionMetric.CONDITION_METRIC_UNKNOWN,
                            )
                            .map((c) => ({
                              value: c,
                              label: t(`strategy.conditionMetric.${c}`),
                            }))}
                        />
                      )
                    }
                    return (
                      t(`strategy.conditionMetric.${rawVal}`) ||
                      emptyPlaceholder(v)
                    )
                  },
                },
                {
                  title: t('strategy.detail.threshold'),
                  dataIndex: ['values'],
                  key: 'values',
                  minWidth: 200,
                  align: 'right',
                  render: (
                    v: number[] | undefined,
                    _r: StrategyMetricLevelItem,
                    index: number,
                  ) => {
                    const isEditing = editingLevelKey === `level-${index}`
                    const val = isEditing ? editingLevelData?.values : v
                    const condition = isEditing
                      ? editingLevelData?.condition
                      : ConditionMetric.CONDITION_METRIC_UNKNOWN
                    const isRange = RANGE_CONDITION.includes(
                      condition ?? ConditionMetric.CONDITION_METRIC_UNKNOWN,
                    )
                    if (isEditing && isRange) {
                      return (
                        <Space.Compact className='w-full'>
                          <InputNumber
                            controls={false}
                            className='flex-1'
                            placeholder={t(
                              'strategy.alertLevel.values.rangeMin',
                            )}
                            value={val?.[0]}
                            onChange={(n) =>
                              setEditingLevelData((prev) => {
                                const cur = prev?.values ?? []
                                const next = [n ?? cur[0], cur[1]].filter(
                                  (x): x is number =>
                                    x != null && Number.isFinite(x),
                                )
                                return prev
                                  ? {
                                      ...prev,
                                      values: next.length ? next : undefined,
                                    }
                                  : { values: next.length ? next : undefined }
                              })
                            }
                          />
                          <InputNumber
                            controls={false}
                            className='flex-1'
                            placeholder={t(
                              'strategy.alertLevel.values.rangeMax',
                            )}
                            value={val?.[1]}
                            onChange={(n) =>
                              setEditingLevelData((prev) => {
                                const cur = prev?.values ?? []
                                const next = [cur[0], n ?? cur[1]].filter(
                                  (x): x is number =>
                                    x != null && Number.isFinite(x),
                                )
                                return prev
                                  ? {
                                      ...prev,
                                      values: next.length ? next : undefined,
                                    }
                                  : { values: next.length ? next : undefined }
                              })
                            }
                          />
                        </Space.Compact>
                      )
                    }
                    if (isEditing) {
                      return (
                        <Space.Compact className='w-full'>
                          <InputNumber
                            controls={false}
                            value={val?.[0]}
                            onChange={(e) =>
                              setEditingLevelData((prev) => {
                                const cur = prev?.values ?? []
                                const next = [e ?? cur[0], cur[1]].filter(
                                  (x): x is number =>
                                    x != null && Number.isFinite(x),
                                )
                                return prev
                                  ? { ...prev, values: next }
                                  : { values: next }
                              })
                            }
                            className='flex-1'
                            placeholder={t(
                              'strategy.alertLevel.values.placeholder',
                            )}
                          />
                        </Space.Compact>
                      )
                    }
                    return val?.length ? val.join(', ') : emptyPlaceholder(v)
                  },
                },
                {
                  title: t('strategy.detail.duration'),
                  dataIndex: ['duration'],
                  key: 'duration',
                  width: 120,
                  align: 'right',
                  render: (
                    v: string | undefined,
                    _r: StrategyMetricLevelItem,
                    index: number,
                  ) => {
                    const isEditing = editingLevelKey === `level-${index}`
                    const val = isEditing ? editingLevelData?.duration : v
                    if (isEditing) {
                      return (
                        <Input
                          value={val ?? ''}
                          onChange={(e) =>
                            setEditingLevelData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    duration: e.target.value || undefined,
                                  }
                                : { duration: e.target.value || undefined },
                            )
                          }
                          placeholder={t(
                            'strategy.alertLevel.duration.placeholder',
                          )}
                        />
                      )
                    }
                    return emptyPlaceholder(v)
                  },
                },
                {
                  title: t('strategy.detail.status'),
                  dataIndex: ['status'],
                  key: 'status',
                  width: 80,
                  align: 'center',
                  render: (
                    v: number | undefined,
                    _r: StrategyMetricLevelItem,
                    index: number,
                  ) => {
                    const isEditing = editingLevelKey === `level-${index}`
                    const numVal = isEditing ? editingLevelData?.status : v
                    const globalVal = normalizeLevelStatus(numVal)
                    const checked = globalVal === GlobalStatus.ENABLED
                    return (
                      <Tag color={checked ? 'green' : 'red'}>
                        {checked
                          ? t(`common.status.${GlobalStatus.ENABLED}`)
                          : t(`common.status.${GlobalStatus.DISABLED}`)}
                      </Tag>
                    )
                  },
                },
                {
                  title: t('table.action'),
                  key: 'action',
                  width: 200,
                  fixed: 'right',
                  align: 'center',
                  render: (
                    _: unknown,
                    metricLevelItem: StrategyMetricLevelItem,
                    index: number,
                  ) => {
                    const isEditing = editingLevelKey === `level-${index}`
                    const isEnabled =
                      normalizeLevelStatus(metricLevelItem?.status) ===
                      GlobalStatus.ENABLED
                    return (
                      <Space size='small'>
                        {isEditing ? (
                          <>
                            <Button
                              type='link'
                              size='small'
                              loading={levelSaving}
                              onClick={handleSaveLevel}
                              icon={<SaveOutlined />}
                            >
                              {t('common.save')}
                            </Button>
                            <Button
                              type='link'
                              size='small'
                              disabled={levelSaving}
                              onClick={handleCancelEditLevel}
                            >
                              {t('common.cancel')}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type='link'
                              size='small'
                              onClick={() => handleEditLevel(index)}
                            >
                              {t('common.edit')}
                            </Button>
                            <Button
                              type='link'
                              size='small'
                              loading={levelSaving}
                              danger={isEnabled}
                              style={
                                !isEnabled
                                  ? { color: 'var(--ant-color-success)' }
                                  : undefined
                              }
                              onClick={() => handleToggleLevelStatus(index)}
                            >
                              {isEnabled
                                ? t(`common.status.${GlobalStatus.DISABLED}`)
                                : t(`common.status.${GlobalStatus.ENABLED}`)}
                            </Button>
                            <Button
                              type='link'
                              size='small'
                              loading={levelSaving}
                              danger
                              onClick={() => handleDeleteLevel(metricLevelItem)}
                            >
                              {t('common.delete')}
                            </Button>
                          </>
                        )}
                      </Space>
                    )
                  },
                },
              ] as ColumnsType<StrategyMetricLevelItem>
            }
          />
        </div>
      </div>

      <RuleDetailModal
        open={ruleDetailModalOpen}
        strategyUID={strategyUID}
        initialData={data}
        onCancel={() => setRuleDetailModalOpen(false)}
        onSuccess={handleRuleDetailSuccess}
      />
      <DetailForm
        open={detailFormOpen}
        mode='edit'
        initialData={editingData}
        onCancel={() => {
          setDetailFormOpen(false)
          setEditingData(null)
        }}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
