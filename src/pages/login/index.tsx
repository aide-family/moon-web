import logoIcon from '@/assets/images/logo.svg'
import { Docusaurus, Gitee } from '@/components/icon'
import LayoutFooter from '@/components/layout/footer'
import { docURL, giteeURL, githubURL } from '@/components/layout/header-op'
import { GlobalContext } from '@/utils/context'
import { GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, theme } from 'antd'
import React, { useContext, useEffect } from 'react'
import Banner from './banner'
import LoginForm from './form'

export interface LoginProps {}
const { useToken } = theme

const Login: React.FC<LoginProps> = () => {
  const { theme, setTheme, title = 'Moon' } = useContext(GlobalContext)
  const { token } = useToken()

  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <div
      className='flex w-full h-full'
      style={{
        background: token.colorBgBase,
        color: token.colorTextBase
      }}
    >
      <div className='hidden md:block md:w-[30%] '>
        <div className='p-6 flex gap-2 text-white text-2xl font-bold fixed z-[9999] items-center'>
          <img src={logoIcon} className='w-10 h-10' />
          {title}
        </div>
        <div className=' h-[100vh] bg-[#6c34e6] '>
          <Banner />
        </div>
      </div>
      <div className='flex flex-col justify-center items-center flex-1 h-[100vh]'>
        <LoginForm />
      </div>
      <div className='absolute top-5 flex gap-2 md:right-5 md:left-auto md:transform-none left-1/2 -translate-x-1/2 '>
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
        <LayoutFooter />
      </div>
    </div>
  )
}

export default Login
