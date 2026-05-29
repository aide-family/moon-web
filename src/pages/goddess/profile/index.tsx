import React, { useState, useRef } from 'react'
import { useMemoizedFn, useMount, useSafeState } from 'ahooks'
import {
  Avatar,
  Spin,
  Tag,
  Typography,
  theme,
  Button,
  Modal,
  Form,
  Input,
  App,
  Tooltip,
} from 'antd'
import { UserOutlined, MailOutlined, EditOutlined } from '@ant-design/icons'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import {
  getSelfInfo,
  changeEmail,
  changeAvatar,
  changePhone,
  changeRemark,
} from '@/api/account/self'
import type { SelfInfo } from '@/api/account/self/types'
import { parseUserStatus } from '@/api/account/user'

const { Title, Text } = Typography

const STATUS_TEXT_KEYS: Record<string, string> = {
  UserStatus_UNKNOWN: 'user.status.UserStatus_UNKNOWN',
  ACTIVE: 'user.status.ACTIVE',
  BANNED: 'user.status.BANNED',
}
const STATUS_COLORS: Record<string, string> = {
  UserStatus_UNKNOWN: 'default',
  ACTIVE: 'success',
  BANNED: 'error',
}
const DEFAULT_STATUS_KEY = 'user.status.UserStatus_UNKNOWN'

const EMPTY = '—'

function fill(v: string | undefined): string {
  return !v ? EMPTY : v
}

