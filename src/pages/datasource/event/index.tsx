import { EventDatasource } from '@/api/datasource/mq'
import useStorage from '@/utils/storage'
import { Button, Empty, Input, Menu, Tabs, TabsProps, theme } from 'antd'
import { useEffect, useState } from 'react'
import { Basics } from './basics'
import { EditModal } from './edit-modal'

export default function Event() {
  const [open, setOpen] = useState(false)
  const { token } = theme.useToken()
  const [datasource, setDatasource] = useState<EventDatasource[]>([])
  const [datasourceDetail, setDatasourceDetail] = useState<EventDatasource>()
  const [tabKey, setTabKey] = useStorage<string>('mqDatasourceTab', 'basics')
  const refresh = () => {
    console.log('refresh')
  }

  const tabsItems: TabsProps['items'] = [
    {
      key: 'basics',
      label: '基本信息',
      children: (
        <div className='overflow-auto overflow-x-hidden'>
          {datasourceDetail && (
            <Basics datasource={datasourceDetail} refresh={refresh} editDataSource={() => setOpen(true)} />
          )}
        </div>
      )
    }
  ]

  const handleDatasourceSearch = () => {
    console.log('search')
  }

  const handleDatasourceChange = (id: number) => {
    setDatasourceDetail(datasource?.find((item) => item.id === id))
  }

  useEffect(() => {
    setDatasource([])
  }, [])

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
        <Input.Search placeholder='数据源' onSearch={handleDatasourceSearch} />
        <Menu
          items={datasource?.map((item) => {
            return {
              key: item.id,
              label: item.name
            }
          })}
          selectedKeys={[datasourceDetail?.id + '']}
          className='menu'
          onSelect={(k) => handleDatasourceChange(+k.key)}
        />
      </div>
      <div className='p-3 flex-1 overflow-auto' style={{ background: token.colorBgContainer }}>
        {datasourceDetail ? (
          <Tabs defaultActiveKey='basics' activeKey={tabKey} onChange={setTabKey} items={tabsItems} />
        ) : (
          <div className='h-full w-full flex justify-center items-center'>
            <Empty />
          </div>
        )}
      </div>
    </div>
  )
}
