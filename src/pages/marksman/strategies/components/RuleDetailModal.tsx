import React from 'react'
import { Modal, Form, Input, message, Button, Space } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useRequest, useMemoizedFn } from 'ahooks'
import { saveStrategyMetric } from '@/api/marksman/strategyMetric'
import type {
  StrategyMetricItem,
  SaveStrategyMetricParams,
} from '@/api/marksman/strategyMetric'
import { getDatasourceSelectList } from '@/api/marksman/datasource'
import { useLocale } from '@/contexts/LocaleContext'
import DatasourceFilterForm from './DatasourceFilterForm'
import {
  datasourceFilterToForm,
  formToDatasourceFilter,
} from '../utils/datasourceFilter'

interface RuleDetailModalProps {
  open: boolean
  strategyUID: string | undefined
  initialData?: StrategyMetricItem | null
  onCancel: () => void
  onSuccess: () => void
}

/** 将 labels 对象转为 Form.List 数据 [{ key, value }] */
function labelsToFields(
  labels: Record<string, string> | undefined,
): { key: string; value: string }[] {
  if (!labels || Object.keys(labels).length === 0) return []
  return Object.entries(labels).map(([key, value]) => ({ key, value }))
}

/** 将 Form.List 数据转为 labels 对象，过滤空 key */
function fieldsToLabels(
  fields: { key?: string; value?: string }[] | undefined,
): Record<string, string> | undefined {
  if (!fields?.length) return undefined
  const obj: Record<string, string> = {}
  for (const { key, value } of fields) {
    const k = key?.trim()
    if (k) obj[k] = value?.trim() ?? ''
  }
  return Object.keys(obj).length > 0 ? obj : undefined
}

const RuleDetailModal: React.FC<RuleDetailModalProps> = ({
  open,
  strategyUID,
  initialData,
  onCancel,
  onSuccess,
}) => {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [saving, setSaving] = React.useState(false)

  const { data: datasourceSelectData } = useRequest(
    () => getDatasourceSelectList({ limit: 100 }),
    { ready: open, refreshDeps: [open] },
  )

  const datasourceOptions = React.useMemo(
    () =>
      (datasourceSelectData?.items ?? []).map((item) => ({
        value: item.value ?? '',
        label: item.label ?? item.value ?? '',
      })),
    [datasourceSelectData],
  )

  React.useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        expr: initialData.expr ?? '',
        summary: initialData.summary ?? '',
        description: initialData.description ?? '',
        labels: labelsToFields(initialData.labels),
        datasourceFilter: datasourceFilterToForm(initialData.datasourceFilter),
      })
    } else if (open) {
      form.resetFields()
    }
  }, [open, initialData, form])

  const handleSubmit = useMemoizedFn(async () => {
    if (!strategyUID) return
    try {
      const values = await form.validateFields()
      const labels = fieldsToLabels(values.labels)
      const datasourceFilter = formToDatasourceFilter(values.datasourceFilter)
      const params: SaveStrategyMetricParams = {
        strategyUID,
        expr: values.expr?.trim() || undefined,
        summary: values.summary?.trim() || undefined,
        description: values.description?.trim() || undefined,
        labels: labels && Object.keys(labels).length > 0 ? labels : undefined,
        datasourceFilter,
      }
      setSaving(true)
      await saveStrategyMetric(strategyUID, params)
      message.success(t('message.update.success'))
      onSuccess()
      onCancel()
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'errorFields' in err &&
        Array.isArray((err as { errorFields?: unknown[] }).errorFields)
      ) {
        return
      }
      console.error('保存规则明细失败:', err)
    } finally {
      setSaving(false)
    }
  })

  const handleCancel = useMemoizedFn(() => {
    form.resetFields()
    onCancel()
  })

  return (
    <Modal
      title={t('strategy.ruleDetail.modal.title')}
      open={open}
      onOk={() => void handleSubmit()}
      onCancel={handleCancel}
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
      confirmLoading={saving}
      destroyOnHidden
      width={720}
    >
      <Form form={form} layout='vertical'>
        <DatasourceFilterForm datasourceOptions={datasourceOptions} />
        <Form.Item
          name='expr'
          label={t('strategy.detail.expr')}
          rules={[{ required: false }]}
        >
          <Input.TextArea
            rows={2}
            placeholder={t('strategy.ruleDetail.expr.placeholder')}
          />
        </Form.Item>
        <Form.Item name='summary' label={t('strategy.detail.summary')}>
          <Input placeholder={t('strategy.ruleDetail.summary.placeholder')} />
        </Form.Item>
        <Form.Item name='description' label={t('strategy.detail.description')}>
          <Input.TextArea
            rows={2}
            placeholder={t('strategy.ruleDetail.description.placeholder')}
          />
        </Form.Item>
        <Form.Item label={t('strategy.detail.customLabels')}>
          <Form.List name='labels'>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align='baseline'
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'key']}
                      rules={[
                        {
                          required: true,
                          message: t('strategy.ruleDetail.labels.keyRequired'),
                        },
                      ]}
                      style={{ marginBottom: 0, width: 200 }}
                    >
                      <Input
                        placeholder={t(
                          'strategy.ruleDetail.labels.keyPlaceholder',
                        )}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'value']}
                      style={{ marginBottom: 0, width: 420 }}
                    >
                      <Input
                        placeholder={t(
                          'strategy.ruleDetail.labels.valuePlaceholder',
                        )}
                      />
                    </Form.Item>
                    <Button
                      type='text'
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      aria-label={t('common.delete')}
                    />
                  </Space>
                ))}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type='dashed'
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    {t('strategy.ruleDetail.labels.addField')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RuleDetailModal
