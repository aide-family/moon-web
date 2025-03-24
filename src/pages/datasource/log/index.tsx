/* eslint-disable prettier/prettier */
import { listDatasource } from '@/api/datasource'
import { DatasourceType } from '@/api/enum'
import { defaultPaginationReq } from '@/api/global'
import { DatasourceItem } from '@/api/model-types'
import useStorage from '@/hooks/storage'
import { useRequest } from 'ahooks'
import { Button, Empty, Input, Menu, Tabs, TabsProps, theme } from 'antd'
import { useEffect, useState } from 'react'
import Topics from '../metric/topics'
import { Basics } from './basics'
import { EditModal } from './edit-modal'

export default function Event() {
  const [open, setOpen] = useState(false)
  const { token } = theme.useToken()
  const [datasource, setDatasource] = useState<DatasourceItem[]>([])
  const [datasourceDetail, setDatasourceDetail] = useState<DatasourceItem>()
  const [tabKey, setTabKey] = useStorage<string>('mqDatasourceTab', 'basics')
  const [editID, setEditID] = useState<number>(0)
  const [refresh, setRefresh] = useState(false)

  const handleRefresh = () => {
    setRefresh(!refresh)
  }

  const handleOpenEditModal = (id: number) => {
    setOpen(true)
    setEditID(id)
  }

  const tabsItems: TabsProps['items'] = [
    {
      key: 'basics',
      label: '基本信息',
      children: (
        <div className='overflow-auto overflow-x-hidden'>
          {datasourceDetail && (
            <Basics datasource={datasourceDetail} refresh={handleRefresh} editDataSource={handleOpenEditModal} />
          )}
        </div>
      )
    },
    {
      key: 'topic',
      label: '主题',
      children: <Topics datasourceID={datasourceDetail?.id} />
    }
  ]

  const { run: handleDatasourceSearch } = useRequest(
    (value?: string) =>
      listDatasource({
        pagination: defaultPaginationReq,
        keyword: value,
        datasourceType: DatasourceType.DatasourceTypeLog
      }),
    {
      manual: true, // 手动触发请求
      onSuccess: ({ list }) => {
        setDatasource(list)
        if (!datasourceDetail && list.length > 0) {
          setDatasourceDetail(list[0])
        } else {
          setDatasourceDetail(list.find((item) => item.id === datasourceDetail?.id))
        }
      }
    }
  )

  const handleDatasourceChange = (id: number) => {
    setDatasourceDetail(datasource?.find((item) => item.id === id))
  }

  const handleCloseEditModal = () => {
    setOpen(false)
    setEditID(0)
    handleDatasourceSearch()
  }

  const handleFinish = () => {
    handleCloseEditModal()
    handleRefresh()
  }

  useEffect(() => {
    handleDatasourceSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  return (
    <div className='p-3 h-full w-full flex flex-row gap-2'>
      <EditModal
        title='新建数据源'
        width='60%'
        open={open}
        datasourceId={editID}
        onClose={handleCloseEditModal}
        onFinish={handleFinish}
      />
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
