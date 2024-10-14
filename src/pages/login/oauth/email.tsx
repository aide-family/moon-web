import { CaptchaReply, getCaptcha, setEmailWithLogin, verifyEmail } from '@/api/authorization'
import { CaptchaType } from '@/api/enum'
import { ErrorResponse, setToken } from '@/api/request'
import { DataFrom } from '@/components/data/form'
import { GlobalContext } from '@/utils/context'
import { Alert, Button, Form, Input, Space, theme } from 'antd'
import { debounce } from 'lodash'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type VerificationFormData = {
  email: string
  code: string
}

type SetEmailFormData = {
  emailCode: string
}

const { useToken } = theme

export default function EmailVerification() {
  const { theme } = useContext(GlobalContext)
  const navigator = useNavigate()
  const { token } = useToken()

  const [captcha, setCaptcha] = useState<CaptchaReply>()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const [oauthID, setOauth] = useState(0)

  const search = window.location.search
  const searchOAuthID = new URLSearchParams(search).get('oauth_id')

  const generateCaptcha = useCallback(
    debounce(async () => {
      getCaptcha({
        captchaType: CaptchaType.CaptchaTypeImage,
        width: 100,
        height: 40,
        theme: theme === 'dark' ? 'light' : 'dark'
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

  const handleVerifyCode = (value: SetEmailFormData) => {
    setIsLoading(true)
    setError('')

    setEmailWithLogin({
      email: email,
      code: value.emailCode,
      oauthID: oauthID
    })
      .then((res) => {
        setSuccess('邮箱验证成功！')
        setToken(res.token)
        navigator('/')
      })
      .catch((err: ErrorResponse) => {
        setError(err?.metadata?.['code'] || err?.message || '验证码不正确，请重新输入')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (searchOAuthID) {
      setOauth(parseInt(searchOAuthID))
    }
  }, [searchOAuthID])

  useEffect(() => {
    generateCaptcha()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <Space
        direction='vertical'
        size={16}
        style={{ display: 'flex', width: '400px', margin: 'auto', background: token.colorBgBase }}
      >
        <h1>绑定邮箱</h1>
        {error && step == 1 && <Alert message={error} type='error' showIcon />}
        {success && <Alert message={success} type='success' showIcon />}
        {step === 1 && (
          <DataFrom
            props={{
              onFinish: handleSendCode,
              layout: 'vertical'
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
                  placeholder: '请输入邮箱'
                }
              }
            ]}
          >
            <Form.Item name='code' rules={[{ required: true, message: '请输入验证码' }]}>
              <div className='login-form-captcha'>
                <Input
                  placeholder='验证码'
                  suffix={
                    <img
                      src={captcha?.captcha}
                      alt='点击获取'
                      className='login-form-captcha-img'
                      style={{
                        width: '100%',
                        height: '100%',
                        aspectRatio: '80/28',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        borderColor: 'transparent',
                        backgroundColor: 'transparent'
                      }}
                      onClick={generateCaptcha}
                    />
                  }
                />
              </div>
            </Form.Item>
            <Button htmlType='submit' disabled={isLoading}>
              {isLoading ? '发送中...' : '发送验证码'}
            </Button>
          </DataFrom>
        )}
        {step === 2 && (
          <DataFrom
            props={{
              onFinish: handleVerifyCode,
              layout: 'vertical'
            }}
            items={[
              {
                type: 'input',
                name: 'emailCode',
                label: '验证码',
                formProps: {
                  rules: [{ required: true, message: '请输入验证码' }]
                },
                props: {
                  placeholder: '请输入验证码'
                }
              }
            ]}
          >
            <Button htmlType='submit' disabled={isLoading}>
              {isLoading ? '验证中...' : '验证'}
            </Button>
          </DataFrom>
        )}
      </Space>
    </>
  )
}
