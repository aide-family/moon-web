import { FC } from "react"

import { Button, Form, Input } from "antd"
// import { useForm } from "antd/es/form/Form"
// import { useNavigate } from "react-router-dom"
import { LockOutlined, UserOutlined } from "@ant-design/icons"

export type LoginParams = {
  username: string
  password: string
  code: string
}

const LoginForm: FC = () => {
  const onFinish = (values: unknown) => {
    console.log("Received values of form: ", values)
  }

  return (
    <div className='form-box '>
      <div className='form-box-title'>登录</div>
      <Form
        name='normal_login'
        className='login-form'
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size='large'
      >
        <Form.Item
          name='username'
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder='Username'
          />
        </Form.Item>
        <Form.Item
          name='password'
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input
            prefix={<LockOutlined className='site-form-item-icon' />}
            type='password'
            placeholder='Password'
          />
        </Form.Item>
        <Form.Item>
          <div className='login-form-captcha'>
            <Input placeholder='验证码' />
            <img
              src=''
              alt='验证码'
              className='login-form-captcha-img'
              // onClick={handleCaptcha}
            />
          </div>
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            className='login-form-button'
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginForm
