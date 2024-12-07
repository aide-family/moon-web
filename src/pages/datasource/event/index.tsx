import { Button, theme } from 'antd'
import { useState } from 'react'
import { EditModal } from './edit-modal'

export default function Event() {
  const [open, setOpen] = useState(false)
  const { token } = theme.useToken()
  return (
    <div className='p-3 h-full w-full flex flex-row gap-2'>
      <EditModal title='新建数据源' width='60%' open={open} onClose={() => setOpen(false)} />
      <div
        className='max-w-[400px] min-w-[200px] p-2 flex flex-col gap-2'
        style={{ background: token.colorBgContainer }}
      >
        <Button type='primary' onClick={() => setOpen(true)}>
          新建数据源
        </Button>
      </div>
    </div>
  )
}
