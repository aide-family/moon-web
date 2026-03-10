import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import type {
  CreateStrategyGroupParams,
  UpdateStrategyGroupParams,
  StrategyGroupItem,
} from '@/api/strategyGroup'
import { createStrategyGroup, updateStrategyGroup } from '@/api/strategyGroup'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: StrategyGroupItem | null
  onCancel: () => void
  onSuccess: (created?: StrategyGroupItem) => void
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

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name ?? '',
        remark: initialData.remark ?? '',
        metadata: initialData.metadata ? JSON.stringify(initialData.metadata, null, 2) : '',
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [open, mode, initialData, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      let metadata: Record<string, string> | undefined
      if (values.metadata && String(values.metadata).trim()) {
        try {
          const parsed = JSON.parse(String(values.metadata).trim())
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            metadata = Object.fromEntries(
              Object.entries(parsed).map(([k, v]) => [k, String(v)])
            )
          }
        } catch {
          message.error(t('message.error'))
          setLoading(false)
          return
        }
      }

      if (mode === 'create') {
        const params: CreateStrategyGroupParams = {
          name: values.name?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          metadata,
        }
        const created = await createStrategyGroup(params)
        message.success(t('message.create.success'))
        onSuccess(created)
      } else if (mode === 'edit' && initialData?.uid) {
        const params: UpdateStrategyGroupParams = {
          name: values.name?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          metadata,
        }
        await updateStrategyGroup(initialData.uid, params)
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
      title={
        mode === 'create'
          ? t('strategyGroup.modal.create.title')
          : t('strategyGroup.modal.edit.title')
      }
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
          label={t('strategyGroup.form.name.label')}
          rules={[{ required: true, message: t('strategyGroup.form.name.placeholder') }]}
        >
          <Input placeholder={t('strategyGroup.form.name.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name="remark" label={t('strategyGroup.form.remark.label')}>
          <Input.TextArea
            rows={2}
            placeholder={t('strategyGroup.form.remark.placeholder')}
            allowClear
          />
        </Form.Item>
        <Form.Item name="metadata" label={t('strategyGroup.form.metadata.label')}>
          <Input.TextArea
            rows={4}
            placeholder={t('strategyGroup.form.metadata.placeholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
