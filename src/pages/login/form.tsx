import { CaptchaReply, getCaptcha, login, LoginRequest } from '@/api/authorization'
import { CaptchaType } from '@/api/enum'
import { baseURL, ErrorResponse, isLogin, setToken } from '@/api/request'
import { Gitee, Github } from '@/components/icon'
import { GlobalContext } from '@/utils/context'
import { hashMd5 } from '@/utils/hash'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Flex, Form, Input, theme } from 'antd'
import { FC, useContext, useEffect, useState } from 'react'
import cookie from 'react-cookies'
import { useNavigate } from 'react-router-dom'

export type LoginParams = {
  username: string
  password: string
  code: string
}

type formData = {
  username: string
  password: string
  code: string
}

const { useToken } = theme

const LoginForm: FC = () => {
  const navigate = useNavigate()
  if (isLogin()) {
    navigate('/')
  }

  const { token } = useToken()
  const [form] = Form.useForm<formData>()
  const { setUserInfo, theme } = useContext(GlobalContext)
  const [captcha, setCaptcha] = useState<CaptchaReply>()
  const [remeber, setRemeber] = useState<boolean>(!!cookie.load('remeber'))
  const [err, setErr] = useState<ErrorResponse>()

  const handleLogin = (loginParams: LoginRequest) => {
    login(loginParams)
      .then((res) => {
        setToken(res.token)
        setUserInfo?.(res.user)
        navigate(res.redirect || '/')
      })
      .catch((e: ErrorResponse) => {
        setErr(e)
        handleCaptcha()
      })
  }

  const onFinish = (values: formData) => {
    if (!captcha) {
      return
    }
    if (cookie.load('remeber')) {
      cookie.save('account', values, {
        path: '/',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
    } else {
      cookie.remove('account')
    }
    handleLogin({
      username: values.username,
      password: hashMd5(values.password),
      captcha: {
        code: values.code,
        id: captcha?.id
      },
      redirect: '/'
    })
  }

  const handleCaptcha = () => {
    getCaptcha({
      captchaType: CaptchaType.CaptchaTypeImage,
      width: 100,
      height: 40,
      theme: 'dark'
    }).then((res) => {
      setCaptcha(res)
    })
  }

  const handlRemember = (checked: boolean | null) => {
    setRemeber(checked ?? false)
    if (checked) {
      cookie.save('remeber', 'true', {
        path: '/',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
      return
    }
    cookie.remove('remeber')
  }

  useEffect(() => {
    if (cookie.load('account')) {
      const account: LoginRequest = cookie.load('account')
      form.setFieldsValue({
        username: account.username,
        password: account.password
      })
    }
    // 获取验证码
    handleCaptcha()
  }, [])

  return (
    <div className='form-box' style={{ width: '50%', minWidth: 420, maxWidth: 540 }}>
      <div className='form-box-title' style={{ fontSize: 24 }}>
        登录
      </div>
      <Form
        form={form}
        name='normal_login'
        className='login-form'
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size='large'
        autoComplete='off'
      >
        <Form.Item
          name='username'
          rules={[
            { required: true, message: '请输入用户名' },
            { type: 'email', message: '请输入正确的邮箱' }
          ]}
          validateStatus={err?.metadata?.['username'] ? 'error' : 'success'}
          help={err?.metadata?.['username']}
        >
          <Input
            autoComplete='off'
            style={{ lineHeight: '38px' }}
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='请输入用户名'
          />
        </Form.Item>
        <Form.Item
          name='password'
          rules={[{ required: true, message: '请输入密码' }]}
          validateStatus={err?.metadata?.['password'] ? 'error' : 'success'}
          help={err?.metadata?.['password']}
        >
          <Input.Password
            autoComplete='off'
            prefix={<LockOutlined className='site-form-item-icon' />}
            type='password'
            placeholder='Password'
            size='large'
            style={{ lineHeight: '38px' }}
          />
        </Form.Item>
        <Form.Item
          name='code'
          rules={[{ required: true, message: '请输入验证码' }]}
          validateStatus={err?.metadata?.['code'] ? 'error' : 'success'}
          help={err?.metadata?.['code']}
        >
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
                    aspectRatio: '80/28',
                    objectFit: 'cover',
                    flexShrink: 0,
                    backgroundColor: theme === 'dark' ? 'white' : 'black',
                    borderRadius: token.borderRadius,
                    cursor: 'pointer',
                    height: 40
                  }}
                  onClick={handleCaptcha}
                />
              }
            />
          </div>
        </Form.Item>
        <Flex justify='space-between' align='center' style={{ paddingBottom: '8px', width: '100%' }}>
          <Checkbox checked={remeber} onChange={(e) => handlRemember(e.target.checked)}>
            记住密码
          </Checkbox>
          <Button type='link' href='/forget' disabled>
            忘记密码？
          </Button>
        </Flex>
        <Form.Item>
          <Button type='primary' htmlType='submit' className='login-form-button'>
            登录
          </Button>
        </Form.Item>
        <Divider dashed style={{ fontSize: '14px' }}>
          没有账户？
          {/* <Button href='/register' disabled type='link'>
            去注册
          </Button> */}
          <span>使用以下方式直接登陆｜注册</span>
        </Divider>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Form.Item>
            <Button
              type='dashed'
              href={`${baseURL}/auth/github`}
              color='primary'
              variant='filled'
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Github /> Github登录
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              type='dashed'
              href={`${baseURL}/auth/gitee`}
              color='primary'
              variant='filled'
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Gitee /> Gitee登录
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  )
}

export default LoginForm
