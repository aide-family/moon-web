import React, { useEffect, useState, useMemo } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import type { CreateStrategyParams, UpdateStrategyParams, StrategyItem } from '@/api/strategy/index'
import { createStrategy, updateStrategy } from '@/api/strategy/index'
import { DatasourceType, DatasourceDriver } from '@/api/datasource/index'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: StrategyItem | null
  onCancel: () => void
  onSuccess: (created?: StrategyItem) => void
  closable?: boolean
}

const DetailForm: React.FC<DetailFormProps> = ({
  open,
  mode,
  initialData,
  onCancel,
  onSuccess,
  closable = true,
}) => {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const typeOptions = useMemo(
    () => Object.values(DatasourceType).map(value => ({ value, label: t(`datasource.type.${value}`) })),
    [t]
  )
  const driverOptions = useMemo(
    () => Object.values(DatasourceDriver).map(value => ({ value, label: t(`datasource.driver.${value}`) })),
    [t]
  )

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name ?? '',
        remark: initialData.remark ?? '',
        type: initialData.type,
        driver: initialData.driver,
        strategyGroupUID: initialData.strategyGroupUID ?? '',
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [open, mode, initialData, form])

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
          strategyGroupUID: values.strategyGroupUID?.trim() || undefined,
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
          strategyGroupUID: values.strategyGroupUID?.trim() || undefined,
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
      destroyOnClose
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
        <Form.Item name="remark" label={t('strategy.form.remark.label')}>
          <Input.TextArea rows={2} placeholder={t('strategy.form.remark.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name="type" label={t('strategy.form.type.label')}>
          <Select allowClear placeholder={t('table.search.placeholder')} options={typeOptions} />
        </Form.Item>
        <Form.Item name="driver" label={t('strategy.form.driver.label')}>
          <Select allowClear placeholder={t('table.search.placeholder')} options={driverOptions} />
        </Form.Item>
        <Form.Item name="strategyGroupUID" label={t('strategy.form.strategyGroupUID.label')}>
          <Input placeholder={t('strategy.form.strategyGroupUID.placeholder')} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
