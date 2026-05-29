import { useEffect, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  message,
} from 'antd'
import KeyValueEditor from '@/components/KeyValueEditor'
import {
  keyValueRowsToRecord,
  recordToKeyValueRows,
  type KeyValueRow,
} from '@/components/keyValueUtils'
import { useLocale } from '@/contexts/LocaleContext'
import { GlobalStatus } from '@/api/common/types'
import {
  createRecipientGroup,
  updateRecipientGroup,
  type CreateRecipientGroupParams,
  type RecipientGroupItem,
  type RecipientGroupMemberRequest,
  type UpdateRecipientGroupParams,
} from '@/api/rabbit/recipient-group'
import { getTemplateSelectList } from '@/api/rabbit/template'
import { getEmailConfigSelectList } from '@/api/rabbit/email'
import { getWebhookConfigSelectList } from '@/api/rabbit/webhook'
import { selectMembers } from '@/api/account/member'
import { MemberStatus } from '@/api/account/member'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  tooltip?: string
}

interface GroupMemberFormValue {
  memberUid?: string
  isEmail?: boolean
  isSms?: boolean
  isPhone?: boolean
}

interface RecipientGroupFormValues {
  name?: string
  metadataPairs?: KeyValueRow[]
  templates?: string[]
  emailConfigs?: string[]
  webhookConfigs?: string[]
  members?: GroupMemberFormValue[]
}

export interface RecipientGroupDetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: RecipientGroupItem | null
  formLoading?: boolean
  onCancel: () => void
  onSuccess: () => void
}

const toSelectOptions = (
  items?: Array<{
    value?: string
    label?: string
    disabled?: boolean
    tooltip?: string
  }>,
): SelectOption[] =>
  (items ?? [])
    .filter((item) => Boolean(item.value))
    .map((item) => ({
      value: item.value!,
      label: item.label ?? item.value!,
      disabled: item.disabled,
      tooltip: item.tooltip,
    }))

const normalizeMembers = (
  members?: GroupMemberFormValue[],
): RecipientGroupMemberRequest[] => {
  return (members ?? [])
    .filter((item) => item.memberUid)
    .map((item) => ({
      memberUid: item.memberUid,
      isEmail: Boolean(item.isEmail),
      isSms: Boolean(item.isSms),
      isPhone: Boolean(item.isPhone),
    }))
    .filter((item) => item.isEmail || item.isSms || item.isPhone)
}

