import { useState, useEffect, useMemo } from 'react'
import {
  useDebounceFn,
  useMemoizedFn,
  useRequest,
  useBoolean,
  useUnmountedRef,
  useInterval,
} from 'ahooks'
import {
  Form,
  Input,
  Button,
  Select,
  AutoComplete,
  App,
  Row,
  Col,
  Segmented,
  Typography,
  Space,
  Flex,
  Divider,
  theme,
} from 'antd'
import {
  MailOutlined,
  ApiOutlined,
  SendOutlined,
  EditOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import {
  sendEmail,
  sendEmailWithTemplate,
  sendWebhook,
  sendWebhookWithTemplate,
} from '@/api/rabbit/sender'
import type { SendReply } from '@/api/rabbit/sender'
import { getMessageLog } from '@/api/rabbit/message-log'
import type { MessageLogItem } from '@/api/rabbit/message-log'
import { getEmailConfigSelectList } from '@/api/rabbit/email'
import type { EmailItemSelect } from '@/api/rabbit/email'
import { getWebhookConfigSelectList } from '@/api/rabbit/webhook'
import type { WebhookItemSelect } from '@/api/rabbit/webhook'
import { getTemplateSelectList, getTemplateDetail } from '@/api/rabbit/template'
import type { TemplateItemSelect } from '@/api/rabbit/template'
import { MessageStatus, MessageType } from '@/api/common/types'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { getStatusLabel, getTypeLabel } from '@/pages/rabbit/messages/constants'
import { getMessageTypeIconType } from '@/pages/rabbit/constants/appIcons'
import { getAppIconType } from '@/pages/rabbit/webhooks/constants'
import { IconFont } from '@/components/Icon/IconFont'
import { buildTemplateDataJsonFromDetail } from './utils/goTemplateVariables'

type SendChannel = 'email' | 'webhook'
type SendMode = 'direct' | 'template'
type SendType = 'email' | 'emailTemplate' | 'webhook' | 'webhookTemplate'

const MESSAGE_POLL_INTERVAL_MS = 1000
const NOTIFICATION_AUTO_CLOSE_SECONDS = 3

function getSelectPopupContainer(triggerNode: HTMLElement) {
  return triggerNode.parentElement ?? document.body
}

function parseEmailList(value: unknown): string[] | undefined {
  const str = String(value ?? '').trim()
  if (!str) return undefined
  const list = str.split(',').map((s) => s.trim()).filter(Boolean)
  return list.length > 0 ? list : undefined
}

async function submitSendMessage(
  sendType: SendType,
  values: Record<string, unknown>,
): Promise<SendReply | undefined> {
  const uid = String(values.uid ?? '').trim()
  if (!uid) return undefined

  switch (sendType) {
    case 'email': {
      const headersList = (values.headers ?? []) as {
        key?: string
        value?: string
      }[]
      const headers: Record<string, string> | undefined =
        headersList.length > 0
          ? Object.fromEntries(
              headersList
                .filter((h) => (h.key ?? '').trim())
                .map((h) => [(h.key ?? '').trim(), (h.value ?? '').trim()]),
            )
          : undefined
      return sendEmail(uid, {
        uid,
        subject: String(values.subject ?? '').trim(),
        body: String(values.body ?? '').trim(),
        contentType: String(values.contentType ?? '').trim() || undefined,
        to: parseEmailList(values.to),
        cc: parseEmailList(values.cc),
        headers,
      })
    }
    case 'emailTemplate':
      return sendEmailWithTemplate(uid, {
        uid,
        templateUID: String(values.templateUID ?? '').trim(),
        jsonData: String(values.jsonData ?? '').trim(),
        to: parseEmailList(values.to),
        cc: parseEmailList(values.cc),
      })
    case 'webhook':
      return sendWebhook(uid, {
        uid,
        data: String(values.data ?? '').trim(),
      })
    case 'webhookTemplate':
      return sendWebhookWithTemplate(uid, {
        uid,
        templateUID: String(values.templateUID ?? '').trim(),
        jsonData: String(values.jsonData ?? '').trim(),
      })
    default:
      return undefined
  }
}

const TERMINAL_MESSAGE_STATUSES = new Set<MessageStatus>([
  MessageStatus.SENT,
  MessageStatus.FAILED,
  MessageStatus.CANCELLED,
])

function isTerminalMessageStatus(status?: string): boolean {
  return (
    status != null && TERMINAL_MESSAGE_STATUSES.has(status as MessageStatus)
  )
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function pollMessageLogUntilTerminal(
  msgUid: string,
  isCancelled: () => boolean,
): Promise<MessageLogItem | null> {
  while (true) {
    if (isCancelled()) return null

    const log = await getMessageLog(msgUid)
    if (isCancelled()) return null

    if (isTerminalMessageStatus(log.status)) {
      return log
    }

    await sleep(MESSAGE_POLL_INTERVAL_MS)
  }
}

function toSendType(channel: SendChannel, mode: SendMode): SendType {
  if (channel === 'email') {
    return mode === 'direct' ? 'email' : 'emailTemplate'
  }
  return mode === 'direct' ? 'webhook' : 'webhookTemplate'
}

function renderConfigOptionLabel(iconType: string, text: string) {
  return (
    <span className='inline-flex items-center gap-2'>
      <IconFont type={iconType} />
      {text}
    </span>
  )
}

function mapEmailConfigOptions(items: EmailItemSelect[]) {
  const emailIcon = getMessageTypeIconType(MessageType.EMAIL)
  return items
    .filter(
      (item) =>
        (item.value ?? (item as unknown as { uid?: string }).uid) != null,
    )
    .map((item) => {
      const value =
        item.value ?? (item as unknown as { uid?: string }).uid ?? ''
      const text =
        item.label ?? (item as unknown as { name?: string }).name ?? value
      return {
        value,
        label: renderConfigOptionLabel(emailIcon, text),
        disabled: item.disabled,
        title: item.tooltip ?? text,
      }
    })
}

function mapWebhookConfigOptions(items: WebhookItemSelect[]) {
  return items
    .filter(
      (item) =>
        (item.value ?? (item as unknown as { uid?: string }).uid) != null,
    )
    .map((item) => {
      const value =
        item.value ?? (item as unknown as { uid?: string }).uid ?? ''
      const text =
        item.label ?? (item as unknown as { name?: string }).name ?? value
      const iconType =
        item.app != null
          ? getAppIconType(item.app)
          : getMessageTypeIconType(MessageType.WEBHOOK_OTHER)
      return {
        value,
        label: renderConfigOptionLabel(iconType, text),
        disabled: item.disabled,
        title: item.tooltip ?? text,
      }
    })
}

function renderSendFailedDescription(
  log: MessageLogItem,
  t: (key: string) => string,
) {
  const rows: { label: string; value?: string }[] = [
    { label: t('messageLog.detail.uid'), value: log.uid },
    {
      label: t('messageLog.detail.type'),
      value: getTypeLabel(log.messageType, t),
    },
    {
      label: t('messageLog.detail.status'),
      value: getStatusLabel(log.status, t),
    },
    { label: t('messageLog.detail.lastError'), value: log.lastError },
    { label: t('messageLog.detail.message'), value: log.message },
  ]

  return (
    <Space orientation='vertical' size={4} className='w-full'>
      {rows
        .filter((row) => row.value)
        .map((row) => (
          <div key={row.label}>
            <Typography.Text type='secondary'>{row.label}: </Typography.Text>
            <Typography.Text>{row.value}</Typography.Text>
          </div>
        ))}
    </Space>
  )
}

function SendFailedNotificationContent({
  log,
  t,
}: {
  log: MessageLogItem
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const [remaining, setRemaining] = useState(NOTIFICATION_AUTO_CLOSE_SECONDS)

  useInterval(() => {
    setRemaining((prev: number) => Math.max(0, prev - 1))
  }, 1000)

  return (
    <Space orientation='vertical' size={8} className='w-full'>
      {renderSendFailedDescription(log, t)}
      <Typography.Text type='secondary' className='text-xs'>
        {t('sender.notification.autoCloseCountdown', { seconds: remaining })}
      </Typography.Text>
    </Space>
  )
}

function mapTemplateOptions(items: TemplateItemSelect[]) {
  return items
    .filter((item) => item.value != null)
    .map((item) => ({
      value: item.value!,
      label: item.label ?? item.value,
      disabled: item.disabled,
      title: item.tooltip,
    }))
}

export default function SenderManagement() {
  return (
    <App
      className='h-full min-h-0'
      notification={{ getContainer: () => document.body }}
    >
      <SenderContent />
    </App>
  )
}

function SenderContent() {
  const { t } = useLocale()
  const { message: messageApi, notification } = App.useApp()
  const unmountedRef = useUnmountedRef()
  const [sending, { setTrue: startSending, setFalse: stopSending }] =
    useBoolean(false)
  const { token } = theme.useToken()
  const [form] = Form.useForm()
  const [channel, setChannel] = useState<SendChannel>('email')
  const [mode, setMode] = useState<SendMode>('direct')
  const sendType = useMemo(() => toSendType(channel, mode), [channel, mode])

  const [templateOptions, setTemplateOptions] = useState<TemplateItemSelect[]>(
    [],
  )
  const [emailConfigOptions, setEmailConfigOptions] = useState<
    EmailItemSelect[]
  >([])
  const [emailConfigKeyword, setEmailConfigKeyword] = useState('')
  const [webhookConfigOptions, setWebhookConfigOptions] = useState<
    WebhookItemSelect[]
  >([])
  const [webhookConfigKeyword, setWebhookConfigKeyword] = useState('')
  const [webhookTemplateType, setWebhookTemplateType] = useState<
    MessageType | undefined
  >(undefined)

  const needTemplate = mode === 'template'
  const isEmail = channel === 'email'

  const { run: handleEmailConfigSearch } = useDebounceFn(
    (value: string) => setEmailConfigKeyword(value),
    { wait: 300 },
  )

  const { run: handleWebhookConfigSearch } = useDebounceFn(
    (value: string) => setWebhookConfigKeyword(value),
    { wait: 300 },
  )

  const { loading: emailConfigLoading, run: fetchEmailConfigOptions } =
    useRequest(
      (keyword?: string) =>
        getEmailConfigSelectList({
          keyword: keyword?.trim() || undefined,
          limit: 100,
        }).then((res) => res.items ?? []),
      {
        manual: true,
        onSuccess: setEmailConfigOptions,
        onError: () => setEmailConfigOptions([]),
      },
    )

  const { loading: webhookConfigLoading, run: fetchWebhookConfigOptions } =
    useRequest(
      (keyword?: string) =>
        getWebhookConfigSelectList({
          keyword: keyword?.trim() || undefined,
          limit: 20,
        }).then((res) => res.items ?? []),
      {
        manual: true,
        onSuccess: setWebhookConfigOptions,
        onError: () => setWebhookConfigOptions([]),
      },
    )

  const { loading: templateLoading, run: fetchTemplateOptions } = useRequest(
    (params: { messageType?: MessageType }) =>
      getTemplateSelectList({ limit: 20, ...params }).then(
        (res) => res.items ?? [],
      ),
    {
      manual: true,
      onSuccess: setTemplateOptions,
      onError: () => setTemplateOptions([]),
    },
  )

  const { loading: templateDetailLoading, runAsync: fetchTemplateDetail } =
    useRequest(getTemplateDetail, { manual: true })

  useEffect(() => {
    if (!isEmail) return
    fetchEmailConfigOptions(emailConfigKeyword)
  }, [isEmail, emailConfigKeyword, fetchEmailConfigOptions])

  useEffect(() => {
    if (isEmail) return
    fetchWebhookConfigOptions(webhookConfigKeyword)
  }, [isEmail, webhookConfigKeyword, fetchWebhookConfigOptions])

  useEffect(() => {
    if (!needTemplate) {
      setTemplateOptions([])
      return
    }
    if (!isEmail && !webhookTemplateType) {
      setTemplateOptions([])
      return
    }
    fetchTemplateOptions(
      isEmail
        ? { messageType: MessageType.EMAIL }
        : { messageType: webhookTemplateType },
    )
  }, [needTemplate, isEmail, webhookTemplateType, fetchTemplateOptions])

  useEffect(() => {
    if (isEmail) setWebhookTemplateType(undefined)
  }, [isEmail])

  const handleChannelChange = useMemoizedFn((value: SendChannel) => {
    setChannel(value)
    setMode('direct')
    setWebhookTemplateType(undefined)
    form.resetFields()
  })

  const handleModeChange = useMemoizedFn((value: SendMode) => {
    setMode(value)
    form.resetFields()
  })

  const handleReset = useMemoizedFn(() => {
    form.resetFields()
    setWebhookTemplateType(undefined)
  })

  const handleTemplateChange = useMemoizedFn(async (templateUID?: string) => {
    if (!templateUID) {
      form.setFieldValue('jsonData', undefined)
      return
    }

    try {
      const detail = await fetchTemplateDetail(templateUID)
      form.setFieldValue(
        'jsonData',
        buildTemplateDataJsonFromDetail(detail),
      )
    } catch (error) {
      console.error('获取模板详情失败:', error)
      messageApi.error(t('sender.templateDetailError'))
    }
  })

  const showSendFailureNotification = useMemoizedFn((log: MessageLogItem) => {
    notification.error({
      title:
        log.status === MessageStatus.CANCELLED
          ? t('sender.cancelledNotification.title')
          : t('sender.failedNotification.title'),
      description: <SendFailedNotificationContent log={log} t={t} />,
      duration: NOTIFICATION_AUTO_CLOSE_SECONDS,
      showProgress: true,
    })
  })

  const waitForSendResult = useMemoizedFn(async (reply: SendReply) => {
    const msgUid = reply.uid?.trim()
    if (!msgUid) {
      messageApi.error(t('sender.error'))
      return
    }

    try {
      const log = await pollMessageLogUntilTerminal(
        msgUid,
        () => unmountedRef.current,
      )
      if (!log || unmountedRef.current) return

      if (log.status === MessageStatus.SENT) {
        messageApi.success(t('sender.success'))
        return
      }

      if (
        log.status === MessageStatus.FAILED ||
        log.status === MessageStatus.CANCELLED
      ) {
        showSendFailureNotification(log)
      }
    } catch (error) {
      if (unmountedRef.current) return
      console.error('获取消息状态失败:', error)
      messageApi.error(t('sender.statusCheckError'))
    }
  })

  const handleSubmit = useMemoizedFn(async () => {
    try {
      const values = await form.validateFields()
      startSending()
      try {
        const reply = await submitSendMessage(sendType, values)
        if (!reply?.uid?.trim()) {
          messageApi.error(t('sender.error'))
          return
        }

        form.resetFields()
        setWebhookTemplateType(undefined)
        await waitForSendResult(reply)
      } finally {
        stopSending()
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      console.error('发送失败:', error)
      messageApi.error(t('sender.error'))
    }
  })

  const renderEmailConfigSelect = () => (
    <Form.Item
      name='uid'
      label={t('sender.form.uidEmail')}
      rules={[
        { required: true, message: t('sender.form.uidEmailPlaceholder') },
      ]}
    >
      <Select
        placeholder={t('sender.form.uidEmailPlaceholder')}
        allowClear
        showSearch={{ onSearch: handleEmailConfigSearch }}
        loading={emailConfigLoading}
        getPopupContainer={getSelectPopupContainer}
        options={mapEmailConfigOptions(emailConfigOptions)}
      />
    </Form.Item>
  )

  const renderWebhookConfigSelect = () => (
    <Form.Item
      name='uid'
      label={t('sender.form.uidWebhook')}
      rules={[
        { required: true, message: t('sender.form.uidWebhookPlaceholder') },
      ]}
    >
      <Select
        placeholder={t('sender.form.uidWebhookPlaceholder')}
        allowClear
        showSearch={{ onSearch: handleWebhookConfigSearch }}
        loading={webhookConfigLoading}
        getPopupContainer={getSelectPopupContainer}
        options={mapWebhookConfigOptions(webhookConfigOptions)}
        onChange={(value) => {
          const item = webhookConfigOptions.find((i) => i.value === value)
          if (item?.app != null) {
            setWebhookTemplateType(`WEBHOOK_${String(item.app)}` as MessageType)
          } else {
            setWebhookTemplateType(undefined)
          }
          form.setFieldsValue({ templateUID: undefined, jsonData: undefined })
        }}
      />
    </Form.Item>
  )

  const renderTemplateSelect = () => (
    <Form.Item
      name='templateUID'
      label={t('sender.form.templateUID')}
      rules={[
        {
          required: true,
          message: t('sender.form.templateUIDPlaceholder'),
        },
      ]}
    >
      <Select
        placeholder={t('sender.form.templateUIDPlaceholder')}
        allowClear
        showSearch
        loading={templateLoading || templateDetailLoading}
        disabled={!isEmail && !webhookTemplateType}
        getPopupContainer={getSelectPopupContainer}
        options={mapTemplateOptions(templateOptions)}
        onChange={(value) => {
          void handleTemplateChange(value ? String(value) : undefined)
        }}
      />
    </Form.Item>
  )

  const renderTemplateDataField = () => (
    <Form.Item
      name='jsonData'
      label={t('sender.form.jsonData')}
      rules={[
        {
          required: true,
          message: t('sender.form.jsonDataRequired'),
        },
      ]}
    >
      <Input.TextArea
        placeholder={t('sender.form.jsonDataPlaceholder')}
        rows={6}
        allowClear
        className='font-mono text-sm'
        readOnly={templateDetailLoading}
      />
    </Form.Item>
  )

  const renderRecipientFields = () => (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name='to'
          label={t('sender.form.to')}
          rules={
            needTemplate && isEmail
              ? [
                  {
                    required: true,
                    message: t('sender.form.toPlaceholder'),
                  },
                ]
              : undefined
          }
        >
          <Input placeholder={t('sender.form.toPlaceholder')} allowClear />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name='cc' label={t('sender.form.cc')}>
          <Input placeholder={t('sender.form.ccPlaceholder')} allowClear />
        </Form.Item>
      </Col>
    </Row>
  )

  const renderEmailDirectContent = () => (
    <>
      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Form.Item
            name='subject'
            label={t('sender.form.subject')}
            rules={[
              {
                required: true,
                message: t('sender.form.subjectPlaceholder'),
              },
            ]}
          >
            <Input
              placeholder={t('sender.form.subjectPlaceholder')}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name='contentType' label={t('sender.form.contentType')}>
            <AutoComplete
              placeholder={t('sender.form.contentTypePlaceholder')}
              allowClear
              getPopupContainer={getSelectPopupContainer}
              options={[
                { value: 'text/plain', label: 'text/plain' },
                { value: 'text/html', label: 'text/html' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t('sender.form.headers')}>
        <Form.List name='headers'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Row key={key} gutter={8} align='middle' className='mb-2'>
                  <Col flex='1'>
                    <Form.Item
                      {...rest}
                      name={[name, 'key']}
                      rules={[
                        {
                          required: true,
                          message: t('sender.form.headerKeyRequired'),
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder={t('sender.form.headerKeyPlaceholder')}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='1'>
                    <Form.Item
                      {...rest}
                      name={[name, 'value']}
                      style={{ marginBottom: 0 }}
                      rules={[
                        {
                          required: true,
                          message: t('sender.form.headerValueRequired'),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t('sender.form.headerValuePlaceholder')}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button type='text' danger onClick={() => remove(name)}>
                      {t('sender.form.headerRemove')}
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button type='dashed' onClick={() => add()} block>
                {t('sender.form.headersAdd')}
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
      <Form.Item
        name='body'
        label={t('sender.form.body')}
        rules={[
          {
            required: true,
            message: t('sender.form.bodyPlaceholder'),
          },
        ]}
      >
        <Input.TextArea
          placeholder={t('sender.form.bodyPlaceholder')}
          rows={8}
          allowClear
        />
      </Form.Item>
    </>
  )

  return (
    <PageContent className='overflow-hidden! h-full'>
      <Flex vertical className='h-full min-h-0 min-w-0'>
        <div className='shrink-0 mb-4'>
          <Typography.Title level={5} className='mb-1!'>
            {t('rabbit.sender.title')}
          </Typography.Title>
          <Typography.Text type='secondary'>
            {t('sender.description')}
          </Typography.Text>
        </div>

        <div
          className='shrink-0 mb-4 rounded-lg px-4 py-3 flex flex-wrap gap-6'
          style={{ background: token.colorFillTertiary }}
        >
          <Space orientation='vertical' size={4}>
            <Typography.Text type='secondary' className='text-xs'>
              {t('sender.channel')}
            </Typography.Text>
            <Segmented
              value={channel}
              onChange={(value) => handleChannelChange(value as SendChannel)}
              options={[
                {
                  label: t('sender.channel.email'),
                  value: 'email',
                  icon: <MailOutlined />,
                },
                {
                  label: t('sender.channel.webhook'),
                  value: 'webhook',
                  icon: <ApiOutlined />,
                },
              ]}
            />
          </Space>
          <Space orientation='vertical' size={4}>
            <Typography.Text type='secondary' className='text-xs'>
              {t('sender.mode')}
            </Typography.Text>
            <Segmented
              value={mode}
              onChange={(value) => handleModeChange(value as SendMode)}
              options={[
                {
                  label: t('sender.mode.direct'),
                  value: 'direct',
                  icon: <EditOutlined />,
                },
                {
                  label: t('sender.mode.template'),
                  value: 'template',
                  icon: <FileTextOutlined />,
                },
              ]}
            />
          </Space>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden min-w-0'>
          <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
            requiredMark='optional'
          >
            <Divider
              titlePlacement='left'
              plain
              styles={{ root: { marginTop: 0 } }}
            >
              {t('sender.section.config')}
            </Divider>
            {needTemplate ? (
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  {isEmail
                    ? renderEmailConfigSelect()
                    : renderWebhookConfigSelect()}
                </Col>
                <Col xs={24} md={12}>
                  {renderTemplateSelect()}
                </Col>
              </Row>
            ) : isEmail ? (
              renderEmailConfigSelect()
            ) : (
              renderWebhookConfigSelect()
            )}

            {isEmail ? (
              <>
                <Divider titlePlacement='left' plain>
                  {t('sender.section.recipients')}
                </Divider>
                {renderRecipientFields()}
              </>
            ) : null}

            <Divider titlePlacement='left' plain>
              {t('sender.section.content')}
            </Divider>
            {sendType === 'email' && renderEmailDirectContent()}
            {sendType === 'emailTemplate' && renderTemplateDataField()}
            {sendType === 'webhook' && (
              <Form.Item
                name='data'
                label={t('sender.form.data')}
                rules={[
                  {
                    required: true,
                    message: t('sender.form.dataPlaceholder'),
                  },
                ]}
              >
                <Input.TextArea
                  placeholder={t('sender.form.dataPlaceholder')}
                  rows={8}
                  allowClear
                  className='font-mono text-sm'
                />
              </Form.Item>
            )}
            {sendType === 'webhookTemplate' && renderTemplateDataField()}
          </Form>
        </div>

        <Flex justify='end' gap={8} className='shrink-0 pt-4 mt-2'>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
          <Button
            type='primary'
            icon={<SendOutlined />}
            loading={sending}
            disabled={sending}
            onClick={() => form.submit()}
          >
            {t('sender.submit')}
          </Button>
        </Flex>
      </Flex>
    </PageContent>
  )
}
