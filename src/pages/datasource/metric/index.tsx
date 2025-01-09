import { type ListDatasourceRequest, listDatasource } from '@/api/datasource'
import { DatasourceType } from '@/api/enum'
import type { DatasourceItem } from '@/api/model-types'
import useStorage from '@/hooks/storage'
import { Button, Empty, Input, Menu, Tabs, type TabsProps, theme } from 'antd'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { AlarmTemplate } from './alarm-template'
import { Basics } from './basics'
import { EditModal } from './edit-modal'
import { Metadata } from './metadata'
import { TimelyQuery } from './timely-query'

const { useToken } = theme

const defaultSearchDatasourceParams: ListDatasourceRequest = {
  datasourceType: DatasourceType.DatasourceTypeMetric,
  pagination: {
    pageNum: 1,
    pageSize: 100
  }
}

let searchTimer: NodeJS.Timeout | null = null
const Metric: React.FC = () => {
  const { token } = useToken()

  const [datasource, setDatasource] = useState<DatasourceItem[]>([])
  const [datasourceDetail, setDatasourceDetail] = useState<DatasourceItem>()

  const [searchDatasourceParams, setSearchDatasourceParams] =
    useState<ListDatasourceRequest>(defaultSearchDatasourceParams)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [editId, setEditId] = useState<number>()
  const [tabKey, setTabKey] = useStorage<string>('metricDatasourceTab', 'basics')
  const [expr, setExpr] = useStorage<string>('timelyQueryExpr', '')

  const handleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const editDataSource = () => {
    setOpenAddModal(true)
    setEditId(datasourceDetail?.id)
  }

  const handleToTimelyQuery = (expr: string) => {
    setExpr(expr)
    setTabKey('realtime-query')
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
          <Metadata datasource={datasourceDetail} toTimelyQuery={handleToTimelyQuery} />
        </div>
      )
    },
    {
      key: 'realtime-query',
      label: '及时查询',
      children: (
        <div className='overflow-auto overflow-x-hidden'>
          <TimelyQuery datasource={datasourceDetail} expr={expr} setExpr={setExpr} />
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

  const handleDatasourceSearch = useCallback(() => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = setTimeout(() => {
      listDatasource(searchDatasourceParams).then((res) => {
        setDatasource(res?.list || [])
      })
    }, 500)
  }, [searchDatasourceParams])

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
      keyword: `${e.target.value}%`
    })
  }

  useEffect(() => {
    if (!datasource || !datasource.length) return
    setDatasourceDetail(datasource?.[0])
  }, [datasource])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    handleDatasourceSearch()
  }, [refresh, handleDatasourceSearch])
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
          selectedKeys={[`${datasourceDetail?.id}`]}
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
