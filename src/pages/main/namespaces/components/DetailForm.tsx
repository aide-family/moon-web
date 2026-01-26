import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import type { CreateNamespaceParams, UpdateNamespaceParams, NamespaceItem } from '@/api/namespace/index'
import { createNamespace, updateNamespace } from '@/api/namespace/index'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: NamespaceItem | null
  onCancel: () => void
  onSuccess: () => void
}

const DetailForm: React.FC<DetailFormProps> = ({ open, mode, initialData, onCancel, onSuccess }) => {
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
        message.success('创建命名空间成功')
      } else if (mode === 'edit' && initialData) {
        const params: UpdateNamespaceParams = {
          name: values.name,
        }
        // TODO: 接口通后取消注释
        // await updateNamespace(initialData.uid, params)
        console.log('更新命名空间:', initialData.uid, params)
        message.success('更新命名空间成功')
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
      title={mode === 'create' ? '新增命名空间' : '编辑命名空间'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[
            {
              max: 100,
              message: '名称长度不能超过100个字符',
            },
          ]}
        >
          <Input placeholder="请输入命名空间名称" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
