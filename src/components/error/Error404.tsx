import Error404SVG from '@/assets/images/err_404.svg'
import { Button, Image, Result } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const Error403: FC = () => {
  const navigate = useNavigate()

  const navigateToHome = () => {
    navigate('/')
  }
  return (
    <Result
      status='error'
      title='页面不存在'
      icon={
        <Image
          src={Error404SVG}
          preview={false}
          onDragStart={() => false}
          className='pointer-events-none cursor-default select-none'
        />
      }
      subTitle='对不起，您访问的资源不存在'
      extra={
        <Button type='primary' onClick={navigateToHome}>
          返回主页
        </Button>
      }
    />
  )
}

export default Error403
