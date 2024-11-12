import { Button, Empty, Input, Menu, Tabs, TabsProps, theme } from 'antd'
import React, { useEffect } from 'react'
import { AlarmTemplate } from './alarm-template'
import { Basics } from './basics'
import { EditModal } from './edit-modal'
import { Metadata } from './metadata'
import { TimelyQuery } from './timely-query'

import { listDatasource, ListDatasourceRequest } from '@/api/datasource'
import { DatasourceItem } from '@/api/model-types'
import './index.scss'

export interface MetricProps {}

const { useToken } = theme

const defaultSearchDatasourceParams: ListDatasourceRequest = {
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
        <div className='box' style={{ overflow: 'auto' }}>
          <Basics datasource={datasourceDetail} refresh={handleRefresh} editDataSource={editDataSource} />
        </div>
      )
    },
    {
      key: 'metadata',
      label: '元数据',
      children: (
        <div className='box'>
          <Metadata datasource={datasourceDetail} />
        </div>
      )
    },
    {
      key: 'realtime-query',
      label: '及时查询',
      children: (
        <div className='box'>
          <TimelyQuery datasource={datasourceDetail} />
        </div>
      )
    },
    {
      key: 'alarm-template',
      label: '告警模板',
      disabled: true,
      children: (
        <div className='box'>
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
    setOpenAddModal(false)
    handleRefresh()
  }
  const handleEditModalOnCancel = () => {
    setOpenAddModal(false)
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
    <div className='metricDatasourceBox'>
      <EditModal
        width='50%'
        datasourceId={editId}
        open={openAddModal}
        onOk={handleEditModalOnOK}
        onCancel={handleEditModalOnCancel}
      />
      <div className='sider' style={{ background: token.colorBgContainer }}>
        <Button type='primary' style={{ width: '100%' }} onClick={handleOnAdd}>
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
          selectedKeys={[datasourceDetail?.id + '']}
          className='menu'
          onSelect={(k) => handleDatasourceChange(+k.key)}
        />
      </div>

      <div className='content' style={{ background: token.colorBgContainer }}>
        {datasourceDetail ? (
          <Tabs defaultActiveKey='basics' items={tabsItems} />
        ) : (
          <div style={{ height: '100%', width: '100%' }} className='center'>
            <Empty />
          </div>
        )}
      </div>
    </div>
  )
}

export default Metric
