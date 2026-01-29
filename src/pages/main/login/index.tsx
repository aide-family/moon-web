import React, { useState } from 'react'
import { Carousel, Tabs, Form, Input, Button, message } from 'antd'
import type { TabsProps } from 'antd'
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useLocale } from '@/contexts/LocaleContext'
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

// 其他登录方式（平台 logo 用图标或文字表示）
const OTHER_LOGIN_OPTIONS = [
  { key: 'wechat', labelKey: 'login.other.wechat', icon: '微信' },
  { key: 'qq', labelKey: 'login.other.qq', icon: 'QQ' },
  { key: 'github', labelKey: 'login.other.github', icon: 'GitHub' },
  { key: 'google', labelKey: 'login.other.google', icon: 'G' },
]

export default function LoginPage() {
  const { t } = useLocale()
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState<string>('login')
  const [loginType, setLoginType] = useState<'password' | 'code'>('password')
  const [captchaCode, setCaptchaCode] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)

  const onLoginFinish = (values: Record<string, string>) => {
    if (loginType === 'code') {
      if (!values.graphicCaptcha || values.graphicCaptcha.toUpperCase() !== captchaCode.toUpperCase()) {
        message.error(t('login.captchaError'))
        return
      }
    }
    message.info(t('login.submitHint'))
    console.log('Login', values)
  }

  const onRegisterFinish = (values: Record<string, string>) => {
    message.info(t('login.registerSubmitHint'))
    console.log('Register', values)
  }

  const handleSendCode = async () => {
    const graphicCaptcha = loginForm.getFieldValue('graphicCaptcha')
    if (!graphicCaptcha) {
      message.warning(t('login.enterCaptchaFirst'))
      return
    }
    if (graphicCaptcha.toUpperCase() !== captchaCode.toUpperCase()) {
      message.error(t('login.captchaError'))
      return
    }
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
        <>
          <Form.Item
            label={t('login.graphicCaptchaLabel')}
            name="graphicCaptcha"
            rules={[{ required: true, message: t('login.graphicCaptchaRequired') }]}
          >
            <div className="flex gap-2 items-center">
              <Input
                prefix={<SafetyCertificateOutlined className="text-gray-400" />}
                placeholder={t('login.graphicCaptchaPlaceholder')}
                maxLength={4}
                className="flex-1"
              />
              <GraphicCaptcha onRefresh={setCaptchaCode} />
            </div>
          </Form.Item>
          <Form.Item
            name="emailCode"
            rules={[{ required: true, message: t('login.emailCodeRequired') }]}
          >
            <div className="flex gap-2">
              <Input placeholder={t('login.emailCodePlaceholder')} className="flex-1" />
              <Button type="primary" onClick={handleSendCode} disabled={sendingCode}>
                {sendingCode ? `${codeCountdown}s` : t('login.sendCode')}
              </Button>
            </div>
          </Form.Item>
        </>
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
    <div className="min-h-screen flex bg-gray-50">
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
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
            {activeTab === 'login' ? t('login.welcomeBack') : t('login.createAccount')}
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            {activeTab === 'login' ? t('login.welcomeSub') : t('login.registerSub')}
          </p>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="login-tabs"
          />

          {/* 其他登录方式 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm mb-4">{t('login.otherWays')}</p>
            <div className="flex justify-center gap-4">
              {OTHER_LOGIN_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                  title={t(opt.labelKey)}
                >
                  <span className="text-base font-medium">{opt.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
