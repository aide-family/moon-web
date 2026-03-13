import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { saveStrategyMetricLevel } from '@/api/marksman/strategyMetric'
import type { SaveStrategyMetricLevelParams } from '@/api/marksman/strategyMetric'
import { useLocale } from '@/contexts/LocaleContext'

const DURATION_REGEX = /^-?(?:0|[1-9][0-9]{0,11})(?:\.[0-9]{1,9})?s$/

interface AlertLevelModalProps {
  open: boolean
  strategyUID: string | undefined
  onCancel: () => void
  onSuccess: () => void
}

/** 将逗号分隔的字符串解析为 number[]，过滤非法值 */
function parseValuesString(str: string | undefined): number[] | undefined {
  if (str == null || String(str).trim() === '') return undefined
  const parts = String(str).split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean)
  const nums: number[] = []
  for (const p of parts) {
    const n = Number(p)
    if (Number.isFinite(n)) nums.push(n)
  }
  return nums.length > 0 ? nums : undefined
}

const AlertLevelModal: React.FC<AlertLevelModalProps> = ({ open, strategyUID, onCancel, onSuccess }) => {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  const handleSubmit = async () => {
    if (!strategyUID) return
    try {
      const values = await form.validateFields()
      const params: SaveStrategyMetricLevelParams = {
        strategyUID,
        levelUID: values.levelUID?.trim() || undefined,
        mode: values.mode != null && values.mode !== '' ? Number(values.mode) : undefined,
        condition: values.condition != null && values.condition !== '' ? Number(values.condition) : undefined,
        duration: values.duration?.trim() || undefined,
        status: values.status != null && values.status !== '' ? Number(values.status) : undefined,
        values: parseValuesString(values.values),
      }
      setSaving(true)
      await saveStrategyMetricLevel(strategyUID, params)
      message.success(t('message.update.success'))
      onSuccess()
      onCancel()
    } catch (err) {
      console.error('保存告警规则等级失败:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={t('strategy.alertLevel.modal.title')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
      confirmLoading={saving}
      destroyOnHidden
      width={520}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="levelUID" label={t('strategy.detail.level')}>
          <Input placeholder={t('strategy.alertLevel.levelUID.placeholder')} />
        </Form.Item>
        <Form.Item name="mode" label={t('strategy.detail.mode')}>
          <Input type="number" placeholder={t('strategy.alertLevel.mode.placeholder')} />
        </Form.Item>
        <Form.Item name="condition" label={t('strategy.detail.condition')}>
          <Input type="number" placeholder={t('strategy.alertLevel.condition.placeholder')} />
        </Form.Item>
        <Form.Item
          name="duration"
          label={t('strategy.detail.duration')}
          rules={[
            {
              pattern: DURATION_REGEX,
              message: t('strategy.alertLevel.duration.pattern'),
            },
          ]}
        >
          <Input placeholder={t('strategy.alertLevel.duration.placeholder')} />
        </Form.Item>
        <Form.Item name="status" label={t('strategy.detail.status')}>
          <Input type="number" placeholder={t('strategy.alertLevel.status.placeholder')} />
        </Form.Item>
        <Form.Item name="values" label={t('strategy.alertLevel.values')}>
          <Input.TextArea
            rows={2}
            placeholder={t('strategy.alertLevel.values.placeholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AlertLevelModal
