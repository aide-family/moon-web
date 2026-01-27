import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import type { CreateNamespaceParams, UpdateNamespaceParams, NamespaceItem } from '@/api/namespace/index'
import { createNamespace, updateNamespace } from '@/api/namespace/index'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: NamespaceItem | null
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
        metadata: initialData.metadata ? JSON.stringify(initialData.metadata, null, 2) : '',
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

      // 解析元数据
      let metadata: Record<string, unknown> | undefined = undefined
      if (values.metadata && values.metadata.trim()) {
        try {
          metadata = JSON.parse(values.metadata.trim())
          // 确保解析后是对象
          if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
            message.error(t('message.error'))
            setLoading(false)
            return
          }
        } catch (error) {
          setLoading(false)
          return
        }
      }

      if (mode === 'create') {
        const params: CreateNamespaceParams = {
          name: values.name,
          metadata,
        }
        // TODO: 接口通后取消注释
        // await createNamespace(params)
        console.log('创建命名空间:', params)
        message.success(t('message.create.success'))
      } else if (mode === 'edit' && initialData) {
        const params: UpdateNamespaceParams = {
          name: values.name,
          metadata,
        }
        // TODO: 接口通后取消注释
        // await updateNamespace(initialData.uid, params)
        console.log('更新命名空间:', initialData.uid, params)
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
      title={mode === 'create' ? t('namespace.modal.create.title') : t('namespace.modal.edit.title')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label={t('namespace.form.name.label')}
          name="name"
          rules={[
            {
              required: true,
              message: t('namespace.form.name.required'),
            },
            {
              max: 100,
              message: t('namespace.form.name.maxLength'),
            },
          ]}
        >
          <Input placeholder={t('namespace.form.name.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('namespace.form.metadata.label')}
          name="metadata"
          help={t('namespace.form.metadata.help')}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.resolve()
                }
                try {
                  const parsed = JSON.parse(value.trim())
                  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                    return Promise.reject(new Error(t('namespace.form.metadata.invalid')))
                  }
                  return Promise.resolve()
                } catch {
                  return Promise.reject(new Error(t('namespace.form.metadata.invalid')))
                }
              },
            },
          ]}
        >
          <Input.TextArea
            placeholder={t('namespace.form.metadata.placeholder')}
            rows={6}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
