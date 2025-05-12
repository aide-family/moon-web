import {
  type CaptchaReply,
  type LoginRequest,
  type OAuthItem,
  getCaptcha,
  getOAuthList,
  login
} from '@/api/authorization'
import { CaptchaType } from '@/api/enum'
import { type ErrorResponse, isLogin, setToken } from '@/api/request'
import { Gitee, Github, IconFont } from '@/components/icon'
import { GlobalContext } from '@/utils/context'
import { hashMd5 } from '@/utils/hash'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Flex, Form, Input, theme } from 'antd'
import React, { type FC, useContext, useEffect, useState } from 'react'
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

const iconMap: Record<string, React.ReactNode> = {
    github: <Github/>,
    gitee: <Gitee/>,
    feishu: <IconFont type='icon-feishu'/>
}

const { useToken } = theme

const LoginForm: FC = () => {
  const navigate = useNavigate()
  const { localURL } = useContext(GlobalContext)
  if (isLogin()) {
    navigate(localURL || '/')
  }

  const { token } = useToken()
  const [form] = Form.useForm<formData>()
  const { setUserInfo } = useContext(GlobalContext)
  const [captcha, setCaptcha] = useState<CaptchaReply>()
  const [remeber, setRemeber] = useState<boolean>(!!cookie.load('remeber'))
  const [err, setErr] = useState<ErrorResponse>()
  const [oauthList, setOAuthList] = useState<OAuthItem[]>([])

  const handleLogin = (loginParams: LoginRequest) => {
    login(loginParams)
      .then((res) => {
        setToken(res.token)
        setUserInfo?.(res.user)
        navigate(localURL || '/')
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
      cookie.save('account', values, { path: '/', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
    } else {
      cookie.remove('account')
    }
    handleLogin({
      username: values.username,
      password: hashMd5(values.password),
      captcha: { code: values.code, id: captcha?.id },
      redirect: localURL || '/'
    })
  }

  const handleCaptcha = () => {
    getCaptcha({ captchaType: CaptchaType.CaptchaTypeImage, width: 100, height: 40, theme: 'dark' }).then((res) => {
      setCaptcha(res)
    })
  }

  const handlRemember = (checked: boolean | null) => {
    setRemeber(checked ?? false)
    if (checked) {
      cookie.save('remeber', 'true', { path: '/', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
      return
    }
    cookie.remove('remeber')
  }

  const handleOAuthList = () => {
    getOAuthList().then((res) => {
      setOAuthList(res.list || [])
    })
  }

  useEffect(() => {
    if (cookie.load('account')) {
      const account: LoginRequest = cookie.load('account')
      form.setFieldsValue({ username: account.username, password: account.password })
    }
    // 获取验证码
    handleCaptcha()
    handleOAuthList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='w-1/2 min-w-[420px] max-w-[540px]'>
      <div className='text-2xl pb-5 font-bold'>登录</div>
      <Form
        form={form}
        name='normal_login'
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size='large'
        autoComplete='off'
      >
        <Form.Item
          name='username'
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱' }
          ]}
          validateStatus={err?.metadata?.['username'] ? 'error' : 'success'}
          help={err?.metadata?.['username']}
        >
          <Input
            autoComplete='off'
            style={{ lineHeight: '38px' }}
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='请输入邮箱'
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
          <div className='flex gap-2'>
            <Input
              placeholder='验证码'
              suffix={
                <img
                  src={captcha?.captcha}
                  alt='点击获取'
                  className='w-full h-[40px] text-xl aspect-[80/28] object-cover flex-shrink-0 bg-white rounded-md cursor-pointer'
                  style={{ borderRadius: token.borderRadius }}
                  onClick={handleCaptcha}
                />
              }
            />
          </div>
        </Form.Item>
        <Flex justify='space-between' align='center' className='pb-2 w-full'>
          <Checkbox checked={remeber} onChange={(e) => handlRemember(e.target.checked)}>
            记住密码
          </Checkbox>
          <Button type='link' href='/forget' disabled>
            忘记密码？
          </Button>
        </Flex>
        <Form.Item>
          <Button type='primary' htmlType='submit' className='w-full'>
            登录
          </Button>
        </Form.Item>
        <Divider
          dashed
          className='text-sm'
          style={{
            borderColor: token.colorBorderSecondary,
            color: token.colorTextSecondary
          }}
        >
          没有账户？
          <Button onClick={() => navigate('/register')} type='link'>
            去注册
          </Button>
          {oauthList.length > 0 && <span style={{ color: token.colorTextSecondary }}>使用以下方式直接登陆｜注册</span>}
        </Divider>
        <div className='flex justify-between w-full'>
          {oauthList.map((item, index) => (
            <Form.Item key={index}>
              <Button
                type='dashed'
                href={item.redirect}
                color='primary'
                variant='filled'
                className='flex items-center gap-2'
              >
                {iconMap[item.icon]} {item.label}
              </Button>
            </Form.Item>
          ))}
        </div>
      </Form>
    </div>
  )
}

export default LoginForm