export default function RecipientGroupDetailForm({
  open,
  mode,
  initialData,
  formLoading = false,
  onCancel,
  onSuccess,
}: RecipientGroupDetailFormProps) {
  const { t } = useLocale()
  const [form] = Form.useForm<RecipientGroupFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [templateOptions, setTemplateOptions] = useState<SelectOption[]>([])
  const [emailOptions, setEmailOptions] = useState<SelectOption[]>([])
  const [webhookOptions, setWebhookOptions] = useState<SelectOption[]>([])
  const [memberOptions, setMemberOptions] = useState<SelectOption[]>([])

  const watchedMembers = Form.useWatch('members', form) ?? []

  const loadOptions = useMemoizedFn(async () => {
    const [templateRes, emailRes, webhookRes, memberRes] = await Promise.all([
      getTemplateSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      getEmailConfigSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      getWebhookConfigSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      selectMembers({ limit: 100, status: MemberStatus.JOINED }),
    ])
    setTemplateOptions(toSelectOptions(templateRes.items))
    setEmailOptions(toSelectOptions(emailRes.items))
    setWebhookOptions(toSelectOptions(webhookRes.items))
    setMemberOptions(toSelectOptions(memberRes.items))
  })

  useEffect(() => {
    if (!open) return
    void loadOptions()
  }, [open, loadOptions])

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && !initialData) {
      form.resetFields()
      return
    }
    if (mode === 'edit' && initialData) {
      form.setFieldsValue({
        name: initialData.name,
        metadataPairs: recordToKeyValueRows(initialData.metadata),
        templates: (initialData.templates ?? [])
          .map((item) => item.uid)
          .filter((value): value is string => Boolean(value)),
        emailConfigs: (initialData.emailConfigs ?? [])
          .map((item) => item.uid)
          .filter((value): value is string => Boolean(value)),
        webhookConfigs: (initialData.webhookConfigs ?? [])
          .map((item) => item.uid)
          .filter((value): value is string => Boolean(value)),
        members: (initialData.members ?? []).map((item) => ({
          memberUid: item.memberUid,
          isEmail: item.isEmail,
          isSms: item.isSms,
          isPhone: item.isPhone,
        })),
      })
      return
    }
    if (mode === 'create') {
      form.resetFields()
      form.setFieldsValue({ metadataPairs: [], members: [] })
    }
  }, [open, mode, initialData, form])

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const members = normalizeMembers(values.members)
      const payload: CreateRecipientGroupParams | UpdateRecipientGroupParams = {
        name: values.name?.trim(),
        metadata: keyValueRowsToRecord(values.metadataPairs),
        templates: values.templates ?? [],
        emailConfigs: values.emailConfigs ?? [],
        webhookConfigs: values.webhookConfigs ?? [],
        members,
      }

      setSubmitting(true)
      if (mode === 'create') {
        await createRecipientGroup(payload)
        message.success(t('message.create.success'))
      } else if (initialData?.uid) {
        await updateRecipientGroup(initialData.uid, {
          ...payload,
          uid: initialData.uid,
        })
        message.success(t('message.update.success'))
      } else {
        return
      }
      onSuccess()
      handleCancel()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      console.error('保存收件人组失败:', error)
      message.error(t('message.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={
        mode === 'create'
          ? t('recipientGroup.modal.create.title')
          : t('recipientGroup.modal.edit.title')
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      destroyOnHidden
      confirmLoading={submitting}
      okButtonProps={{ disabled: formLoading }}
      okText={t('common.submit')}
      width={900}
    >
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item
          name='name'
          label={t('recipientGroup.form.name.label')}
          rules={[
            {
              required: true,
              message: t('recipientGroup.form.name.required'),
            },
          ]}
        >
          <Input
            placeholder={t('recipientGroup.form.name.placeholder')}
            maxLength={100}
            disabled={formLoading}
          />
        </Form.Item>

        <KeyValueEditor
          name='metadataPairs'
          label={t('recipientGroup.form.metadata.label')}
          extra={t('recipientGroup.form.metadata.help')}
          disabled={formLoading}
        />

        <Form.Item
          name='templates'
          label={t('recipientGroup.form.templates.label')}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={templateOptions}
            placeholder={t('recipientGroup.form.templates.placeholder')}
            disabled={formLoading}
            maxTagCount='responsive'
          />
        </Form.Item>

        <Form.Item
          name='emailConfigs'
          label={t('recipientGroup.form.emailConfigs.label')}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={emailOptions}
            placeholder={t('recipientGroup.form.emailConfigs.placeholder')}
            disabled={formLoading}
            maxTagCount='responsive'
          />
        </Form.Item>

        <Form.Item
          name='webhookConfigs'
          label={t('recipientGroup.form.webhookConfigs.label')}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={webhookOptions}
            placeholder={t('recipientGroup.form.webhookConfigs.placeholder')}
            disabled={formLoading}
            maxTagCount='responsive'
          />
        </Form.Item>

        <Divider>{t('recipientGroup.form.members.title')}</Divider>

        <Form.List
          name='members'
          rules={[
            {
              validator: async (_, members?: GroupMemberFormValue[]) => {
                const selected = (members ?? [])
                  .map((item) => item?.memberUid)
                  .filter((item): item is string => Boolean(item))
                if (new Set(selected).size !== selected.length) {
                  throw new Error(t('recipientGroup.form.member.duplicate'))
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <div className='flex flex-col gap-2'>
              {fields.map((field) => (
                <div
                  key={field.key}
                  className='rounded-md border border-(--ant-color-border-secondary) px-3 pb-2 pt-1'
                >
                  <div className='mb-1 flex justify-end'>
                    <Button
                      type='link'
                      danger
                      size='small'
                      className='h-auto px-1'
                      onClick={() => remove(field.name)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                  <Row gutter={12} align='middle' wrap={false}>
                    <Col span={12}>
                      <Form.Item
                        name={[field.name, 'memberUid']}
                        rules={[
                          {
                            required: true,
                            message: t('recipientGroup.form.member.required'),
                          },
                        ]}
                        noStyle
                      >
                        <Select
                          className='w-full'
                          showSearch={{ optionFilterProp: 'label' }}
                          allowClear
                          options={memberOptions.map((item) => ({
                            ...item,
                            disabled:
                              item.disabled ||
                              watchedMembers.some(
                                (member, index) =>
                                  index !== field.name &&
                                  member?.memberUid === item.value,
                              ),
                          }))}
                          placeholder={t(
                            'recipientGroup.form.member.placeholder',
                          )}
                          disabled={formLoading}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Flex gap={4} align='center' wrap={false}>
                        <Form.Item
                          name={[field.name, 'isEmail']}
                          valuePropName='checked'
                          noStyle
                        >
                          <Checkbox disabled={formLoading}>
                            {t('recipientGroup.form.channel.email')}
                          </Checkbox>
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'isSms']}
                          valuePropName='checked'
                          noStyle
                        >
                          <Checkbox disabled={formLoading}>
                            {t('recipientGroup.form.channel.sms')}
                          </Checkbox>
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'isPhone']}
                          valuePropName='checked'
                          noStyle
                        >
                          <Checkbox disabled={formLoading}>
                            {t('recipientGroup.form.channel.phone')}
                          </Checkbox>
                        </Form.Item>
                      </Flex>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button onClick={() => add()}>{t('common.add')}</Button>
              <Form.ErrorList errors={errors} />
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
