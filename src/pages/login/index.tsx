import React, { useContext } from 'react'
import Banner from './banner'
import './index.scss'
import LoginForm from './form'
import { CopyrightOutlined, GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, theme } from 'antd'
import { GlobalContext } from '@/utils/context'

export interface LoginProps {}
const { useToken } = theme

const Login: React.FC<LoginProps> = () => {
  const { theme, setTheme } = useContext(GlobalContext)
  const { token } = useToken()

  return (
    <div
      className='login'
      style={{
        background: token.colorBgBase,
        color: token.colorTextBase
      }}
    >
      <div className='login-left'>
        <Banner />
      </div>
      <div className='login-right'>
        <LoginForm />
      </div>
      <div className='login-option-btns'>
        <Button type='primary' icon={<GithubOutlined />} />
        <Button
          type='primary'
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          style={{ color: '#FFF' }}
          onClick={() => {
            setTheme?.(theme === 'dark' ? 'light' : 'dark')
          }}
        />
      </div>
      <div className='login-footer'>
        <CopyrightOutlined />
        {window.location.host}
      </div>
    </div>
  )
}

export default Login
