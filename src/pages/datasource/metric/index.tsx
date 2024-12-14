import { listDatasource, ListDatasourceRequest } from '@/api/datasource'
import { DatasourceType } from '@/api/enum'
import { DatasourceItem } from '@/api/model-types'
import useStorage from '@/utils/storage'
import { Button, Empty, Input, Menu, Tabs, TabsProps, theme } from 'antd'
import React, { useEffect } from 'react'
import { AlarmTemplate } from './alarm-template'
import { Basics } from './basics'
import { EditModal } from './edit-modal'
import { Metadata } from './metadata'
import { TimelyQuery } from './timely-query'

export interface MetricProps {}

const { useToken } = theme

const defaultSearchDatasourceParams: ListDatasourceRequest = {
  datasourceType: DatasourceType.DatasourceTypeMetric,
  pagination: {
    pageNum: 1,
    pageSize: 100
  }
}

let searchTimer: NodeJS.Timeout | null = null
const Metric: React.FC<MetricProps> = () => {
  const { token } = useToken()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [datasource, setDatasource] = React.useState<DatasourceItem[]>([])
  const [datasourceDetail, setDatasourceDetail] = React.useState<DatasourceItem>()

  const [searchDatasourceParams, setSearchDatasourceParams] =
    React.useState<ListDatasourceRequest>(defaultSearchDatasourceParams)
  const [openAddModal, setOpenAddModal] = React.useState(false)
  const [refresh, setRefresh] = React.useState(false)
  const [editId, setEditId] = React.useState<number>()
  const [tabKey, setTabKey] = useStorage<string>('metricDatasourceTab', 'basics')

  const handleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const editDataSource = () => {
    setOpenAddModal(true)
    setEditId(datasourceDetail?.id)
  }

  const tabsItems: TabsProps['items'] = [
    {
      key: 'basics',
      label: '基本信息',
      children: (
        <div className='overflow-auto overflow-x-hidden'>
          <Basics datasource={datasourceDetail} refresh={handleRefresh} editDataSource={editDataSource} />
        </div>
      )
    },
    {
      key: 'metadata',
      label: '元数据',
      children: (
        <div className='overflow-auto overflow-x-hidden'>
          <Metadata datasource={datasourceDetail} />
        </div>
      )
    },
    {
      key: 'realtime-query',
      label: '及时查询',
      children: (
        <div className='overflow-auto overflow-x-hidden'>
          <TimelyQuery datasource={datasourceDetail} />
        </div>
      )
    },
    {
      key: 'alarm-template',
      label: '告警模板',
      disabled: true,
      children: (
        <div className='overflow-auto overflow-x-hidden'>
          <AlarmTemplate datasource={datasourceDetail} />
        </div>
      )
    }
  ]

  const handleDatasourceChange = (key: number) => {
    setDatasourceDetail(datasource.find((item) => item.id === key))
  }

  const handleDatasourceSearch = () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = setTimeout(() => {
      listDatasource(searchDatasourceParams).then((res) => {
        setDatasource(res?.list || [])
      })
    }, 500)
  }

  const handleEditModalOnOK = () => {
    handleEditModalOnCancel()
    handleRefresh()
  }
  const handleEditModalOnCancel = () => {
    setOpenAddModal(false)
    setEditId(0)
  }

  const handleOnAdd = () => {
    setOpenAddModal(true)
  }

  const handleOnSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDatasourceParams({
      ...searchDatasourceParams,
      keyword: e.target.value + '%'
    })
  }

  useEffect(() => {
    if (!datasource || !datasource.length) return
    setDatasourceDetail(datasource?.[0])
  }, [datasource])

  useEffect(() => {
    handleDatasourceSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, searchDatasourceParams])
  return (
    <div className='p-3 flex flex-row gap-3 h-full w-full'>
      <EditModal
        title={editId ? '编辑数据源' : '新建数据源'}
        width='50%'
        closable={false}
        maskClosable={false}
        datasourceId={editId}
        open={openAddModal}
        onOk={handleEditModalOnOK}
        onCancel={handleEditModalOnCancel}
      />
      <div
        className='p-2 flex flex-col gap-2 h-full max-w-[400px] min-w-[200px]'
        style={{ background: token.colorBgContainer }}
      >
        <Button type='primary' className='w-full' onClick={handleOnAdd}>
          新建数据源
        </Button>
        <Input.Search placeholder='数据源' onChange={handleOnSearch} onSearch={handleDatasourceSearch} />
        <Menu
          items={datasource?.map((item) => {
            return {
              key: item.id,
              label: item.name
            }
          })}
          style={{ borderInlineEnd: 'none' }}
          selectedKeys={[datasourceDetail?.id + '']}
          className='w-full flex-1 overflow-auto text-start'
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

export default Metric
