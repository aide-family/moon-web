import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, message } from 'antd'
import type { CreateEmailParams, UpdateEmailParams, EmailItem } from '@/api/email/index'
import { createEmail, updateEmail } from '@/api/email/index'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: EmailItem | null
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
        host: initialData.host,
        port: initialData.port,
        username: initialData.username,
        password: initialData.password === '******' ? '' : initialData.password,
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

      if (mode === 'create') {
        const params: CreateEmailParams = {
          name: values.name,
          host: values.host,
          port: values.port,
          username: values.username,
          password: values.password,
        }
        await createEmail(params)
        message.success(t('message.create.success'))
      } else if (mode === 'edit' && initialData) {
        const params: UpdateEmailParams = {
          name: values.name,
          host: values.host,
          port: values.port,
          username: values.username,
        }
        if (values.password) {
          params.password = values.password
        }
        await updateEmail(initialData.uid, params)
        message.success(t('message.update.success'))
      }

      onSuccess()
      handleCancel()
    } catch (error) {
      console.error('提交失败:', error)
      // 错误信息已由 API 拦截器处理
    } finally {
      setLoading(false)
    }
  }

  // 处理取消
  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={mode === 'create' ? t('email.modal.create.title') : t('email.modal.edit.title')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label={t('email.form.name.label')}
          name="name"
          rules={[
            {
              required: true,
              message: t('email.form.name.required'),
            },
            {
              max: 100,
              message: t('email.form.name.maxLength'),
            },
          ]}
        >
          <Input placeholder={t('email.form.name.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('email.form.host.label')}
          name="host"
          rules={[
            {
              required: true,
              message: t('email.form.host.required'),
            },
          ]}
        >
          <Input placeholder={t('email.form.host.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('email.form.port.label')}
          name="port"
          rules={[
            {
              required: true,
              message: t('email.form.port.required'),
            },
            {
              type: 'number',
              min: 1,
              max: 65535,
              message: t('email.form.port.range'),
            },
          ]}
        >
          <InputNumber
            placeholder={t('email.form.port.placeholder')}
            style={{ width: '100%' }}
            min={1}
            max={65535}
          />
        </Form.Item>
        <Form.Item
          label={t('email.form.username.label')}
          name="username"
          rules={[
            {
              required: true,
              message: t('email.form.username.required'),
            },
            {
              type: 'email',
              message: t('email.form.username.emailFormat'),
            },
          ]}
        >
          <Input placeholder={t('email.form.username.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('email.form.password.label')}
          name="password"
          rules={[
            {
              required: mode === 'create',
              message: t('email.form.password.required'),
            },
          ]}
        >
          <Input.Password placeholder={t('email.form.password.placeholder')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
