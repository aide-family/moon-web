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
        const params: CreateNamespaceParams = {
          name: values.name,
        }
        // TODO: 接口通后取消注释
        // await createNamespace(params)
        console.log('创建命名空间:', params)
        message.success(t('message.create.success'))
      } else if (mode === 'edit' && initialData) {
        const params: UpdateNamespaceParams = {
          name: values.name,
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
      title={mode === 'create' ? t('modal.create.title') : t('modal.edit.title')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('modal.ok')}
      cancelText={t('modal.cancel')}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label={t('form.name.label')}
          name="name"
          rules={[
            {
              required: true,
              message: t('form.name.required'),
            },
            {
              max: 100,
              message: t('form.name.maxLength'),
            },
          ]}
        >
          <Input placeholder={t('form.name.placeholder')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
