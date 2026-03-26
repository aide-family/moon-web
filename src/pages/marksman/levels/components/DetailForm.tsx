import React, { useEffect, useState, useMemo } from 'react'
import { ColorPicker, Form, Input, Modal, Select, message } from 'antd'
import type {
  CreateLevelParams,
  UpdateLevelParams,
  LevelItem,
} from '@/api/marksman/level'
import { createLevel, LevelType, updateLevel } from '@/api/marksman/level'
import { useLocale } from '@/contexts/LocaleContext'
import { getLevelTypeLabel } from '@/utils/marksman'

interface DetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: LevelItem | null
  onCancel: () => void
  onSuccess: (created?: LevelItem) => void
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
    () => [
      {
        value: LevelType.LEVEL_TYPE_ALERT,
        label: getLevelTypeLabel(LevelType.LEVEL_TYPE_ALERT, t),
      },
      {
        value: LevelType.LEVEL_TYPE_DATASOURCE,
        label: getLevelTypeLabel(LevelType.LEVEL_TYPE_DATASOURCE, t),
      },
    ],
    [t],
  )

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name ?? '',
        remark: initialData.remark ?? '',
        bgColor: initialData.bgColor,
        type: initialData.type,
        metadata: initialData.metadata
          ? JSON.stringify(initialData.metadata, null, 2)
          : '',
      })
    } else if (open && mode === 'create') {
      form.resetFields()
      // 默认使用告警等级，便于减少误配置
      form.setFieldsValue({ type: LevelType.LEVEL_TYPE_ALERT })
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
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            !Array.isArray(parsed)
          ) {
            metadata = Object.fromEntries(
              Object.entries(parsed).map(([k, v]) => [k, String(v)]),
            )
          }
        } catch {
          message.error(t('message.error'))
          setLoading(false)
          return
        }
      }

      if (mode === 'create') {
        const params: CreateLevelParams = {
          name: values.name?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          bgColor: values.bgColor?.trim() || undefined,
          metadata,
          type: values.type,
        }
        const created = await createLevel(params)
        message.success(t('message.create.success'))
        onSuccess(created)
      } else if (mode === 'edit' && initialData?.uid) {
        const params: UpdateLevelParams = {
          name: values.name?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
          bgColor: values.bgColor?.trim() || undefined,
          metadata,
          type: values.type,
        }
        await updateLevel(initialData.uid, params)
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
          ? t('level.modal.create.title')
          : t('level.modal.edit.title')
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
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item
          name='name'
          label={t('level.form.name.label')}
          rules={[
            { required: true, message: t('level.form.name.placeholder') },
          ]}
        >
          <Input placeholder={t('level.form.name.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name='remark' label={t('level.form.remark.label')}>
          <Input.TextArea
            rows={2}
            placeholder={t('level.form.remark.placeholder')}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name='type'
          label={t('level.form.type.label')}
          rules={[
            { required: true, message: t('level.form.type.placeholder') },
          ]}
        >
          <Select options={typeOptions} />
        </Form.Item>
        <Form.Item
          name='bgColor'
          label={t('level.form.bgColor.label')}
          extra={
            <span className='text-xs text-gray-400'>
              {t('level.form.bgColor.placeholder')}
            </span>
          }
          getValueFromEvent={(_color, css: string) =>
            css?.trim() ? css.trim() : undefined
          }
        >
          <ColorPicker format='hex' allowClear showText />
        </Form.Item>
        <Form.Item name='metadata' label={t('level.form.metadata.label')}>
          <Input.TextArea
            rows={4}
            placeholder={t('level.form.metadata.placeholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DetailForm
