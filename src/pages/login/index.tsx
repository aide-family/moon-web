import { healthApi } from '@/api/request'
import logoIcon from '@/assets/images/logo.svg'
import { Docusaurus, Gitee } from '@/components/icon'
import { docURL, giteeURL, githubURL } from '@/components/layout/header-op'
import { GlobalContext } from '@/utils/context'
import { CopyrightOutlined, GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, theme } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import Banner from './banner'
import LoginForm from './form'

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
      className='flex w-full h-full'
      style={{
        background: token.colorBgBase,
        color: token.colorTextBase
      }}
    >
      <div className='p-6 flex gap-2 text-white text-2xl font-bold fixed w-[576px] z-[9999]'>
        <img src={logoIcon} className='w-10 h-10' />
        {title}
      </div>
      <div className='w-[576px] h-[100vh] bg-[#6c34e6]'>
        <Banner />
      </div>
      <div className='flex flex-col justify-center items-center flex-1'>
        <LoginForm />
      </div>
      <div className='absolute top-5 right-5 flex gap-2'>
        <Button
          color='primary'
          variant='filled'
          href={docURL}
          target='_blank'
          icon={<Docusaurus />}
          style={{ textDecoration: 'none' }}
        >
          Moon Docs
        </Button>
        <Button
          color='primary'
          variant='filled'
          href={githubURL}
          target='_blank'
          icon={<GithubOutlined />}
          style={{ textDecoration: 'none' }}
        >
          Github
        </Button>
        <Button
          color='primary'
          variant='filled'
          href={giteeURL}
          target='_blank'
          icon={<Gitee width={15} height={15} />}
          style={{ textDecoration: 'none' }}
        >
          Gitee
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
      <div className='absolute bottom-3 flex items-center justify-center gap-2 w-full'>
        <CopyrightOutlined />
        {window.location.host}
        <div className='ml-2'>version: {version}</div>
      </div>
    </div>
  )
}

export default Login
