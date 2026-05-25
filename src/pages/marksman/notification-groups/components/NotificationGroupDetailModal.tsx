import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  message,
} from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import {
  createNotificationGroup,
  updateNotificationGroup,
  type CreateNotificationGroupParams,
  type NotificationGroupItem,
  type NotificationMemberItem,
  type UpdateNotificationGroupParams,
} from '@/api/marksman/notificationGroup'
import { getMember } from '@/api/account/member'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  title?: string
}

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: NotificationGroupItem | null
  loading?: boolean
  onCancel: () => void
  onSuccess: (uid?: string) => void
  memberOptions: SelectOption[]
  webhookOptions: SelectOption[]
  templateOptions: SelectOption[]
}

const parseMetadata = (raw: unknown): Record<string, string> | undefined => {
  const text = raw != null ? String(raw).trim() : ''
  if (!text) return undefined
  const parsed = JSON.parse(text) as unknown
  if (typeof parsed !== 'object' || parsed == null || Array.isArray(parsed)) {
    return undefined
  }
  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
      k,
      String(v),
    ]),
  )
}

const toMemberMap = (
  members?: NotificationMemberItem[],
): Record<string, NotificationMemberItem> => {
  const m: Record<string, NotificationMemberItem> = {}
  for (const item of members ?? []) {
    const uid = item.memberUid?.trim()
    if (!uid) continue
    m[uid] = item
  }
  return m
}

