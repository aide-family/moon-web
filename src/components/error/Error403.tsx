import Error403SVG from '@/assets/images/err_403.svg'
import { Button, Image, Result, theme } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const { useToken } = theme

const Error403: FC = () => {
  const navigate = useNavigate()
  const { token } = useToken()

  const navigateToHome = () => {
    navigate('/')
  }
  return (
    <div style={{ color: token.colorTextBase }}>
      <Result
        status='error'
        title='无权限'
        icon={
          <Image
            src={Error403SVG}
            preview={false}
            onDragStart={() => false}
            className='pointer-events-none cursor-default select-none'
          />
        }
        subTitle='对不起，您没有权限访问此页面。'
        extra={
          <Button type='primary' onClick={navigateToHome}>
            返回主页
          </Button>
        }
      />
    </div>
  )
}

export default Error403
