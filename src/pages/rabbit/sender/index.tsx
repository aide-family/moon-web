import React, { useState } from 'react'
import { Card, Form, Input, Button, Segmented, message as antdMessage, App } from 'antd'
import {
  sendEmail,
  sendEmailWithTemplate,
  sendMessage,
  sendWebhook,
  sendWebhookWithTemplate,
} from '@/api/sender'
import { useLocale } from '@/contexts/LocaleContext'

type SendType = 'email' | 'emailTemplate' | 'message' | 'webhook' | 'webhookTemplate'

const SEND_TYPES: { value: SendType; labelKey: string }[] = [
  { value: 'email', labelKey: 'sender.type.email' },
  { value: 'emailTemplate', labelKey: 'sender.type.emailTemplate' },
  { value: 'message', labelKey: 'sender.type.message' },
  { value: 'webhook', labelKey: 'sender.type.webhook' },
  { value: 'webhookTemplate', labelKey: 'sender.type.webhookTemplate' },
]

export default function SenderManagement() {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [sendType, setSendType] = useState<SendType>('email')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const uid = values.uid?.trim()
      if (!uid) {
        antdMessage.warning(t('sender.form.uidPlaceholder'))
        return
      }
      setSubmitting(true)
      switch (sendType) {
        case 'email':
          await sendEmail(uid)
          break
        case 'emailTemplate': {
          const toStr = values.to?.trim()
          const ccStr = values.cc?.trim()
          await sendEmailWithTemplate(uid, {
            templateUID: values.templateUID?.trim(),
            jsonData: values.jsonData?.trim(),
            to: toStr ? toStr.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
            cc: ccStr ? ccStr.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
          })
          break
        }
        case 'message':
          await sendMessage({ uid })
          break
        case 'webhook':
          await sendWebhook(uid, { data: values.data?.trim() })
          break
        case 'webhookTemplate':
          await sendWebhookWithTemplate(uid, {
            templateUID: values.templateUID?.trim(),
            jsonData: values.jsonData?.trim(),
          })
          break
        default:
          break
      }
      antdMessage.success(t('sender.success'))
      form.resetFields()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('发送失败:', error)
      antdMessage.error(t('sender.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const needTemplate = sendType === 'emailTemplate' || sendType === 'webhookTemplate'
  const needToCc = sendType === 'emailTemplate'
  const needData = sendType === 'webhook'

  return (
    <App className="h-full">
      <div className="flex flex-col h-full">
        <Card className="flex-1">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item label={t('sender.sendType')}>
              <Segmented
                block
                options={SEND_TYPES.map(({ value, labelKey }) => ({
                  value,
                  label: t(labelKey),
                }))}
                value={sendType}
                onChange={v => setSendType(v as SendType)}
              />
            </Form.Item>

            <Form.Item
              name="uid"
              label={t('sender.form.uid')}
              rules={[{ required: true, message: t('sender.form.uidPlaceholder') }]}
            >
              <Input placeholder={t('sender.form.uidPlaceholder')} allowClear />
            </Form.Item>

            {needTemplate && (
              <>
                <Form.Item name="templateUID" label={t('sender.form.templateUID')}>
                  <Input placeholder={t('sender.form.templateUIDPlaceholder')} allowClear />
                </Form.Item>
                <Form.Item name="jsonData" label={t('sender.form.jsonData')}>
                  <Input.TextArea
                    placeholder={t('sender.form.jsonDataPlaceholder')}
                    rows={3}
                    allowClear
                  />
                </Form.Item>
              </>
            )}

            {needToCc && (
              <>
                <Form.Item name="to" label={t('sender.form.to')}>
                  <Input placeholder={t('sender.form.toPlaceholder')} allowClear />
                </Form.Item>
                <Form.Item name="cc" label={t('sender.form.cc')}>
                  <Input placeholder={t('sender.form.ccPlaceholder')} allowClear />
                </Form.Item>
              </>
            )}

            {needData && (
              <Form.Item name="data" label={t('sender.form.data')}>
                <Input.TextArea
                  placeholder={t('sender.form.dataPlaceholder')}
                  rows={3}
                  allowClear
                />
              </Form.Item>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {t('sender.submit')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </App>
  )
}
