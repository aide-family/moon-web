import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import type { CreateWebhookParams, UpdateWebhookParams, WebhookItem } from '@/api/rabbit/webhook/index'
import { createWebhook, updateWebhook } from '@/api/rabbit/webhook/index'
import { useLocale } from '@/contexts/LocaleContext'
import { getAppOptions, getAppIconType, getMethodOptions } from '../constants'
import { IconFont } from '@/components/Icon/IconFont'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: WebhookItem | null
  onCancel: () => void
  onSuccess: () => void
}

const DetailForm: React.FC<DetailFormProps> = ({ open, mode, initialData, onCancel, onSuccess }) => {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 设置表单初始值
  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name,
        app: initialData.app,
        url: initialData.url,
        method: initialData.method,
        secret: initialData.secret === '******' ? '' : initialData.secret,
        headers: initialData.headers ? JSON.stringify(initialData.headers, null, 2) : '',
      })
    } else if (open && mode === 'create') {
      // 新增模式，重置表单
      form.resetFields()
    }
  }, [open, mode, initialData, form])

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // 解析 headers
      let headers: Record<string, string> | undefined = undefined
      if (values.headers && values.headers.trim()) {
        try {
          const parsed = JSON.parse(values.headers.trim())
          // 确保解析后是对象
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            message.error(t('webhook.form.headers.invalid'))
            setLoading(false)
            return
          }
          // 确保所有值都是字符串
          const stringHeaders: Record<string, string> = {}
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === 'string') {
              stringHeaders[key] = value
            } else {
              stringHeaders[key] = String(value)
            }
          }
          headers = stringHeaders
        } catch {
          message.error(t('webhook.form.headers.invalid'))
          setLoading(false)
          return
        }
      }

      if (mode === 'create') {
        const params: CreateWebhookParams = {
          name: values.name,
          app: values.app,
          url: values.url,
          method: values.method,
          secret: values.secret,
          headers,
        }
        await createWebhook(params)
        message.success(t('message.create.success'))
      } else if (mode === 'edit' && initialData) {
        const params: UpdateWebhookParams = {
          name: values.name,
          app: values.app,
          url: values.url,
          method: values.method,
          headers,
        }
        if (values.secret) {
          params.secret = values.secret
        }
        await updateWebhook(initialData.uid, params)
        message.success(t('message.update.success'))
      }

      onSuccess()
      onCancel()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('提交失败:', error)
      message.error(t('message.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel()
    form.resetFields()
  }

  return (
    <Modal
      title={mode === 'create' ? t('webhook.modal.create.title') : t('webhook.modal.edit.title')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
      width={700}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label={t('webhook.form.name.label')}
          name="name"
          rules={[
            {
              required: true,
              message: t('webhook.form.name.required'),
            },
            {
              max: 100,
              message: t('webhook.form.name.maxLength'),
            },
          ]}
        >
          <Input placeholder={t('webhook.form.name.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('webhook.form.app.label')}
          name="app"
          rules={[
            {
              required: true,
              message: t('webhook.form.app.required'),
            },
          ]}
        >
          <Select
            placeholder={t('webhook.form.app.placeholder')}
            style={{ width: '100%' }}
            options={getAppOptions(t).map(opt => ({
              value: opt.value,
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <IconFont type={getAppIconType(opt.value)} />
                  {opt.label}
                </span>
              ),
            }))}
          />
        </Form.Item>
        <Form.Item
          label={t('webhook.form.url.label')}
          name="url"
          rules={[
            {
              required: true,
              message: t('webhook.form.url.required'),
            },
            {
              type: 'url',
              message: t('webhook.form.url.invalid'),
            },
          ]}
        >
          <Input placeholder={t('webhook.form.url.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('webhook.form.method.label')}
          name="method"
          rules={[
            {
              required: true,
              message: t('webhook.form.method.required'),
            },
          ]}
        >
          <Select
            placeholder={t('webhook.form.method.placeholder')}
            style={{ width: '100%' }}
            options={getMethodOptions(t)}
          />
        </Form.Item>
        <Form.Item
          label={t('webhook.form.secret.label')}
          name="secret"
          rules={[
            {
              required: mode === 'create',
              message: t('webhook.form.secret.required'),
            },
          ]}
        >
          <Input.Password placeholder={t('webhook.form.secret.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('webhook.form.headers.label')}
          name="headers"
          help={t('webhook.form.headers.help')}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.resolve()
                }
                try {
                  const parsed = JSON.parse(value.trim())
                  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                    return Promise.reject(new Error(t('webhook.form.headers.invalid')))
                  }
                  return Promise.resolve()
                } catch {
                  return Promise.reject(new Error(t('webhook.form.headers.invalid')))
                }
              },
            },
          ]}
        >
          <Input.TextArea
            placeholder={t('webhook.form.headers.placeholder')}
            rows={6}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
