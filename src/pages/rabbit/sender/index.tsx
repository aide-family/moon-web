import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, Form, Input, Button, Select, AutoComplete, message as antdMessage, App } from 'antd'
import {
  sendEmail,
  sendEmailWithTemplate,
  sendWebhook,
  sendWebhookWithTemplate,
} from '@/api/sender'
import { getEmailConfigSelectList } from '@/api/email'
import type { EmailItemSelect } from '@/api/email'
import { getTemplateSelectList } from '@/api/template'
import type { TemplateItemSelect } from '@/api/template'
import { useLocale } from '@/contexts/LocaleContext'

type SendType = 'email' | 'emailTemplate' | 'webhook' | 'webhookTemplate'

const SEND_TYPES: { value: SendType; labelKey: string }[] = [
  { value: 'email', labelKey: 'sender.type.email' },
  { value: 'emailTemplate', labelKey: 'sender.type.emailTemplate' },
  { value: 'webhook', labelKey: 'sender.type.webhook' },
  { value: 'webhookTemplate', labelKey: 'sender.type.webhookTemplate' },
]

export default function SenderManagement() {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [sendType, setSendType] = useState<SendType>('email')
  const [submitting, setSubmitting] = useState(false)
  const [templateOptions, setTemplateOptions] = useState<TemplateItemSelect[]>([])
  const [templateLoading, setTemplateLoading] = useState(false)
  const [emailConfigOptions, setEmailConfigOptions] = useState<EmailItemSelect[]>([])
  const [emailConfigLoading, setEmailConfigLoading] = useState(false)
  const [emailConfigKeyword, setEmailConfigKeyword] = useState('')
  const emailConfigSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const needTemplate = sendType === 'emailTemplate' || sendType === 'webhookTemplate'
  const needEmailConfig = sendType === 'email' || sendType === 'emailTemplate'

  const handleEmailConfigSearch = useCallback((value: string) => {
    if (emailConfigSearchTimerRef.current) clearTimeout(emailConfigSearchTimerRef.current)
    emailConfigSearchTimerRef.current = setTimeout(() => {
      setEmailConfigKeyword(value)
    }, 300)
  }, [])

  useEffect(() => {
    if (!needTemplate) return
    setTemplateLoading(true)
    getTemplateSelectList({ limit: 200 })
      .then(res => setTemplateOptions(res.items ?? []))
      .catch(() => setTemplateOptions([]))
      .finally(() => setTemplateLoading(false))
  }, [needTemplate])

  const fetchEmailConfigOptions = useCallback((keyword?: string) => {
    setEmailConfigLoading(true)
    getEmailConfigSelectList({ keyword: keyword?.trim() || undefined, limit: 100 })
      .then(res => setEmailConfigOptions(res.items ?? []))
      .catch(() => setEmailConfigOptions([]))
      .finally(() => setEmailConfigLoading(false))
  }, [])

  useEffect(() => {
    if (!needEmailConfig) return
    fetchEmailConfigOptions(emailConfigKeyword)
  }, [needEmailConfig, emailConfigKeyword, fetchEmailConfigOptions])

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
        case 'email': {
          const toStr = values.to?.trim()
          const ccStr = values.cc?.trim()
          let headers: Record<string, string> | undefined
          if (values.headers?.trim()) {
            try {
              headers = JSON.parse(values.headers.trim()) as Record<string, string>
            } catch {
              antdMessage.warning(t('sender.form.headersPlaceholder'))
              setSubmitting(false)
              return
            }
          }
          await sendEmail(uid, {
            uid,
            subject: values.subject?.trim() ?? '',
            body: values.body?.trim() ?? '',
            contentType: values.contentType?.trim(),
            to: toStr ? toStr.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
            cc: ccStr ? ccStr.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
            headers,
          })
          break
        }
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

  const needEmailBody = sendType === 'email'
  const needToCc = sendType === 'emailTemplate'
  const needData = sendType === 'webhook'

  return (
    <App className="h-full min-h-0 flex flex-col">
      <div className="flex flex-1 min-h-0 gap-4">
        {/* 左侧：发送方式 */}
        <Card className="w-48 shrink-0 overflow-auto" title={t('sender.sendType')}>
          <div className="flex flex-col gap-1">
            {SEND_TYPES.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSendType(value)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-md border transition-colors
                  ${sendType === value
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-transparent border-transparent hover:bg-gray-100 hover:border-gray-200'}
                `}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </Card>

        {/* 右侧：表单 */}
        <Card className="flex-1 min-w-0 min-h-0 overflow-auto">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="uid"
              label={t('sender.form.uid')}
              rules={[{ required: true, message: t('sender.form.uidPlaceholder') }]}
            >
              {needEmailConfig ? (
                <Select
                  placeholder={t('sender.form.uidPlaceholder')}
                  allowClear
                  showSearch
                  filterOption={false}
                  loading={emailConfigLoading}
                  onSearch={handleEmailConfigSearch}
                  options={emailConfigOptions
                    .filter(item => (item.value ?? (item as unknown as { uid?: string }).uid) != null)
                    .map(item => {
                      const value = item.value ?? (item as unknown as { uid?: string }).uid ?? ''
                      const label = item.label ?? (item as unknown as { name?: string }).name ?? value
                      return { value, label, disabled: item.disabled, title: item.tooltip }
                    })}
                />
              ) : (
                <Input placeholder={t('sender.form.uidPlaceholder')} allowClear />
              )}
            </Form.Item>

            {needEmailBody && (
              <>
                <Form.Item
                  name="subject"
                  label={t('sender.form.subject')}
                  rules={[{ required: true, message: t('sender.form.subjectPlaceholder') }]}
                >
                  <Input placeholder={t('sender.form.subjectPlaceholder')} allowClear />
                </Form.Item>
                <Form.Item
                  name="body"
                  label={t('sender.form.body')}
                  rules={[{ required: true, message: t('sender.form.bodyPlaceholder') }]}
                >
                  <Input.TextArea
                    placeholder={t('sender.form.bodyPlaceholder')}
                    rows={4}
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="contentType" label={t('sender.form.contentType')}>
                  <AutoComplete
                    placeholder={t('sender.form.contentTypePlaceholder')}
                    allowClear
                    options={[
                      { value: 'text', label: 'text' },
                      { value: 'html', label: 'html' },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="to" label={t('sender.form.to')}>
                  <Input placeholder={t('sender.form.toPlaceholder')} allowClear />
                </Form.Item>
                <Form.Item name="cc" label={t('sender.form.cc')}>
                  <Input placeholder={t('sender.form.ccPlaceholder')} allowClear />
                </Form.Item>
                <Form.Item name="headers" label={t('sender.form.headers')}>
                  <Input.TextArea
                    placeholder={t('sender.form.headersPlaceholder')}
                    rows={2}
                    allowClear
                  />
                </Form.Item>
              </>
            )}

            {needTemplate && (
              <>
                <Form.Item name="templateUID" label={t('sender.form.templateUID')}>
                  <Select
                    placeholder={t('sender.form.templateUIDPlaceholder')}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    loading={templateLoading}
                    options={templateOptions
                      .filter(item => item.value != null)
                      .map(item => ({
                        value: item.value!,
                        label: item.label ?? item.value,
                        disabled: item.disabled,
                        title: item.tooltip,
                      }))}
                  />
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
