import { CaptchaReply, getCaptcha, login, LoginRequest } from '@/api/authorization'
import { CaptchaType } from '@/api/enum'
import { baseURL, isLogin, setToken } from '@/api/request'
import { Gitee, Github } from '@/components/icon'
import { GlobalContext } from '@/utils/context'
import { hashMd5 } from '@/utils/hash'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input } from 'antd'
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
          <Input
            style={{ lineHeight: '38px' }}
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='Username'
          />
        </Form.Item>
        <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password
            prefix={<LockOutlined className='site-form-item-icon' />}
            type='password'
            placeholder='Password'
            size='large'
            style={{ lineHeight: '38px' }}
          />
        </Form.Item>
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
                  onClick={handleCaptcha}
                />
              }
            />
          </div>
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' className='login-form-button'>
            登录
          </Button>
        </Form.Item>
        <Divider dashed>
          <span style={{ fontSize: '14px' }}>其他登陆方式</span>
        </Divider>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Form.Item>
            <Button
              type='dashed'
              href={`${baseURL}/auth/github`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Github /> Github登录
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              type='dashed'
              href={`${baseURL}/auth/gitee`}
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
