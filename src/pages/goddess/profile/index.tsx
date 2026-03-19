import React, { useState, useEffect, useRef, useCallback } from 'react'
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

  const mountedRef = useRef(true)
  const [loading, setLoading] = useState(true)
  const [info, setInfo] = useState<SelfInfo | null>(null)

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [phoneModalOpen, setPhoneModalOpen] = useState(false)
  const [emailForm] = Form.useForm()
  const [avatarForm] = Form.useForm()
  const [phoneForm] = Form.useForm()
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [avatarSubmitting, setAvatarSubmitting] = useState(false)
  const [phoneSubmitting, setPhoneSubmitting] = useState(false)

  const fetchInfo = useCallback(() => {
    getSelfInfo()
      .then((data) => {
        if (mountedRef.current) setInfo(data ?? null)
      })
      .catch(() => {
        if (mountedRef.current) setInfo(null)
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false)
      })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    getSelfInfo()
      .then((data) => {
        if (mountedRef.current) setInfo(data ?? null)
      })
      .catch(() => {
        if (mountedRef.current) setInfo(null)
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false)
      })
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleEmailOk = useCallback(() => {
    emailForm.validateFields().then((values) => {
      setEmailSubmitting(true)
      changeEmail({ email: values.email })
        .then(() => {
          messageApi.success(t('common.save') + ' ' + t('self.email'))
          setEmailModalOpen(false)
          emailForm.resetFields()
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
  }, [emailForm, messageApi, t, fetchInfo])

  const handleAvatarOk = useCallback(() => {
    avatarForm.validateFields().then((values) => {
      setAvatarSubmitting(true)
      changeAvatar({ avatar: values.avatar })
        .then(() => {
          messageApi.success(t('common.save') + ' ' + t('self.avatar'))
          setAvatarModalOpen(false)
          avatarForm.resetFields()
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
  }, [avatarForm, messageApi, t, fetchInfo])

  const handleEmailCancel = useCallback(() => {
    setEmailModalOpen(false)
    emailForm.resetFields()
  }, [emailForm])

  const handleAvatarCancel = useCallback(() => {
    setAvatarModalOpen(false)
    avatarForm.resetFields()
  }, [avatarForm])

  const handlePhoneOk = useCallback(() => {
    phoneForm.validateFields().then((values) => {
      setPhoneSubmitting(true)
      changePhone({ phone: values.phone })
        .then(() => {
          messageApi.success(t('common.save') + ' ' + t('profile.phone'))
          setPhoneModalOpen(false)
          phoneForm.resetFields()
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
  }, [phoneForm, messageApi, t, fetchInfo])

  const handlePhoneCancel = useCallback(() => {
    setPhoneModalOpen(false)
    phoneForm.resetFields()
  }, [phoneForm])

  if (loading) {
    return (
      <PageContent>
        <div
          className='flex items-center justify-center w-full'
          style={{ minHeight: 420 }}
        >
          <Spin size='large' tip={t('common.loading')} />
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
                    className='mt-2 pt-2 shrink-0'
                    style={{ borderTop: `1px solid ${colorBorderSecondary}` }}
                  >
                    <Text style={{ fontSize: 12, color: colorTextTertiary }}>
                      {t('profile.remark')}
                    </Text>
                    <div className='mt-0.5 font-medium text-sm whitespace-pre-wrap wrap-break-word'>
                      {fill(info?.remark)}
                    </div>
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
        destroyOnClose
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
        destroyOnClose
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
        destroyOnClose
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
    </PageContent>
  )
}

export default ProfilePage
