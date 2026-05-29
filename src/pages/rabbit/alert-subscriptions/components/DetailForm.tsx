import { useEffect, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  message,
} from 'antd'
import KeyValueEditor, {
  keyValueRowsToRecord,
  recordToKeyValueRows,
  type KeyValueRow,
} from '@/components/KeyValueEditor'
import { useLocale } from '@/contexts/LocaleContext'
import { GlobalStatus } from '@/api/common/types'
import {
  createAlertSubscription,
  updateAlertSubscription,
  type AlertSubscriptionItem,
  type AlertSubscriptionMemberRequest,
  type CreateAlertSubscriptionParams,
  type UpdateAlertSubscriptionParams,
} from '@/api/rabbit/alert'
import { getRecipientGroupSelectList } from '@/api/rabbit/recipient-group'
import { getEmailConfigSelectList } from '@/api/rabbit/email'
import { getTemplateSelectList } from '@/api/rabbit/template'
import { selectMembers } from '@/api/account/member'
import { MemberStatus } from '@/api/account/member'

const { TextArea } = Input

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  tooltip?: string
}

interface SubscriptionMemberFormValue {
  memberUid?: string
  isEmail?: boolean
  isSms?: boolean
  isPhone?: boolean
}

interface AlertSubscriptionFormValues {
  name?: string
  remark?: string
  labelsPairs?: KeyValueRow[]
  excludeLabelsPairs?: KeyValueRow[]
  recipientGroupUids?: string[]
  members?: SubscriptionMemberFormValue[]
  directMemberEmailConfigUid?: string
  directMemberTemplateUid?: string
}

export interface AlertSubscriptionDetailFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: AlertSubscriptionItem | null
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
  members?: SubscriptionMemberFormValue[],
): AlertSubscriptionMemberRequest[] => {
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

export default function AlertSubscriptionDetailForm({
  open,
  mode,
  initialData,
  formLoading = false,
  onCancel,
  onSuccess,
}: AlertSubscriptionDetailFormProps) {
  const { t } = useLocale()
  const [form] = Form.useForm<AlertSubscriptionFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [recipientGroupOptions, setRecipientGroupOptions] = useState<
    SelectOption[]
  >([])
  const [memberOptions, setMemberOptions] = useState<SelectOption[]>([])
  const [emailOptions, setEmailOptions] = useState<SelectOption[]>([])
  const [templateOptions, setTemplateOptions] = useState<SelectOption[]>([])

  const watchedMembers = Form.useWatch('members', form) ?? []

  const loadOptions = useMemoizedFn(async () => {
    const [groupRes, memberRes, emailRes, templateRes] = await Promise.all([
      getRecipientGroupSelectList({
        limit: 100,
        status: GlobalStatus.ENABLED,
      }),
      selectMembers({ limit: 100, status: MemberStatus.JOINED }),
      getEmailConfigSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      getTemplateSelectList({
        limit: 100,
        status: GlobalStatus.ENABLED,
      }),
    ])
    setRecipientGroupOptions(toSelectOptions(groupRes.items))
    setMemberOptions(toSelectOptions(memberRes.items))
    setEmailOptions(toSelectOptions(emailRes.items))
    setTemplateOptions(toSelectOptions(templateRes.items))
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
        remark: initialData.remark,
        labelsPairs: recordToKeyValueRows(initialData.labels),
        excludeLabelsPairs: recordToKeyValueRows(initialData.excludeLabels),
        recipientGroupUids: initialData.recipientGroupUids ?? [],
        directMemberEmailConfigUid: initialData.directMemberEmailConfigUid,
        directMemberTemplateUid: initialData.directMemberTemplateUid,
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
      form.setFieldsValue({
        labelsPairs: [],
        excludeLabelsPairs: [],
        members: [],
      })
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
      const payload:
        | CreateAlertSubscriptionParams
        | UpdateAlertSubscriptionParams = {
        name: values.name?.trim(),
        remark: values.remark?.trim(),
        labels: keyValueRowsToRecord(values.labelsPairs),
        excludeLabels: keyValueRowsToRecord(values.excludeLabelsPairs),
        recipientGroupUids: values.recipientGroupUids ?? [],
        members,
        directMemberEmailConfigUid: values.directMemberEmailConfigUid,
        directMemberTemplateUid: values.directMemberTemplateUid,
      }

      setSubmitting(true)
      if (mode === 'create') {
        await createAlertSubscription(payload)
        message.success(t('message.create.success'))
      } else if (initialData?.uid) {
        await updateAlertSubscription(initialData.uid, {
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
      console.error('保存告警订阅失败:', error)
      message.error(t('message.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={
        mode === 'create'
          ? t('alertSubscription.modal.create.title')
          : t('alertSubscription.modal.edit.title')
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
          label={t('alertSubscription.form.name.label')}
          rules={[
            {
              required: true,
              message: t('alertSubscription.form.name.required'),
            },
          ]}
        >
          <Input
            placeholder={t('alertSubscription.form.name.placeholder')}
            maxLength={100}
            disabled={formLoading}
          />
        </Form.Item>

        <Form.Item
          name='remark'
          label={t('alertSubscription.form.remark.label')}
        >
          <TextArea
            rows={3}
            placeholder={t('alertSubscription.form.remark.placeholder')}
            disabled={formLoading}
          />
        </Form.Item>

        <Divider>{t('alertSubscription.form.filter.title')}</Divider>

        <KeyValueEditor
          name='labelsPairs'
          label={t('alertSubscription.form.labels.label')}
          extra={t('alertSubscription.form.labels.help')}
          disabled={formLoading}
        />

        <KeyValueEditor
          name='excludeLabelsPairs'
          label={t('alertSubscription.form.excludeLabels.label')}
          disabled={formLoading}
        />

        <Divider>{t('alertSubscription.form.delivery.title')}</Divider>

        <Form.Item
          name='recipientGroupUids'
          label={t('alertSubscription.form.recipientGroups.label')}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={recipientGroupOptions}
            placeholder={t(
              'alertSubscription.form.recipientGroups.placeholder',
            )}
            disabled={formLoading}
            maxTagCount='responsive'
          />
        </Form.Item>

        <Form.Item
          name='directMemberEmailConfigUid'
          label={t('alertSubscription.form.directEmailConfig.label')}
        >
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={emailOptions}
            placeholder={t(
              'alertSubscription.form.directEmailConfig.placeholder',
            )}
            disabled={formLoading}
          />
        </Form.Item>

        <Form.Item
          name='directMemberTemplateUid'
          label={t('alertSubscription.form.directTemplate.label')}
        >
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={templateOptions}
            placeholder={t('alertSubscription.form.directTemplate.placeholder')}
            disabled={formLoading}
          />
        </Form.Item>

        <Divider>{t('alertSubscription.form.members.title')}</Divider>

        <Form.List
          name='members'
          rules={[
            {
              validator: async (_, members?: SubscriptionMemberFormValue[]) => {
                const selected = (members ?? [])
                  .map((item) => item?.memberUid)
                  .filter((item): item is string => Boolean(item))
                if (new Set(selected).size !== selected.length) {
                  throw new Error(t('alertSubscription.form.member.duplicate'))
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <div className='flex flex-col gap-3'>
              {fields.map((field) => (
                <div
                  key={field.key}
                  className='rounded-md border border-(--ant-color-border-secondary) p-3'
                >
                  <Space wrap align='start' className='w-full justify-between'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-3 flex-1'>
                      <Form.Item
                        name={[field.name, 'memberUid']}
                        label={t('alertSubscription.form.member.label')}
                        rules={[
                          {
                            required: true,
                            message: t(
                              'alertSubscription.form.member.required',
                            ),
                          },
                        ]}
                      >
                        <Select
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
                            'alertSubscription.form.member.placeholder',
                          )}
                          disabled={formLoading}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'isEmail']}
                        valuePropName='checked'
                        label={t('alertSubscription.form.channel.email')}
                      >
                        <Checkbox disabled={formLoading}>
                          {t('alertSubscription.form.channel.email')}
                        </Checkbox>
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'isSms']}
                        valuePropName='checked'
                        label={t('alertSubscription.form.channel.sms')}
                      >
                        <Checkbox disabled={formLoading}>
                          {t('alertSubscription.form.channel.sms')}
                        </Checkbox>
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'isPhone']}
                        valuePropName='checked'
                        label={t('alertSubscription.form.channel.phone')}
                      >
                        <Checkbox disabled={formLoading}>
                          {t('alertSubscription.form.channel.phone')}
                        </Checkbox>
                      </Form.Item>
                    </div>
                    <Button danger onClick={() => remove(field.name)}>
                      {t('common.delete')}
                    </Button>
                  </Space>
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
