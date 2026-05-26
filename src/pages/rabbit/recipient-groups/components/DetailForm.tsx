import { useCallback, useEffect, useState } from 'react'
import { Form, Input, Modal, Select, message } from 'antd'
import KeyValueEditor, {
  keyValueRowsToRecord,
  recordToKeyValueRows,
  type KeyValueRow,
} from '@/components/KeyValueEditor'
import { useLocale } from '@/contexts/LocaleContext'
import { GlobalStatus } from '@/api/common/types'
import {
  createRecipientGroup,
  updateRecipientGroup,
  type CreateRecipientGroupParams,
  type RecipientGroupItem,
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

interface RecipientGroupFormValues {
  name?: string
  metadataPairs?: KeyValueRow[]
  templates?: string[]
  emailConfigs?: string[]
  webhookConfigs?: string[]
  members?: string[]
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

  const loadOptions = useCallback(async () => {
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
  }, [])

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
        members: (initialData.members ?? [])
          .map((item) => item.uid)
          .filter((value): value is string => Boolean(value)),
      })
      return
    }
    if (mode === 'create') {
      form.resetFields()
      form.setFieldsValue({ metadataPairs: [] })
    }
  }, [open, mode, initialData, form])

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: CreateRecipientGroupParams | UpdateRecipientGroupParams = {
        name: values.name?.trim(),
        metadata: keyValueRowsToRecord(values.metadataPairs),
        templates: values.templates ?? [],
        emailConfigs: values.emailConfigs ?? [],
        webhookConfigs: values.webhookConfigs ?? [],
        members: values.members ?? [],
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
      width={760}
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
            showSearch
            options={templateOptions}
            placeholder={t('recipientGroup.form.templates.placeholder')}
            disabled={formLoading}
            optionFilterProp='label'
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
            showSearch
            options={emailOptions}
            placeholder={t('recipientGroup.form.emailConfigs.placeholder')}
            disabled={formLoading}
            optionFilterProp='label'
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
            showSearch
            options={webhookOptions}
            placeholder={t('recipientGroup.form.webhookConfigs.placeholder')}
            disabled={formLoading}
            optionFilterProp='label'
            maxTagCount='responsive'
          />
        </Form.Item>

        <Form.Item
          name='members'
          label={t('recipientGroup.form.members.label')}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch
            options={memberOptions}
            placeholder={t('recipientGroup.form.members.placeholder')}
            disabled={formLoading}
            optionFilterProp='label'
            maxTagCount='responsive'
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
