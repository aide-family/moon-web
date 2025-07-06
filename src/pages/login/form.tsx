import {
  type LoginRequest,
  type OAuthItem,
  getOAuthList,
  login
} from '@/api/authorization'
import { type ErrorResponse, isLogin, setToken } from '@/api/request'
import { SmartCaptcha } from '@/components/captcha'
import { Gitee, Github, IconFont } from '@/components/icon'
import { GlobalContext } from '@/utils/context'
import { hashMd5 } from '@/utils/hash'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Flex, Form, Input, message, theme } from 'antd'
import React, { type FC, useContext, useEffect, useState } from 'react'
import cookie from 'react-cookies'
import { useNavigate } from 'react-router-dom'

export type LoginParams = {
  username: string
  password: string
}

type formData = {
  username: string
  password: string
}

const iconMap: Record<string, React.ReactNode> = {
  github: <Github />,
  gitee: <Gitee />,
  feishu: <IconFont type='icon-feishu' />
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
  const [captchaData, setCaptchaData] = useState<any>(null)
  const [captchaVisible, setCaptchaVisible] = useState(false)
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
        // 登录失败时清空验证码数据，需要重新验证
        setCaptchaData(null)
      })
  }

  const onFinish = (values: formData) => {
    if (!captchaData) {
      message.error('请先完成验证码验证')
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
      captcha: captchaData,
      redirect: localURL || '/'
    })
  }

  const handleCaptchaSuccess = (data: any) => {
    setCaptchaData(data)
    setCaptchaVisible(false)
    message.success('验证码验证成功')
  }

  const handleCaptchaError = (error: string) => {
    message.error(`验证码验证失败: ${error}`)
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
          rules={[{ required: true, message: '请完成验证码验证' }]}
          validateStatus={err?.metadata?.['captcha'] ? 'error' : 'success'}
          help={err?.metadata?.['captcha']}
        >
          <Button
            type={captchaData ? 'default' : 'primary'}
            onClick={() => setCaptchaVisible(true)}
            className='w-full'
            style={{ height: '40px' }}
          >
            {captchaData ? '已验证 ✓' : '点击验证码'}
          </Button>
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
          <Button
            type='primary'
            htmlType='submit'
            className='w-full'
            disabled={!captchaData}
          >
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

      <SmartCaptcha
        visible={captchaVisible}
        onSuccess={handleCaptchaSuccess}
        onError={handleCaptchaError}
        onClose={() => setCaptchaVisible(false)}
      />
    </div>
  )
}

export default LoginForm
