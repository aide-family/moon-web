import { theme } from 'antd'
import type React from 'react'
import HouyiServer from './houyi_server'
import RabbimtServer from './rabbit_server'

const { useToken } = theme
const Server: React.FC = () => {
  const { token } = useToken()
  return (
    <div className='flex flex-col gap-3 p-3'>
      <div className='p-3' style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <HouyiServer />
      </div>

      <div className='p-3' style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <RabbimtServer />
      </div>
    </div>
  )
}

export default Server