const ProfilePage: React.FC = () => {
  const { t } = useLocale()
  const { message: messageApi } = App.useApp()
  const {
    token: {
      colorPrimary,
      colorBgContainer,
      colorBorderSecondary,
      colorTextSecondary,
      colorTextTertiary,
      boxShadowSecondary,
    },
  } = theme.useToken()

  const fetchingRef = useRef(false)
  const [loading, setLoading] = useSafeState(true)
  const [info, setInfo] = useSafeState<SelfInfo | null>(null)

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [phoneModalOpen, setPhoneModalOpen] = useState(false)
  const [remarkModalOpen, setRemarkModalOpen] = useState(false)
  const [emailForm] = Form.useForm()
  const [avatarForm] = Form.useForm()
  const [phoneForm] = Form.useForm()
  const [remarkForm] = Form.useForm()
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [avatarSubmitting, setAvatarSubmitting] = useState(false)
  const [phoneSubmitting, setPhoneSubmitting] = useState(false)
  const [remarkSubmitting, setRemarkSubmitting] = useState(false)

  const fetchInfo = useMemoizedFn(() => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    getSelfInfo()
      .then((data) => {
        setInfo(data ?? null)
      })
      .catch(() => {
        setInfo(null)
      })
      .finally(() => {
        fetchingRef.current = false
        setLoading(false)
      })
  })

  useMount(() => {
    fetchInfo()
  })

  const handleEmailOk = useMemoizedFn(() => {
    emailForm.validateFields().then((values) => {
      setEmailSubmitting(true)
      const newEmail = values.email
      changeEmail({ email: newEmail })
        .then(() => {
          setEmailModalOpen(false)
          emailForm.resetFields()
          setInfo((prev) => (prev ? { ...prev, email: newEmail } : null))
          messageApi.success(t('common.save') + ' ' + t('self.email'))
          fetchInfo()
        })
        .catch((e) => {
          console.error('changeEmail failed', e)
          messageApi.error(t('user.changeEmail') + ' ' + t('common.failed'))
        })
        .finally(() => {
          setEmailSubmitting(false)
        })
    })
  })

  const handleAvatarOk = useMemoizedFn(() => {
    avatarForm.validateFields().then((values) => {
      setAvatarSubmitting(true)
      const newAvatar = values.avatar
      changeAvatar({ avatar: newAvatar })
        .then(() => {
          setAvatarModalOpen(false)
          avatarForm.resetFields()
          setInfo((prev) => (prev ? { ...prev, avatar: newAvatar } : null))
          messageApi.success(t('common.save') + ' ' + t('self.avatar'))
          fetchInfo()
        })
        .catch((e) => {
          console.error('changeAvatar failed', e)
          messageApi.error(t('user.changeAvatar') + ' ' + t('common.failed'))
        })
        .finally(() => {
          setAvatarSubmitting(false)
        })
    })
  })

  const handleEmailCancel = useMemoizedFn(() => {
    setEmailModalOpen(false)
    emailForm.resetFields()
  })

  const handleAvatarCancel = useMemoizedFn(() => {
    setAvatarModalOpen(false)
    avatarForm.resetFields()
  })

  const handlePhoneOk = useMemoizedFn(() => {
    phoneForm.validateFields().then((values) => {
      setPhoneSubmitting(true)
      const newPhone = values.phone
      changePhone({ phone: newPhone })
        .then(() => {
          setPhoneModalOpen(false)
          phoneForm.resetFields()
          setInfo((prev) => (prev ? { ...prev, phone: newPhone } : null))
          messageApi.success(t('common.save') + ' ' + t('profile.phone'))
          fetchInfo()
        })
        .catch((e) => {
          console.error('changePhone failed', e)
          messageApi.error(t('user.changePhone') + ' ' + t('common.failed'))
        })
        .finally(() => {
          setPhoneSubmitting(false)
        })
    })
  })

  const handlePhoneCancel = useMemoizedFn(() => {
    setPhoneModalOpen(false)
    phoneForm.resetFields()
  })

  const handleRemarkOk = useMemoizedFn(() => {
    return remarkForm.validateFields().then((values) => {
      setRemarkSubmitting(true)
      const newRemark = values.remark ?? ''
      return changeRemark({ remark: newRemark })
        .then(() => {
          setRemarkModalOpen(false)
          remarkForm.resetFields()
          setInfo((prev) => (prev ? { ...prev, remark: newRemark } : null))
          messageApi.success(t('common.save') + ' ' + t('profile.remark'))
          fetchInfo()
        })
        .catch((e) => {
          console.error('changeRemark failed', e)
          messageApi.error(t('user.changeRemark') + ' ' + t('common.failed'))
        })
        .finally(() => {
          setRemarkSubmitting(false)
        })
    })
  })

  const handleRemarkCancel = useMemoizedFn(() => {
    setRemarkModalOpen(false)
    remarkForm.resetFields()
  })

  if (loading) {
    return (
      <PageContent>
        <div className='w-full' style={{ minHeight: 420 }}>
          <Spin size='large' tip={t('common.loading')}>
            <div className='w-full' style={{ minHeight: 420 }} />
          </Spin>
        </div>
      </PageContent>
    )
  }

  const displayName = info?.nickname || info?.name || '-'
  const statusRaw = info?.status != null ? String(info.status) : undefined
  const parsedStatus = parseUserStatus(statusRaw)
  const statusTextKey = STATUS_TEXT_KEYS[parsedStatus] ?? DEFAULT_STATUS_KEY
  const statusDisplay = info?.status != null ? t(statusTextKey) : undefined
  const statusColor = STATUS_COLORS[parsedStatus] ?? 'default'

  const primaryRgb = colorPrimary.startsWith('#')
    ? (() => {
        const hex = colorPrimary.slice(1)
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        return `${r}, ${g}, ${b}`
      })()
    : '108, 52, 230'

  const coverGradient = `linear-gradient(160deg, rgba(${primaryRgb}, 0.18) 0%, rgba(${primaryRgb}, 0.06) 45%, transparent 70%)`

  const cardStyle = {
    background: colorBgContainer,
    border: `1px solid ${colorBorderSecondary}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }
  const sectionTitleStyle = {
    color: colorTextSecondary,
    borderColor: colorPrimary,
  }

  return (
    <PageContent className='p-0! overflow-hidden h-full!'>
      <div className='flex flex-col h-full min-h-0 w-full'>
        {/* 大屏：左右分栏；小屏：上下堆叠 */}
        <div className='flex flex-1 min-h-0 flex-col lg:flex-row'>
          {/* 左侧：封面 + 头像 + 姓名 + 统计（固定高度区，不滚动） */}
          <div
            className='shrink-0 flex flex-col lg:w-64 xl:w-72 lg:border-r lg:border-solid'
            style={{
              borderColor: colorBorderSecondary,
              background: coverGradient,
            }}
          >
            <div
              className='relative w-full shrink-0'
              style={{
                height: 100,
                borderBottom: `1px solid ${colorBorderSecondary}`,
              }}
            />
            <div
              className='relative flex flex-col items-center px-3 pt-0 pb-3'
              style={{ marginTop: -40 }}
            >
              <Tooltip title={t('profile.changeAvatarTip')}>
                <div
                  role='button'
                  tabIndex={0}
                  className='rounded-full overflow-hidden shrink-0 border-4 border-solid cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90'
                  style={{
                    width: 80,
                    height: 80,
                    borderColor: colorBgContainer,
                    boxShadow: boxShadowSecondary,
                  }}
                  onClick={() => setAvatarModalOpen(true)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && setAvatarModalOpen(true)
                  }
                >
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    src={info?.avatar}
                    className='w-full! h-full! flex! items-center! justify-center! rounded-full!'
                  />
                </div>
              </Tooltip>
              <Title
                level={5}
                className='mt-3 mb-0.5 font-semibold!'
                style={{ letterSpacing: '-0.02em', fontSize: 16 }}
              >
                {displayName}
              </Title>
              {info?.email && (
                <Text
                  type='secondary'
                  className='flex items-center gap-1.5 mb-1 text-xs truncate max-w-full px-1'
                >
                  <MailOutlined />
                  <span className='truncate'>{info.email}</span>
                </Text>
              )}
              {statusDisplay && (
                <Tag color={statusColor} className='m-0!'>
                  {statusDisplay}
                </Tag>
              )}
            </div>
          </div>

          {/* 右侧：信息卡片区，账户卡片拉伸填满底部避免大块留白 */}
          <div className='flex-1 min-w-0 min-h-0 overflow-y-auto p-4 lg:p-5 flex flex-col'>
            <div className='flex flex-col flex-1 min-h-0'>
              <div className='grid gap-4 lg:grid-cols-2 w-full shrink-0'>
                {/* Identity */}
                <section className='min-w-0'>
                  <div
                    className='mb-2 text-xs font-medium tracking-widest pl-3 border-l-4'
                    style={sectionTitleStyle}
                  >
                    {t('profile.identity')}
                  </div>
                  <div
                    className='rounded-xl p-4 transition-shadow hover:shadow-md'
                    style={cardStyle}
                  >
                    <div className='space-y-3'>
                      <div>
                        <Text
                          style={{ fontSize: 12, color: colorTextTertiary }}
                        >
                          {t('profile.name')}
                        </Text>
                        <div className='mt-0.5 font-medium text-sm'>
                          {fill(info?.name)}
                        </div>
                      </div>
                      <div>
                        <Text
                          style={{ fontSize: 12, color: colorTextTertiary }}
                        >
                          {t('profile.nickname')}
                        </Text>
                        <div className='mt-0.5 font-medium text-sm'>
                          {fill(info?.nickname)}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className='min-w-0'>
                  <div
                    className='mb-2 text-xs font-medium tracking-widest pl-3 border-l-4'
                    style={sectionTitleStyle}
                  >
                    {t('profile.contact')}
                  </div>
                  <div
                    className='rounded-xl p-4 transition-shadow hover:shadow-md'
                    style={cardStyle}
                  >
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <Text
                            style={{ fontSize: 12, color: colorTextTertiary }}
                          >
                            {t('self.email')}
                          </Text>
                          <div className='mt-0.5 font-medium text-sm break-all'>
                            {fill(info?.email)}
                          </div>
                        </div>
                        <Button
                          type='primary'
                          ghost
                          size='small'
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEmailModalOpen(true)
                            emailForm.setFieldValue('email', info?.email ?? '')
                          }}
                        >
                          {t('user.changeEmail')}
                        </Button>
                      </div>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <Text
                            style={{ fontSize: 12, color: colorTextTertiary }}
                          >
                            {t('profile.phone')}
                          </Text>
                          <div className='mt-0.5 font-medium text-sm break-all'>
                            {fill(info?.phone)}
                          </div>
                        </div>
                        <Button
                          type='primary'
                          ghost
                          size='small'
                          icon={<EditOutlined />}
                          onClick={() => {
                            setPhoneModalOpen(true)
                            phoneForm.setFieldValue('phone', info?.phone ?? '')
                          }}
                        >
                          {t('user.changePhone')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Account - 拉伸填满剩余高度，底部不再大片留白 */}
              <section className='min-w-0 flex-1 min-h-0 flex flex-col mt-4'>
                <div
                  className='mb-2 text-xs font-medium tracking-widest pl-3 border-l-4 shrink-0'
                  style={sectionTitleStyle}
                >
                  {t('profile.accountInfo')}
                </div>
                <div
                  className='rounded-xl p-4 transition-shadow hover:shadow-md flex-1 min-h-0 flex flex-col'
                  style={cardStyle}
                >
                  <div className='grid gap-2 gap-x-4 grid-cols-1 sm:grid-cols-3 shrink-0'>
                    <div className='min-w-0'>
                      <Text style={{ fontSize: 12, color: colorTextTertiary }}>
                        {t('profile.uid')}
                      </Text>
                      <div className='mt-0.5 font-mono text-sm break-all'>
                        {fill(info?.uid)}
                      </div>
                    </div>
                    <div className='min-w-0'>
                      <Text style={{ fontSize: 12, color: colorTextTertiary }}>
                        {t('profile.joinedAt')}
                      </Text>
                      <div className='mt-0.5 font-medium text-sm break-all'>
                        {fill(info?.createdAt)}
                      </div>
                    </div>
                    <div className='min-w-0'>
                      <Text style={{ fontSize: 12, color: colorTextTertiary }}>
                        {t('profile.lastUpdated')}
                      </Text>
                      <div className='mt-0.5 font-medium text-sm break-all'>
                        {fill(info?.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className='mt-2 pt-2 shrink-0 flex items-start justify-between gap-2'
                    style={{ borderTop: `1px solid ${colorBorderSecondary}` }}
                  >
                    <div className='min-w-0 flex-1'>
                      <Text style={{ fontSize: 12, color: colorTextTertiary }}>
                        {t('profile.remark')}
                      </Text>
                      <div className='mt-0.5 font-medium text-sm whitespace-pre-wrap wrap-break-word'>
                        {fill(info?.remark)}
                      </div>
                    </div>
                    <Button
                      type='primary'
                      ghost
                      size='small'
                      icon={<EditOutlined />}
                      onClick={() => {
                        setRemarkModalOpen(true)
                        remarkForm.setFieldValue('remark', info?.remark ?? '')
                      }}
                    >
                      {t('user.changeRemark')}
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={t('user.changeEmail')}
        open={emailModalOpen}
        onOk={handleEmailOk}
        onCancel={handleEmailCancel}
        confirmLoading={emailSubmitting}
        destroyOnHidden
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Form form={emailForm} layout='vertical' className='mt-4'>
          <Form.Item
            name='email'
            label={t('self.email')}
            rules={[{ required: true, message: t('self.emailPlaceholder') }]}
          >
            <Input placeholder={t('self.emailPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('user.changeAvatar')}
        open={avatarModalOpen}
        onOk={handleAvatarOk}
        onCancel={handleAvatarCancel}
        confirmLoading={avatarSubmitting}
        destroyOnHidden
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Form form={avatarForm} layout='vertical' className='mt-4'>
          <Form.Item
            name='avatar'
            label={t('self.avatar')}
            rules={[{ required: true, message: t('self.avatarPlaceholder') }]}
          >
            <Input placeholder={t('self.avatarPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('user.changePhone')}
        open={phoneModalOpen}
        onOk={handlePhoneOk}
        onCancel={handlePhoneCancel}
        confirmLoading={phoneSubmitting}
        destroyOnHidden
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Form form={phoneForm} layout='vertical' className='mt-4'>
          <Form.Item
            name='phone'
            label={t('profile.phone')}
            rules={[{ required: true, message: t('self.phonePlaceholder') }]}
          >
            <Input placeholder={t('self.phonePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('user.changeRemark')}
        open={remarkModalOpen}
        onOk={handleRemarkOk}
        onCancel={handleRemarkCancel}
        confirmLoading={remarkSubmitting}
        destroyOnHidden
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Form form={remarkForm} layout='vertical' className='mt-4'>
          <Form.Item name='remark' label={t('profile.remark')}>
            <Input.TextArea
              placeholder={t('self.remarkPlaceholder')}
              rows={4}
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContent>
  )
}

export default ProfilePage
