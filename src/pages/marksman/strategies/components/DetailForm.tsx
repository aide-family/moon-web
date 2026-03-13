import React, { useEffect, useState, useMemo } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import type { CreateStrategyParams, UpdateStrategyParams, StrategyItem } from '@/api/marksman/strategy/index'
import { createStrategy, updateStrategy } from '@/api/marksman/strategy/index'
import { DatasourceType, DatasourceDriver } from '@/api/marksman/datasource/index'
import { getStrategyGroupSelectList } from '@/api/marksman/strategyGroup'

/** 类型与可选驱动的对应关系（驱动只能选择该类型下的）；未知类型/驱动不参与展示 */
const TYPE_DRIVER_MAP: Record<string, string[]> = {
  [DatasourceType.METRICS]: [DatasourceDriver.METRICS_PROMETHEUS, DatasourceDriver.METRICS_VICTORIA_METRICS],
  [DatasourceType.LOGS]: [DatasourceDriver.LOGS_ELASTICSEARCH],
  [DatasourceType.TRACE]: [DatasourceDriver.TRACE_JAEGER],
}
import type { StrategyGroupItemSelect } from '@/api/marksman/strategyGroup'
import { useLocale } from '@/contexts/LocaleContext'
import { GlobalStatus } from '@/api'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: StrategyItem | null
  /** 新增时默认策略组 UID（传入则自动带入表单，策略组仍可修改） */
  defaultStrategyGroupUID?: string | null
  onCancel: () => void
  onSuccess: (created?: StrategyItem) => void
  closable?: boolean
}

const DetailForm: React.FC<DetailFormProps> = ({
  open,
  mode,
  initialData,
  defaultStrategyGroupUID,
  onCancel,
  onSuccess,
  closable = true,
}) => {
  const isEditWithUid = mode === 'edit' && !!initialData?.uid
  /** 仅编辑时隐藏策略组（创建时始终展示，默认选中可修改） */
  const hideStrategyGroupSelect = isEditWithUid
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [strategyGroupOptions, setStrategyGroupOptions] = useState<StrategyGroupItemSelect[]>([])

  const selectedType = Form.useWatch('type', form)
  const typeOptions = useMemo(
    () =>
      Object.values(DatasourceType)
        .filter(v => v !== DatasourceType.DatasourceType_UNKNOWN)
        .map(value => ({ value, label: t(`datasource.type.${value}`) })),
    [t]
  )
  const allDriverOptions = useMemo(
    () =>
      Object.values(DatasourceDriver)
        .filter(v => v !== DatasourceDriver.DatasourceDriver_UNKNOWN)
        .map(value => ({ value, label: t(`datasource.driver.${value}`) })),
    [t]
  )
  const driverOptions = useMemo(() => {
    const allowed = selectedType ? (TYPE_DRIVER_MAP[selectedType] ?? []) : []
    if (allowed.length === 0) return allDriverOptions
    return allDriverOptions.filter(opt => allowed.includes(opt.value))
  }, [selectedType, allDriverOptions])

  useEffect(() => {
    if (open) {
      getStrategyGroupSelectList({ limit: 50 })
        .then(res => setStrategyGroupOptions(res?.items ?? []))
        .catch(() => setStrategyGroupOptions([]))
    }
  }, [open])

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name ?? '',
        remark: initialData.remark ?? '',
        type: initialData.type,
        driver: initialData.driver,
        strategyGroupUID: initialData.strategyGroupUID ?? undefined,
      })
    } else if (open && mode === 'create') {
      form.resetFields()
      if (defaultStrategyGroupUID) {
        form.setFieldsValue({ strategyGroupUID: defaultStrategyGroupUID })
      }
    }
  }, [open, mode, initialData, defaultStrategyGroupUID, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (mode === 'create') {
        const params: CreateStrategyParams = {
          name: values.name?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          type: values.type,
          driver: values.driver,
          strategyGroupUID: values.strategyGroupUID || undefined,
          status: GlobalStatus.ENABLED,
        }
        const created = await createStrategy(params)
        message.success(t('message.create.success'))
        onSuccess(created)
      } else if (mode === 'edit' && initialData?.uid) {
        const params: UpdateStrategyParams = {
          name: values.name?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          type: values.type,
          driver: values.driver,
          strategyGroupUID: values.strategyGroupUID || undefined,
        }
        await updateStrategy(initialData.uid, params)
        message.success(t('message.update.success'))
        onSuccess()
      } else {
        onSuccess()
      }
      onCancel()
    } catch (err) {
      console.error('提交失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={mode === 'create' ? t('strategy.modal.create.title') : t('strategy.modal.edit.title')}
      open={open}
      onOk={handleSubmit}
      onCancel={closable ? handleCancel : undefined}
      closable={closable}
      maskClosable={closable}
      destroyOnHidden
      confirmLoading={loading}
      okText={t('common.submit')}
      cancelButtonProps={closable ? undefined : { style: { display: 'none' } }}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label={t('strategy.form.name.label')}
          rules={[{ required: true, message: t('strategy.form.name.placeholder') }]}
        >
          <Input placeholder={t('strategy.form.name.placeholder')} allowClear />
        </Form.Item>
        <Form.Item
          name="type"
          label={t('strategy.form.type.label')}
          rules={[{ required: true, message: t('strategy.form.type.placeholder') }]}
        >
          <Select
            allowClear
            placeholder={t('strategy.form.type.placeholder')}
            options={typeOptions}
            disabled={isEditWithUid}
            onChange={newType => {
              const allowed = newType ? (TYPE_DRIVER_MAP[newType] ?? []) : []
              const currentDriver = form.getFieldValue('driver')
              if (currentDriver && allowed.length > 0 && !allowed.includes(currentDriver)) {
                form.setFieldValue('driver', undefined)
              }
            }}
          />
        </Form.Item>
        <Form.Item
          name="driver"
          label={t('strategy.form.driver.label')}
          rules={[{ required: true, message: t('strategy.form.driver.placeholder') }]}
        >
          <Select
            allowClear
            placeholder={t('strategy.form.driver.placeholder')}
            options={driverOptions}
            disabled={isEditWithUid}
          />
        </Form.Item>
        {hideStrategyGroupSelect ? (
          <Form.Item name="strategyGroupUID" hidden>
            <Input type="hidden" />
          </Form.Item>
        ) : (
          <Form.Item
            name="strategyGroupUID"
            label={t('strategy.form.strategyGroup.label')}
            rules={[{ required: true, message: t('strategy.form.strategyGroup.placeholder') }]}
          >
            <Select
              allowClear
              placeholder={t('strategy.form.strategyGroup.placeholder')}
              showSearch={{optionFilterProp: 'label'}}
              options={strategyGroupOptions.map(item => ({
                value: item.value,
                label: item.label ?? item.value,
                disabled: item.disabled,
              }))}
            />
          </Form.Item>
        )}
        <Form.Item name="remark" label={t('strategy.form.remark.label')}>
          <Input.TextArea rows={2} placeholder={t('strategy.form.remark.placeholder')} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
