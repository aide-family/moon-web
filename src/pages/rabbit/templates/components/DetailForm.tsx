import React, { useEffect, useState } from 'react'
import { App, Modal, Form, Input, Select } from 'antd'
import type {
  CreateTemplateParams,
  UpdateTemplateParams,
  TemplateItem,
} from '@/api/rabbit/template/index'
import { createTemplate, updateTemplate } from '@/api/rabbit/template/index'
import { useLocale } from '@/contexts/LocaleContext'
import { getMessageTypeOptions } from '../constants'
import { getMessageTypeIconType } from '@/pages/rabbit/constants/appIcons'
import { IconFont } from '@/components/Icon/IconFont'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: TemplateItem | null
  onCancel: () => void
  onSuccess: () => void
}

const DetailForm: React.FC<DetailFormProps> = ({
  open,
  mode,
  initialData,
  onCancel,
  onSuccess,
}) => {
  const { t } = useLocale()
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 设置表单初始值
  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name,
        messageType: initialData.messageType,
        jsonData: initialData.jsonData
          ? JSON.stringify(JSON.parse(initialData.jsonData), null, 2)
          : '',
      })
    } else if (open && mode === 'create') {
      // 新增模式，重置表单
      form.resetFields()
    }
  }, [open, mode, initialData, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      let jsonData: string | undefined = undefined
      if (values.jsonData && values.jsonData.trim()) {
        try {
          const parsed = JSON.parse(values.jsonData.trim())
          if (
            typeof parsed !== 'object' ||
            parsed === null ||
            Array.isArray(parsed)
          ) {
            message.error(t('template.form.jsonData.invalid'))
            setLoading(false)
            return
          }
          jsonData = JSON.stringify(parsed)
        } catch {
          message.error(t('template.form.jsonData.invalid'))
          setLoading(false)
          return
        }
      }

      if (mode === 'create') {
        const params: CreateTemplateParams = {
          name: values.name,
          messageType: values.messageType,
          jsonData,
        }
        await createTemplate(params)
        message.success(t('message.create.success'))
      } else if (mode === 'edit' && initialData) {
        const params: UpdateTemplateParams = {
          name: values.name,
          messageType: values.messageType,
          jsonData,
        }
        await updateTemplate(initialData.uid, params)
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
      title={
        mode === 'create'
          ? t('template.modal.create.title')
          : t('template.modal.edit.title')
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
      width={700}
      destroyOnHidden
    >
      <Form form={form} layout='vertical' autoComplete='off'>
        <Form.Item
          label={t('template.form.name.label')}
          name='name'
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
          name='messageType'
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
            options={getMessageTypeOptions(t).map((opt) => ({
              value: opt.value,
              label: (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <IconFont type={getMessageTypeIconType(opt.value)} />
                  {opt.label}
                </span>
              ),
            }))}
          />
        </Form.Item>
        <Form.Item
          label={t('template.form.jsonData.label')}
          name='jsonData'
          help={t('template.form.jsonData.help')}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.resolve()
                }
                try {
                  const parsed = JSON.parse(value.trim())
                  if (
                    typeof parsed !== 'object' ||
                    parsed === null ||
                    Array.isArray(parsed)
                  ) {
                    return Promise.reject(
                      new Error(t('template.form.jsonData.invalid')),
                    )
                  }
                  return Promise.resolve()
                } catch {
                  return Promise.reject(
                    new Error(t('template.form.jsonData.invalid')),
                  )
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
