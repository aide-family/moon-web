import React, { useEffect, useState, useMemo } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import type { CreateDatasourceParams, UpdateDatasourceParams, DatasourceItem } from '@/api/marksman/datasource/index'
import { createDatasource, updateDatasource, DatasourceType, DatasourceDriver } from '@/api/marksman/datasource/index'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: DatasourceItem | null
  onCancel: () => void
  onSuccess: (created?: DatasourceItem) => void
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

  const typeOptions = useMemo(() =>
    Object.values(DatasourceType).map(value => ({ value, label: t(`datasource.type.${value}`) })), [t])

  const driverOptions = useMemo(() =>
    Object.values(DatasourceDriver).map(value => ({ value, label: t(`datasource.driver.${value}`) })), [t])

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name ?? '',
        type: initialData.type,
        driver: initialData.driver,
        url: initialData.url ?? '',
        remark: initialData.remark ?? '',
        metadata: initialData.metadata
          ? JSON.stringify(initialData.metadata, null, 2)
          : '',
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
        const params: CreateDatasourceParams = {
          name: values.name?.trim() || undefined,
          type: values.type,
          driver: values.driver,
          url: values.url?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          metadata,
        }
        const created = await createDatasource(params)
        message.success(t('message.create.success'))
        onSuccess(created)
      } else if (mode === 'edit' && initialData?.uid) {
        const params: UpdateDatasourceParams = {
          name: values.name?.trim() || undefined,
          type: values.type,
          driver: values.driver,
          url: values.url?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          metadata,
        }
        await updateDatasource(initialData.uid, params)
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
      title={mode === 'create' ? t('datasource.modal.create.title') : t('datasource.modal.edit.title')}
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
          label={t('datasource.form.name.label')}
          rules={[{ required: true, message: t('datasource.form.name.placeholder') }]}
        >
          <Input placeholder={t('datasource.form.name.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name="type" label={t('datasource.form.type.label')}>
          <Select allowClear placeholder={t('table.search.placeholder')} options={typeOptions} />
        </Form.Item>
        <Form.Item name="driver" label={t('datasource.form.driver.label')}>
          <Select allowClear placeholder={t('table.search.placeholder')} options={driverOptions} />
        </Form.Item>
        <Form.Item name="url" label={t('datasource.form.url.label')}>
          <Input placeholder={t('datasource.form.url.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name="remark" label={t('datasource.form.remark.label')}>
          <Input.TextArea rows={2} placeholder={t('datasource.form.remark.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name="metadata" label={t('datasource.form.metadata.label')}>
          <Input.TextArea rows={4} placeholder={t('datasource.form.metadata.placeholder')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
