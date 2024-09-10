import { CaptchaReply, getCaptcha, login, LoginRequest } from '@/api/authorization'
import { CaptchaType } from '@/api/enum'
import { isLogin, setToken } from '@/api/request'
import { GlobalContext } from '@/utils/context'
import { hashMd5 } from '@/utils/hash'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { FC, useContext, useEffect, useState } from 'react'
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

const LoginForm: FC = () => {
  const navigate = useNavigate()
  if (isLogin()) {
    navigate('/')
  }

  const [form] = Form.useForm<formData>()
  const { setUserInfo } = useContext(GlobalContext)
  const [captcha, setCaptcha] = useState<CaptchaReply>()

  const handleLogin = (loginParams: LoginRequest) => {
    login(loginParams)
      .then((res) => {
        setToken(res.token)
        setUserInfo?.(res.user)
        navigate(res.redirect || '/')
      })
      .catch(() => {
        handleCaptcha()
      })
  }

  const onFinish = (values: formData) => {
    if (!captcha) {
      return
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
      captchaType: CaptchaType.CaptchaTypeImage
    }).then((res) => {
      setCaptcha(res)
    })
  }

  useEffect(() => {
    // 获取验证码
    handleCaptcha()
  }, [])

  return (
    <div className='form-box '>
      <div className='form-box-title'>登录</div>
      <Form
        form={form}
        name='normal_login'
        className='login-form'
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size='large'
      >
        <Form.Item name='username' rules={[{ required: true, message: '请输入用户名' }]}>
          <Input prefix={<UserOutlined className='site-form-item-icon' />} placeholder='Username' />
        </Form.Item>
        <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password
            prefix={<LockOutlined className='site-form-item-icon' />}
            type='password'
            placeholder='Password'
          />
        </Form.Item>
        <Form.Item name='code' rules={[{ required: true, message: '请输入验证码' }]}>
          <div className='login-form-captcha'>
            <Input placeholder='验证码' />
            <img src={captcha?.captcha} alt='点击获取' className='login-form-captcha-img' onClick={handleCaptcha} />
          </div>
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' className='login-form-button'>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginForm
