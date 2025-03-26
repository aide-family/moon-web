import { Status } from '@/api/enum'
import { LogModuleTypeData } from '@/api/global'
import { LogItem } from '@/api/log'
import { ListResourceRequest } from '@/api/resource'
import SearchBox from '@/components/data/search-box'
import LogDetailModal from '@/components/log/log-detail-modal'
import LogModal from '@/components/log/log-modal'
import AutoTable, { AutoTableColumnType } from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { Avatar, Button, Space, theme } from 'antd'
import axios from 'axios'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { formList } from './options'

const { useToken } = theme
const defaultSearchParams: ListResourceRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  status: Status.StatusAll
}
const LogAudit: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDataSource] = React.useState<LogItem[]>([])
  const [searchParams, setSearchParams] = useState<ListResourceRequest>(defaultSearchParams)

  const [loading, setLoading] = useState<boolean>(false)
  const [total, setTotal] = useState<number>(0)
  const [refresh, setRefresh] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  // 弹窗状态
  const [isModalVisible, setModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<LogItem | null>(null)

  const [isLogModalVisible, setLogModalVisible] = useState(false)
  const handleShowLogModal = () => {
    setLogModalVisible(true)
  }
  const handleHideLogModal = () => {
    setLogModalVisible(false)
  }
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_: string, __: LogItem, index: number) => {
        return <span>{(searchParams.pagination.pageNum - 1) * searchParams.pagination.pageSize + index + 1}</span>
      }
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      render: (_: string, record: LogItem) => {
        const {
          operator: { avatar, name, nickname }
        } = record
        return (
          <div className='flex items-center gap-2'>
            <Avatar src={avatar}>{(nickname || name).at(0)?.toUpperCase()}</Avatar>
            {nickname || name}
          </div>
        )
      }
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      render: (_: string, record: LogItem) => {
        return LogModuleTypeData[record.module]
      }
    },
    {
      title: '数据ID',
      dataIndex: 'dataID',
      key: 'dataID'
    },
    {
      title: '操作时间',
      dataIndex: 'operateTime',
      key: 'operateTime'
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      render: (_: string, record: LogItem) => {
        return [record.action]
      }
    },
    {
      title: '操作内容',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      render: (_: string, record: LogItem) => {
        return (
          <div>
            <Button type='link' onClick={() => handleShowModal(record)}>
              详情
            </Button>
          </div>
        )
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as AutoTableColumnType<any>[]

  const handleShowModal = (record: LogItem) => {
    setSelectedRecord(record)
    setModalVisible(true)
  }

  const handleHideModal = () => {
    setModalVisible(false)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }
  // 切换分页
  const handleTurnPage = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pagination: {
        pageNum: page,
        pageSize: pageSize
      }
    })
  }
  const onSearch = (formData: ListResourceRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams.pagination.pageSize
      }
    })
  }
  // 重置
  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  useEffect(() => {
    // featchResourceList(searchParams)
    setLoading(true)
    axios.post('/api/logs', searchParams).then((res) => {
      console.log(res.data, 'res.data')
      setDataSource(res.data.list)
      setTotal(res.data.pagination.total)
      setLoading(false)
    })
  }, [refresh, searchParams])

  return (
    <div className='p-3 gap-3 flex flex-col'>
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
      </div>
      <div
        className='p-3'
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <div className='flex justify-between'>
          <div className='text-lg font-bold'>日志审计</div>
          <Space size={8}>
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
            <Button color='primary' variant='filled' onClick={handleShowLogModal}>
              查看日志
            </Button>
          </Space>
        </div>
        <div className='mt-4' ref={ADivRef}>
          <AutoTable
            rowKey={(record) => record.id}
            dataSource={datasource}
            total={total}
            loading={loading}
            columns={columns}
            handleTurnPage={handleTurnPage}
            pageSize={searchParams.pagination.pageSize}
            pageNum={searchParams.pagination.pageNum}
            showSizeChanger={true}
            style={{
              background: token.colorBgContainer,
              borderRadius: token.borderRadius
            }}
            scroll={{
              y: `calc(100vh - 174px  - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          />
        </div>
      </div>
      {/* 详情弹窗组件 */}
      <LogDetailModal open={isModalVisible} onCancel={handleHideModal} record={selectedRecord} />
      <LogModal open={isLogModalVisible} onCancel={handleHideLogModal} />
    </div>
  )
}
export default LogAudit