export const NotificationGroupDetailModal: React.FC<Props> = ({
  open,
  mode,
  initialData,
  loading = false,
  onCancel,
  onSuccess,
  memberOptions,
  webhookOptions,
  templateOptions,
}) => {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const members = Form.useWatch('members', form) as
    | NotificationMemberItem[]
    | undefined
  const memberFetchInFlightRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    if (mode === 'edit') {
      form.setFieldsValue({
        name: initialData?.name ?? '',
        remark: initialData?.remark ?? '',
        metadata: initialData?.metadata
          ? JSON.stringify(initialData.metadata, null, 2)
          : '',
        webhooks: initialData?.webhooks ?? [],
        templates: initialData?.templates ?? [],
        members: initialData?.members ?? [],
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        members: [],
      })
    }
  }, [open, mode, initialData, form])

  // Best-effort enrich members with name/avatar for edit display.
  useEffect(() => {
    if (!open) return

    const currentMembers = members ?? []
    const uidsToFetch = currentMembers
      .map((m) => m.memberUid?.trim())
      .filter((u): u is string => Boolean(u))
      .filter((uid) => {
        const member = currentMembers.find((m) => m.memberUid === uid)
        if (!member) return false
        return (
          !member.memberName &&
          !member.memberAvatar &&
          !memberFetchInFlightRef.current.has(uid)
        )
      })

    if (uidsToFetch.length === 0) return

    void (async () => {
      for (const uid of uidsToFetch) memberFetchInFlightRef.current.add(uid)

      try {
        const results = await Promise.allSettled(
          uidsToFetch.map((uid) => getMember(uid)),
        )

        const infoByUid = new Map<string, { name?: string; avatar?: string }>()
        results.forEach((r, idx) => {
          if (r.status !== 'fulfilled') return
          const uid = uidsToFetch[idx]
          infoByUid.set(uid, {
            name: r.value?.name ?? r.value?.nickname,
            avatar: r.value?.avatar,
          })
        })

        const updatedMembers = (form.getFieldValue('members') ??
          []) as NotificationMemberItem[]

        const nextMembers = updatedMembers.map((m) => {
          const uid = m.memberUid?.trim()
          if (!uid) return m
          const info = infoByUid.get(uid)
          if (!info) return m
          return {
            ...m,
            memberName: m.memberName ?? info.name,
            memberAvatar: m.memberAvatar ?? info.avatar,
          }
        })

        form.setFieldsValue({
          members: nextMembers,
        })
      } finally {
        for (const uid of uidsToFetch) {
          memberFetchInFlightRef.current.delete(uid)
        }
      }
    })()
  }, [open, members, form])

  const existingMemberMap = useMemo(
    () => toMemberMap(initialData?.members),
    [initialData?.members],
  )

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let metadata: Record<string, string> | undefined
      try {
        metadata = parseMetadata(values.metadata)
      } catch {
        message.error(t('message.error'))
        return
      }
      const name = values.name?.trim() || undefined
      const remark = values.remark?.trim() || undefined
      const membersForRequest = (members ?? []).filter((i) =>
        (i.memberUid ?? '').trim(),
      )
      const membersRequest = membersForRequest.map((m) => ({
        memberUid: m.memberUid,
        isEmail: m.isEmail,
        isPhone: m.isPhone,
      }))

      if (mode === 'create') {
        const params: CreateNotificationGroupParams = {
          name,
          remark,
          metadata,
          members: membersRequest,
          webhooks: (values.webhooks ?? []) as string[],
          templates: (values.templates ?? []) as string[],
        }
        const created = await createNotificationGroup(params)
        message.success(t('message.create.success'))
        onSuccess(created.uid)
      } else if (mode === 'edit' && initialData?.uid) {
        const params: UpdateNotificationGroupParams = {
          uid: initialData.uid,
          name,
          remark,
          metadata,
          members: membersRequest,
          webhooks: (values.webhooks ?? []) as string[],
          templates: (values.templates ?? []) as string[],
        }
        await updateNotificationGroup(initialData.uid, params)
        message.success(t('message.update.success'))
        onSuccess(initialData.uid)
      } else {
        onSuccess(initialData?.uid)
      }
      onCancel()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('提交通知组失败:', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={
        mode === 'create'
          ? t('notificationGroup.modal.create.title')
          : t('notificationGroup.modal.edit.title')
      }
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      destroyOnHidden
      maskClosable
      confirmLoading={submitting || loading}
      okText={t('common.submit')}
    >
      <Form form={form} layout='vertical' preserve={false}>
        <Form.Item
          name='name'
          label={t('notificationGroup.form.name.label')}
          rules={[
            {
              required: true,
              message: t('notificationGroup.form.name.placeholder'),
            },
          ]}
        >
          <Input
            placeholder={t('notificationGroup.form.name.placeholder')}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name='remark'
          label={t('notificationGroup.form.remark.label')}
        >
          <Input.TextArea
            rows={2}
            placeholder={t('notificationGroup.form.remark.placeholder')}
            allowClear
          />
        </Form.Item>
        <Form.Item name='members' hidden>
          <Input type='hidden' />
        </Form.Item>
        <Form.Item label={t('notificationGroup.form.members.label')}>
          <Space direction='vertical' className='w-full' size='small'>
            <Select
              allowClear
              showSearch
              placeholder={t('notificationGroup.form.members.placeholder')}
              options={memberOptions}
              onSelect={(memberUid: string) => {
                const prevMembers = (form.getFieldValue('members') ??
                  []) as NotificationMemberItem[]
                if (prevMembers.some((i) => i.memberUid === memberUid)) return
                const existing = existingMemberMap[memberUid]
                form.setFieldValue('members', [
                  ...prevMembers,
                  existing ?? {
                    memberUid,
                    isEmail: true,
                    isPhone: true,
                  },
                ])
              }}
            />
            {(members ?? []).map((member, idx) => {
              const uid = member.memberUid ?? ''
              const option = memberOptions.find((i) => i.value === uid)
              return (
                <div
                  key={`${uid || 'member'}-${idx}`}
                  className='flex items-center gap-3 border rounded px-2 py-1'
                >
                  <Avatar size='small' src={member.memberAvatar} />
                  <div className='flex-1 min-w-0 truncate'>
                    {(member.memberName ?? option?.label ?? uid) || '-'}
                  </div>
                  <Checkbox
                    checked={Boolean(member.isEmail)}
                    onChange={(e) => {
                      const prevMembers = (form.getFieldValue('members') ??
                        []) as NotificationMemberItem[]
                      form.setFieldValue(
                        'members',
                        prevMembers.map((m) =>
                          m.memberUid === uid
                            ? { ...m, isEmail: e.target.checked }
                            : m,
                        ),
                      )
                    }}
                  >
                    {t('notificationGroup.memberModal.form.isEmail')}
                  </Checkbox>
                  <Checkbox
                    checked={Boolean(member.isPhone)}
                    onChange={(e) => {
                      const prevMembers = (form.getFieldValue('members') ??
                        []) as NotificationMemberItem[]
                      form.setFieldValue(
                        'members',
                        prevMembers.map((m) =>
                          m.memberUid === uid
                            ? { ...m, isPhone: e.target.checked }
                            : m,
                        ),
                      )
                    }}
                  >
                    {t('notificationGroup.memberModal.form.isPhone')}
                  </Checkbox>
                  <Button
                    type='link'
                    danger
                    size='small'
                    onClick={() => {
                      const prevMembers = (form.getFieldValue('members') ??
                        []) as NotificationMemberItem[]
                      form.setFieldValue(
                        'members',
                        prevMembers.filter((_, i) => i !== idx),
                      )
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              )
            })}
          </Space>
        </Form.Item>
        <Form.Item
          name='webhooks'
          label={t('notificationGroup.form.webhooks.label')}
        >
          <Select
            mode='multiple'
            allowClear
            placeholder={t('notificationGroup.form.webhooks.placeholder')}
            options={webhookOptions}
          />
        </Form.Item>
        <Form.Item
          name='templates'
          label={t('notificationGroup.form.templates.label')}
        >
          <Select
            mode='multiple'
            allowClear
            placeholder={t('notificationGroup.form.templates.placeholder')}
            options={templateOptions}
          />
        </Form.Item>
        <Form.Item
          name='metadata'
          label={t('notificationGroup.form.metadata.label')}
        >
          <Input.TextArea
            rows={4}
            placeholder={t('notificationGroup.form.metadata.placeholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
