import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import type { CreateTemplateParams, UpdateTemplateParams, TemplateItem } from '@/api/template/index'
import { createTemplate, updateTemplate } from '@/api/template/index'
import { useLocale } from '@/contexts/LocaleContext'
import { getAppOptions } from '../constants'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: TemplateItem | null
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
        jsonData: initialData.jsonData ? JSON.stringify(JSON.parse(initialData.jsonData), null, 2) : '',
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

      // 解析 jsonData
      let jsonData: string | undefined = undefined
      if (values.jsonData && values.jsonData.trim()) {
        try {
          const parsed = JSON.parse(values.jsonData.trim())
          // 确保解析后是对象
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            message.error(t('template.form.jsonData.invalid'))
            setLoading(false)
            return
          }
          jsonData = JSON.stringify(parsed)
        } catch (error) {
          message.error(t('template.form.jsonData.invalid'))
          setLoading(false)
          return
        }
      }

      if (mode === 'create') {
        const params: CreateTemplateParams = {
          name: values.name,
          app: values.app,
          jsonData,
        }
        // TODO: 接口通后取消注释
        // await createTemplate(params)
        console.log('创建模板:', params)
        message.success(t('message.create.success'))
      } else if (mode === 'edit' && initialData) {
        const params: UpdateTemplateParams = {
          name: values.name,
          app: values.app,
          jsonData,
        }
        // TODO: 接口通后取消注释
        // await updateTemplate(initialData.uid, params)
        console.log('更新模板:', initialData.uid, params)
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
      title={mode === 'create' ? t('template.modal.create.title') : t('template.modal.edit.title')}
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
          label={t('template.form.name.label')}
          name="name"
          rules={[
            {
              required: true,
              message: t('template.form.name.required'),
            },
            {
              max: 100,
              message: t('template.form.name.maxLength'),
            },
          ]}
        >
          <Input placeholder={t('template.form.name.placeholder')} />
        </Form.Item>
        <Form.Item
          label={t('template.form.app.label')}
          name="app"
          rules={[
            {
              required: true,
              message: t('template.form.app.required'),
            },
          ]}
        >
          <Select
            placeholder={t('template.form.app.placeholder')}
            style={{ width: '100%' }}
            options={getAppOptions(t)}
          />
        </Form.Item>
        <Form.Item
          label={t('template.form.jsonData.label')}
          name="jsonData"
          help={t('template.form.jsonData.help')}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.resolve()
                }
                try {
                  const parsed = JSON.parse(value.trim())
                  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                    return Promise.reject(new Error(t('template.form.jsonData.invalid')))
                  }
                  return Promise.resolve()
                } catch {
                  return Promise.reject(new Error(t('template.form.jsonData.invalid')))
                }
              },
            },
          ]}
        >
          <Input.TextArea
            placeholder={t('template.form.jsonData.placeholder')}
            rows={8}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
