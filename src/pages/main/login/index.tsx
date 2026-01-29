import React, { useState } from 'react'
import { Carousel, Tabs, Form, Input, Button, message, Modal, Dropdown } from 'antd'
import type { TabsProps, MenuProps } from 'antd'
import {
  MailOutlined,
  LockOutlined,
  WechatOutlined,
  QqOutlined,
  GithubOutlined,
  GoogleOutlined,
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  BgColorsOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { useLocale } from '@/contexts/LocaleContext'
import { useTheme } from '@/contexts/ThemeContext'
import GraphicCaptcha from './components/GraphicCaptcha'


// 简介轮播数据
const INTRO_SLIDES = [
  {
    titleKey: 'login.intro.title1',
    descKey: 'login.intro.desc1',
    bg: 'linear-gradient(135deg, #c00 0%, #764ba2 100%)',
  },
  {
    titleKey: 'login.intro.title2',
    descKey: 'login.intro.desc2',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    titleKey: 'login.intro.title3',
    descKey: 'login.intro.desc3',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
]

// 其他登录方式（平台图标）
const OTHER_LOGIN_OPTIONS = [
  { key: 'wechat', labelKey: 'login.other.wechat', Icon: WechatOutlined },
  { key: 'qq', labelKey: 'login.other.qq', Icon: QqOutlined },
  { key: 'github', labelKey: 'login.other.github', Icon: GithubOutlined },
  { key: 'google', labelKey: 'login.other.google', Icon: GoogleOutlined },
]

export default function LoginPage() {
  const { t, locale, setLocale } = useLocale()
  const { themeMode, setThemeMode, actualThemeMode } = useTheme()
  const isDark = actualThemeMode === 'dark'
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState<string>('login')
  const [loginType, setLoginType] = useState<'password' | 'code'>('password')
  const [sendingCode, setSendingCode] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false)
  const [modalCaptchaCode, setModalCaptchaCode] = useState('')
  const [modalCaptchaInput, setModalCaptchaInput] = useState('')

  const onLoginFinish = (values: Record<string, string>) => {
    message.info(t('login.submitHint'))
    console.log('Login', values)
  }

  const onRegisterFinish = (values: Record<string, string>) => {
    message.info(t('login.registerSubmitHint'))
    console.log('Register', values)
  }

  const handleOpenCaptchaModal = async () => {
    try {
      await loginForm.validateFields(['email'])
    } catch {
      return
    }
    setModalCaptchaInput('')
    setCaptchaModalOpen(true)
  }

  const handleCaptchaModalConfirm = () => {
    if (!modalCaptchaInput.trim()) {
      message.warning(t('login.enterCaptchaFirst'))
      return
    }
    if (modalCaptchaInput.toUpperCase() !== modalCaptchaCode.toUpperCase()) {
      message.error(t('login.captchaError'))
      return
    }
    setCaptchaModalOpen(false)
    setModalCaptchaInput('')
    setSendingCode(true)
    setCodeCountdown(60)
    message.success(t('login.codeSent'))
    const timer = setInterval(() => {
      setCodeCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          setSendingCode(false)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleCaptchaModalCancel = () => {
    setCaptchaModalOpen(false)
    setModalCaptchaInput('')
  }

  const themeMenuItems: MenuProps['items'] = [
    { key: 'light', label: t('theme.light'), icon: <SunOutlined />, onClick: () => setThemeMode('light') },
    { key: 'dark', label: t('theme.dark'), icon: <MoonOutlined />, onClick: () => setThemeMode('dark') },
    { key: 'system', label: t('theme.system'), icon: <DesktopOutlined />, onClick: () => setThemeMode('system') },
  ]
  const localeMenuItems: MenuProps['items'] = [
    { key: 'zh-CN', label: t('language.zh'), onClick: () => setLocale('zh-CN') },
    { key: 'en-US', label: t('language.en'), onClick: () => setLocale('en-US') },
  ]

  const loginFormContent = (
    <Form
      form={loginForm}
      layout="vertical"
      onFinish={onLoginFinish}
      size="large"
      className="mt-6"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: t('login.emailRequired') },
          { type: 'email', message: t('login.emailInvalid') },
        ]}
      >
        <Input prefix={<MailOutlined className="text-gray-400" />} placeholder={t('login.emailPlaceholder')} />
      </Form.Item>

      {loginType === 'password' ? (
        <Form.Item
          name="password"
          rules={[{ required: true, message: t('login.passwordRequired') }]}
        >
          <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder={t('login.passwordPlaceholder')} />
        </Form.Item>
      ) : (
        <Form.Item
          name="emailCode"
          rules={[{ required: true, message: t('login.emailCodeRequired') }]}
        >
          <div className="flex gap-2">
            <Input placeholder={t('login.emailCodePlaceholder')} className="flex-1" />
            <Button type="primary" onClick={handleOpenCaptchaModal} disabled={sendingCode}>
              {sendingCode ? `${codeCountdown}s` : t('login.sendCode')}
            </Button>
          </div>
        </Form.Item>
      )}

      <div className="flex justify-between text-sm mb-2">
        <span
          className="text-primary cursor-pointer hover:underline"
          onClick={() => setLoginType(loginType === 'password' ? 'code' : 'password')}
        >
          {loginType === 'password' ? t('login.switchToCode') : t('login.switchToPassword')}
        </span>
      </div>

      <Form.Item className="mb-4">
        <Button type="primary" htmlType="submit" block size="large">
          {t('login.login')}
        </Button>
      </Form.Item>
    </Form>
  )

  const registerFormContent = (
    <Form
      form={registerForm}
      layout="vertical"
      onFinish={onRegisterFinish}
      size="large"
      className="mt-6"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: t('login.emailRequired') },
          { type: 'email', message: t('login.emailInvalid') },
        ]}
      >
        <Input prefix={<MailOutlined className="text-gray-400" />} placeholder={t('login.emailPlaceholder')} />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: t('login.passwordRequired') }]}
      >
        <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder={t('login.passwordPlaceholder')} />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: t('login.confirmPasswordRequired') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) return Promise.resolve()
              return Promise.reject(new Error(t('login.passwordMismatch')))
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder={t('login.confirmPasswordPlaceholder')} />
      </Form.Item>
      <Form.Item className="mb-4">
        <Button type="primary" htmlType="submit" block size="large">
          {t('login.register')}
        </Button>
      </Form.Item>
    </Form>
  )

  const tabItems: TabsProps['items'] = [
    { key: 'login', label: t('login.login'), children: loginFormContent },
    { key: 'register', label: t('login.register'), children: registerFormContent },
  ]

  return (
    <div
      className={`min-h-screen flex relative ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      {/* 右上角：语言切换、主题切换 */}
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
        <Dropdown menu={{ items: themeMenuItems, selectedKeys: [themeMode] }} trigger={['click']}>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:bg-gray-700"
            title={t('theme.light')}
          >
            <BgColorsOutlined className="text-lg" />
          </button>
        </Dropdown>
        <Dropdown menu={{ items: localeMenuItems, selectedKeys: [locale] }} trigger={['click']}>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800/90 dark:hover:bg-gray-700"
            title={t('language.zh')}
          >
            <GlobalOutlined className="text-lg" />
          </button>
        </Dropdown>
      </div>

      {/* 左侧：简介轮播。不用 w-0/min-h-0，避免整列宽度或高度被压成 0 */}
      <div className="hidden lg:block lg:w-[55%] lg:min-h-screen lg:shrink-0">
        <div className="h-full min-h-screen w-full">
          <Carousel autoplay className="w-full" style={{ height: '100vh' }}>
            {INTRO_SLIDES.map((slide, i) => (
              <div
                key={i}
                className="min-h-[100vh] flex flex-col justify-center px-16 text-gray-800 bg-indigo-500"
              >
                <h2 className="text-3xl font-bold mb-4" >
                  {t(slide.titleKey)}
                </h2>
                <p className="text-lg max-w-md opacity-90">
                  {t(slide.descKey)}
                </p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* 右侧：操作表单 */}
      <div className="flex-1 min-w-0 flex flex-col justify-center px-8 py-12 sm:px-16">
        <div
          className={`w-full max-w-md mx-auto rounded-2xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h1
            className={`text-2xl font-semibold text-center mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
          >
            {activeTab === 'login' ? t('login.welcomeBack') : t('login.createAccount')}
          </h1>
          <p
            className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {activeTab === 'login' ? t('login.welcomeSub') : t('login.registerSub')}
          </p>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="login-tabs"
          />

          {/* 图形验证码弹窗：获取邮箱验证码前先验证 */}
          <Modal
            title={t('login.captchaModalTitle')}
            open={captchaModalOpen}
            onCancel={handleCaptchaModalCancel}
            onOk={handleCaptchaModalConfirm}
            okText={t('login.captchaModalConfirm')}
            cancelText={t('common.cancel')}
            destroyOnClose
          >
            <div className="py-4">
              <div className="mb-4 flex items-center gap-2">
                <Input
                  value={modalCaptchaInput}
                  onChange={(e) => setModalCaptchaInput(e.target.value.slice(0, 4).toUpperCase())}
                  placeholder={t('login.graphicCaptchaPlaceholder')}
                  maxLength={4}
                  size="large"
                  className="flex-1"
                />
                <GraphicCaptcha onRefresh={setModalCaptchaCode} />
              </div>
              <p className="text-gray-500 text-sm">{t('login.graphicCaptchaLabel')}</p>
            </div>
          </Modal>

          {/* 其他登录方式 */}
          <div
            className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}
          >
            <p
              className={`text-center text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {t('login.otherWays')}
            </p>
            <div className="flex justify-center gap-4">
              {OTHER_LOGIN_OPTIONS.map((opt) => {
                const Icon = opt.Icon
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 ${
                      isDark
                        ? 'border-gray-600 text-gray-400'
                        : 'border-gray-200 text-gray-600'
                    }`}
                    title={t(opt.labelKey)}
                  >
                    <Icon className="text-xl" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
