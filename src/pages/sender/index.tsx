import { useState, useEffect } from 'react'
import { Tabs, Card, Form, Select, Input, Button, message, Space } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import {
  senderService,
  emailService,
  webhookService,
  templateService,
} from '../../api/services'
import {
  EmailConfigItem,
  WebhookItem,
  TemplateItem,
  GlobalStatus,
  TemplateAPP,
} from '../../api/types'

export default function Sender() {
  const [emailConfigs, setEmailConfigs] = useState<EmailConfigItem[]>([])
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookItem[]>([])
  const [emailTemplates, setEmailTemplates] = useState<TemplateItem[]>([])
  const [webhookTemplates, setWebhookTemplates] = useState<TemplateItem[]>([])
  const [emailForm] = Form.useForm()
  const [webhookForm] = Form.useForm()
  const [emailMode, setEmailMode] = useState<'direct' | 'template'>('direct')
  const [webhookMode, setWebhookMode] = useState<'direct' | 'template'>(
    'direct'
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const [emailRes, webhookRes, templateRes] = await Promise.all([
        emailService.list({
          page: 1,
          pageSize: 100,
          status: GlobalStatus.ENABLED,
        }),
        webhookService.list({
          page: 1,
          pageSize: 100,
          status: GlobalStatus.ENABLED,
        }),
        templateService.list({
          page: 1,
          pageSize: 100,
          status: GlobalStatus.ENABLED,
        }),
      ])
      setEmailConfigs(emailRes.data.items)
      setWebhookConfigs(webhookRes.data.items)
      setEmailTemplates(
        templateRes.data.items.filter(
          (t) => t.app === TemplateAPP.TEMPLATE_APP_EMAIL
        )
      )
      setWebhookTemplates(
        templateRes.data.items.filter(
          (t) => t.app === TemplateAPP.TEMPLATE_APP_WEBHOOK_OTHER
        )
      )
    } catch {
      message.error('加载配置失败')
    }
  }

  const handleEmailSend = async () => {
    try {
      setLoading(true)
      const values = await emailForm.validateFields()

      if (emailMode === 'direct') {
        await senderService.sendEmail(values.uid, {
          subject: values.subject,
          body: values.body,
          to: values.to.split(',').map((s: string) => s.trim()),
          contentType: 'text/html',
        })
      } else {
        await senderService.sendEmailWithTemplate(values.uid, {
          templateUID: values.templateUID,
          jsonData: values.jsonData,
        })
      }

      message.success('发送成功，请在消息日志中查看详情')
      emailForm.resetFields()
    } catch {
      message.error('发送失败')
    } finally {
      setLoading(false)
    }
  }

  const handleWebhookSend = async () => {
    try {
      setLoading(true)
      const values = await webhookForm.validateFields()

      if (webhookMode === 'direct') {
        await senderService.sendWebhook(values.uid, {
          data: values.data,
        })
      } else {
        await senderService.sendWebhookWithTemplate(values.uid, {
          templateUID: values.templateUID,
          jsonData: values.jsonData,
        })
      }

      message.success('发送成功，请在消息日志中查看详情')
      webhookForm.resetFields()
    } catch {
      message.error('发送失败')
    } finally {
      setLoading(false)
    }
  }

  const emailTab = (
    <Card>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        <div>
          <label style={{ marginRight: 16 }}>发送模式:</label>
          <Button.Group>
            <Button
              type={emailMode === 'direct' ? 'primary' : 'default'}
              onClick={() => setEmailMode('direct')}
            >
              直接发送
            </Button>
            <Button
              type={emailMode === 'template' ? 'primary' : 'default'}
              onClick={() => setEmailMode('template')}
            >
              模板发送
            </Button>
          </Button.Group>
        </div>

        <Form form={emailForm} layout='vertical'>
          <Form.Item
            name='uid'
            label='邮件配置'
            rules={[{ required: true, message: '请选择邮件配置' }]}
          >
            <Select placeholder='选择已启用的邮件配置'>
              {emailConfigs.map((c) => (
                <Select.Option key={c.uid} value={c.uid}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {emailMode === 'direct' ? (
            <>
              <Form.Item
                name='to'
                label='收件人'
                rules={[{ required: true, message: '请输入收件人' }]}
              >
                <Input placeholder='多个收件人用逗号分隔' />
              </Form.Item>
              <Form.Item
                name='subject'
                label='主题'
                rules={[{ required: true, message: '请输入主题' }]}
              >
                <Input placeholder='邮件主题' />
              </Form.Item>
              <Form.Item
                name='body'
                label='内容'
                rules={[{ required: true, message: '请输入内容' }]}
              >
                <Input.TextArea rows={8} placeholder='邮件内容 (支持 HTML)' />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name='templateUID'
                label='模板'
                rules={[{ required: true, message: '请选择模板' }]}
              >
                <Select placeholder='选择邮件模板'>
                  {emailTemplates.map((t) => (
                    <Select.Option key={t.uid} value={t.uid}>
                      {t.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='jsonData'
                label='模板变量 (JSON)'
                rules={[{ required: true, message: '请输入变量' }]}
              >
                <Input.TextArea
                  rows={8}
                  placeholder='{"to": ["user@example.com"], "subject": "测试", "body": "内容"}'
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type='primary'
              icon={<SendOutlined />}
              onClick={handleEmailSend}
              loading={loading}
              block
            >
              发送邮件
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  )

  const webhookTab = (
    <Card>
      <Space direction='vertical' style={{ width: '100%' }} size='large'>
        <div>
          <label style={{ marginRight: 16 }}>发送模式:</label>
          <Button.Group>
            <Button
              type={webhookMode === 'direct' ? 'primary' : 'default'}
              onClick={() => setWebhookMode('direct')}
            >
              直接发送
            </Button>
            <Button
              type={webhookMode === 'template' ? 'primary' : 'default'}
              onClick={() => setWebhookMode('template')}
            >
              模板发送
            </Button>
          </Button.Group>
        </div>

        <Form form={webhookForm} layout='vertical'>
          <Form.Item
            name='uid'
            label='Webhook 配置'
            rules={[{ required: true, message: '请选择配置' }]}
          >
            <Select placeholder='选择已启用的 Webhook 配置'>
              {webhookConfigs.map((c) => (
                <Select.Option key={c.uid} value={c.uid}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {webhookMode === 'direct' ? (
            <Form.Item
              name='data'
              label='数据 (JSON)'
              rules={[{ required: true, message: '请输入数据' }]}
            >
              <Input.TextArea
                rows={10}
                placeholder='{"event": "test", "data": {...}}'
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name='templateUID'
                label='模板'
                rules={[{ required: true, message: '请选择模板' }]}
              >
                <Select placeholder='选择 Webhook 模板'>
                  {webhookTemplates.map((t) => (
                    <Select.Option key={t.uid} value={t.uid}>
                      {t.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='jsonData'
                label='模板变量 (JSON)'
                rules={[{ required: true, message: '请输入变量' }]}
              >
                <Input.TextArea
                  rows={10}
                  placeholder='{"user": "test", "message": "hello"}'
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type='primary'
              icon={<SendOutlined />}
              onClick={handleWebhookSend}
              loading={loading}
              block
            >
              发送 Webhook
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  )

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
        发送测试
      </h1>
      <Tabs
        items={[
          { key: 'email', label: '邮件测试', children: emailTab },
          { key: 'webhook', label: 'Webhook 测试', children: webhookTab },
        ]}
      />
    </div>
  )
}
