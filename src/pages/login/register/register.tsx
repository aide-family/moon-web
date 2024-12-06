import { CaptchaReply, getCaptcha, registerWithEmail, verifyEmail } from '@/api/authorization'
import { CaptchaType } from '@/api/enum'
import { ErrorResponse, setToken } from '@/api/request'
import { DataFrom } from '@/components/data/form'
import { githubURL } from '@/components/layout/header-op'
import { GlobalContext } from '@/utils/context'
import { GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input, Space, theme } from 'antd'
import { debounce } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'

import { hashMd5 } from '@/utils/hash'
import '../index.scss'

type VerificationFormData = {
  email: string
  code: string
}

type EmailRegisterFormData = {
  emailCode: string
  username: string
  password: string
}

const { useToken } = theme

export default function Register() {
  const { theme, setTheme } = useContext(GlobalContext)
  const { token } = useToken()

  const [captcha, setCaptcha] = useState<CaptchaReply>()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')

  const generateCaptcha = useCallback(
    debounce(async () => {
      getCaptcha({
        captchaType: CaptchaType.CaptchaTypeImage,
        width: 100,
        height: 40,
        theme: 'dark'
      }).then((res) => {
        setCaptcha(res)
      })
    }, 500),
    []
  )

  const handleSendCode = (value: VerificationFormData) => {
    setIsLoading(true)
    setError('')
    verifyEmail({
      email: value.email,
      captcha: {
        id: captcha?.id || '',
        code: value.code
      }
    })
      .then(() => {
        setEmail(value.email)
        setStep(2)
        setSuccess('验证码已发送到您的邮箱，请查收')
      })
      .catch((err: ErrorResponse) => {
        setError(err?.message)
      })
      .finally(() => setIsLoading(false))
  }

  const handleVerifyCode = (value: EmailRegisterFormData) => {
    setIsLoading(true)
    setError('')

    registerWithEmail({
      email: email,
      code: value.emailCode,
      password: hashMd5(value.password),
      username: value.username
    })
      .then((res) => {
        setSuccess('注册成功！')
        setToken(res.token)
        return res.token
      })
      .then((token) => {
        window.location.href = `${window.location.origin}?token=${token}`
      })
      .catch((err: ErrorResponse) => {
        setError(err?.metadata?.['code'] || err?.message || '验证码不正确，请重新输入')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    generateCaptcha()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        background: token.colorBgContainer,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        color: token.colorTextBase,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className='login-option-btns'>
        <Button type='primary' href={githubURL} target='_blank' icon={<GithubOutlined />} />
        <Button
          type='primary'
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          style={{ color: '#FFF' }}
          onClick={() => {
            setTheme?.(theme === 'dark' ? 'light' : 'dark')
          }}
        />
      </div>
      <Space
        direction='vertical'
        size={16}
        style={{
          display: 'flex',
          width: '400px',
          margin: 'auto',
          // background: token.colorBgBase,
          padding: '1.5rem',
          borderColor: 'white',
          boxShadow: token.boxShadow,
          borderRadius: token.borderRadiusLG
        }}
      >
        <h1 style={{ fontSize: 32 }}>邮箱注册</h1>
        {error && step == 1 && <Alert message={error} type='error' showIcon />}
        {success && <Alert message={success} type='success' showIcon />}
        {step === 1 && (
          <DataFrom
            props={{
              onFinish: handleSendCode,
              layout: 'vertical',
              size: 'large'
            }}
            items={[
              {
                type: 'input',
                name: 'email',
                label: '邮箱',
                formProps: {
                  rules: [
                    { required: true, message: '请输入邮箱' },
                    {
                      type: 'email',
                      message: '请输入正确的邮箱'
                    }
                  ]
                },
                props: {
                  placeholder: '请输入邮箱',
                  style: { lineHeight: 2.5 }
                }
              }
            ]}
          >
            <Form.Item name='code' label='验证码' rules={[{ required: true, message: '请输入验证码' }]}>
              <div className='login-form-captcha'>
                <Input
                  placeholder='验证码'
                  style={{ lineHeight: 2.5 }}
                  suffix={
                    <img
                      src={captcha?.captcha}
                      alt='点击获取'
                      className='login-form-captcha-img'
                      style={{
                        aspectRatio: '80/28',
                        objectFit: 'cover',
                        flexShrink: 0,
                        backgroundColor: 'white',
                        borderRadius: token.borderRadius,
                        cursor: 'pointer',
                        height: 40
                      }}
                      onClick={generateCaptcha}
                    />
                  }
                />
              </div>
            </Form.Item>
            <Button htmlType='submit' type='primary' disabled={isLoading} style={{ float: 'right', width: '100%' }}>
              {isLoading ? '发送中...' : '发送验证码'}
            </Button>
          </DataFrom>
        )}
        {step === 2 && (
          <DataFrom
            props={{
              onFinish: handleVerifyCode,
              layout: 'vertical',
              size: 'large'
            }}
            items={[
              {
                type: 'input',
                name: 'username',
                label: '用户名',
                formProps: {
                  rules: [{ required: true, message: '请输入用户名' }]
                },
                props: {
                  placeholder: '请输入用户名',
                  style: { lineHeight: 2.5 }
                }
              },
              {
                type: 'input',
                name: 'password',
                label: '密码',
                formProps: {
                  rules: [{ required: true, message: '请输入密码' }]
                },
                props: {
                  placeholder: '请输入密码',
                  type: 'password',
                  style: { lineHeight: 2.5 }
                }
              },
              {
                type: 'input',
                name: 'emailCode',
                label: '验证码',
                formProps: {
                  rules: [{ required: true, message: '请输入验证码' }]
                },
                props: {
                  placeholder: '请输入验证码',
                  style: { lineHeight: 2.5 }
                }
              }
            ]}
          >
            <Button htmlType='submit' type='primary' disabled={isLoading} style={{ float: 'right', width: '100%' }}>
              {isLoading ? '验证中...' : '验证'}
            </Button>
          </DataFrom>
        )}
      </Space>
    </div>
  )
}
