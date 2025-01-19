import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { DashboardItem } from '@/api/model-types'
import {
  type ListDashboardRequest,
  batchUpdateDashboardStatus,
  deleteDashboard,
  listDashboard
} from '@/api/realtime/dashboard'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Modal, Space, message, theme } from 'antd'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GroupEditModal } from './modal-edit'
import { formList, getColumnList } from './options'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListDashboardRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 50
  }
}

const Group: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useToken()
  const [datasource, setDatasource] = useState<DashboardItem[]>([])
  const [searchParams, setSearchParams] = useState<ListDashboardRequest>(defaultSearchParams)
  const [total, setTotal] = useState(0)
  const [openGroupEditModal, setOpenGroupEditModal] = useState(false)
  const [editGroupId, setEditGroupId] = useState<number>()
  const [disabledEditGroupModal, setDisabledEditGroupModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource)

  const handleCloseGroupEditModal = () => {
    setOpenGroupEditModal(false)
    setEditGroupId(0)
    setDisabledEditGroupModal(false)
  }

  const handleEditModal = (editId?: number) => {
    setEditGroupId(editId)
    setOpenGroupEditModal(true)
  }

  const handleOpenDetailModal = (groupId: number) => {
    setEditGroupId(groupId)
    setOpenGroupEditModal(true)
    setDisabledEditGroupModal(true)
  }

  const { run: fetchData, loading } = useRequest(listDashboard, {
    manual: true,
    onSuccess: (data) => {
      setDatasource(data.list || [])
      setTotal(data.pagination?.total || 0)
    }
  })

  const onRefresh = () => {
    fetchData(searchParams)
  }

  useEffect(() => {
    fetchData(searchParams)
  }, [searchParams, fetchData])

  const onSearch = (formData: ListDashboardRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams.pagination.pageSize
      }
    })
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

  // 重置
  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  const onHandleMenuOnClick = (item: DashboardItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        batchUpdateDashboardStatus({
          ids: [item.id],
          status: Status.StatusEnable
        }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        batchUpdateDashboardStatus({
          ids: [item.id],
          status: Status.StatusDisable
        }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetailModal(item.id)
        break
      case ActionKey.EDIT:
        handleEditModal(item.id)
        break
      case ActionKey.CHART_MANAGE:
        // 携带仪表盘 ID 跳转
        navigate(`/home/team/dashboard/chart?id=${item.id}&title=${item.title}`)
        break
      case ActionKey.DELETE:
        confirm({
          title: '请确认是否删除该仪表盘?',
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            deleteDashboard({ id: item.id }).then(() => {
              message.success('删除成功')
              onRefresh()
            })
          },
          onCancel() {
            message.info('取消操作')
          }
        })
        break
    }
  }

  const handleEditModalOnOK = () => {
    handleCloseGroupEditModal()
    onRefresh()
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  return (
    <div className='p-3 gap-3 flex flex-col'>
      <GroupEditModal
        title={editGroupId ? (disabledEditGroupModal ? '仪表盘详情' : '编辑仪表盘') : '新建仪表盘'}
        className='min-w-[504px]'
        open={openGroupEditModal}
        onCancel={handleCloseGroupEditModal}
        groupId={editGroupId}
        disabled={disabledEditGroupModal}
        onOk={handleEditModalOnOK}
      />
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
          <div className='text-lg font-bold'>仪表盘列表</div>
          <Space size={8}>
            <Button type='primary' onClick={() => handleEditModal()}>
              添加
            </Button>
            <Button onClick={() => handleEditModal()}>批量导入</Button>
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
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
              y: `calc(100vh - 174px - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          />
        </div>
      </div>
    </div>
  )
}

export default Group
