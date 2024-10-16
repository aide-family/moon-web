import { healthApi } from '@/api/request'
import logoIcon from '@/assets/images/logo.svg'
import { githubURL } from '@/components/layout/header-op'
import { GlobalContext } from '@/utils/context'
import { CopyrightOutlined, GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, theme } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import Banner from './banner'
import LoginForm from './form'
import './index.scss'

export interface LoginProps {}
const { useToken } = theme

let timer: NodeJS.Timeout | null = null
const Login: React.FC<LoginProps> = () => {
  const { theme, setTheme, title = 'Moon' } = useContext(GlobalContext)
  const { token } = useToken()
  const [version, setVersion] = useState('version')

  const getVersion = () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      healthApi().then((res) => {
        setVersion(res.version)
      })
    }, 300)
  }
  useEffect(() => {
    getVersion()
  }, [])
  return (
    <div
      className='login'
      style={{
        background: token.colorBgBase,
        color: token.colorTextBase
      }}
    >
      <div className='login-logo' style={{ fontSize: 24 }}>
        <img src={logoIcon} style={{ width: 40, height: 40 }} />
        {title}
      </div>
      <div className='login-left'>
        <Banner />
      </div>
      <div className='login-right'>
        <LoginForm />
      </div>
      <div className='login-option-btns'>
        <Button color='primary' variant='filled' href={githubURL} target='_blank' icon={<GithubOutlined />}>
          Github
        </Button>
        <Button
          color='primary'
          variant='filled'
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={() => {
            setTheme?.(theme === 'dark' ? 'light' : 'dark')
          }}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>
      <div className='login-footer'>
        <CopyrightOutlined />
        {window.location.host}
        <div
          style={{
            marginLeft: 10
          }}
        >
          version: {version}
        </div>
      </div>
    </div>
  )
}

export default Login
