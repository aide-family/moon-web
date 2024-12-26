import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { StrategyGroupItem } from '@/api/model-types'
import {
  type ListStrategyGroupRequest,
  deleteStrategyGroup,
  listStrategyGroup,
  updateStrategyGroupStatus
} from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Modal, Space, message, theme } from 'antd'
import type React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import { GroupEditModal } from './group-edit-modal'
import { formList, getColumnList } from './options'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListStrategyGroupRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  status: Status.StatusAll
}

const Group: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<StrategyGroupItem[]>([])
  const [searchParams, setSearchParams] = useState<ListStrategyGroupRequest>(defaultSearchParams)
  const [total, setTotal] = useState(0)
  const [openGroupEditModal, setOpenGroupEditModal] = useState(false)
  const [editGroupId, setEditGroupId] = useState<number>()
  const [disabledEditGroupModal, setDisabledEditGroupModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const { run: initDatasource, loading: initDatasourceLoading } = useRequest(listStrategyGroup, {
    manual: true,
    onSuccess: (res) => {
      setDatasource(res.list || [])
      setTotal(res.pagination?.total || 0)
    }
  })

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

  const onRefresh = () => {
    initDatasource(searchParams)
  }

  const onSearch = (formData: ListStrategyGroupRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams?.pagination?.pageSize || 10
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

  const onHandleMenuOnClick = (item: StrategyGroupItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        updateStrategyGroupStatus({
          ids: [item.id],
          status: Status.StatusEnable
        }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        updateStrategyGroupStatus({
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
      case ActionKey.DELETE:
        confirm({
          title: '请确认是否删除该策略组?',
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            deleteStrategyGroup({ id: item.id }).then(() => {
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

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  const handleOnOKGroupEditModal = () => {
    handleCloseGroupEditModal()
    onRefresh()
  }

  useEffect(() => {
    initDatasource(searchParams)
  }, [initDatasource, searchParams])

  return (
    <div className='h-full flex flex-col gap-3 p-3'>
      <GroupEditModal
        title={editGroupId ? (disabledEditGroupModal ? '分组详情' : '编辑分组') : '新建分组'}
        width='40%'
        style={{ minWidth: 504 }}
        open={openGroupEditModal}
        onCancel={handleCloseGroupEditModal}
        onOk={handleOnOKGroupEditModal}
        groupId={editGroupId}
        disabled={disabledEditGroupModal}
      />
      <div style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
      </div>
      <div className='p-3' style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <div className='flex justify-between items-center'>
          <div className='font-bold text-lg'>策略组</div>
          <Space size={8}>
            <Button type='primary' onClick={() => handleEditModal()}>
              添加
            </Button>
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        </div>
        <div className='mt-3' ref={ADivRef}>
          <AutoTable
            rowKey={(record) => record.id}
            dataSource={datasource}
            total={total}
            loading={initDatasourceLoading}
            columns={columns}
            handleTurnPage={handleTurnPage}
            pageSize={searchParams.pagination.pageSize}
            pageNum={searchParams.pagination.pageNum}
            showSizeChanger={true}
            style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}
            scroll={{ y: `calc(100vh - 174px - ${AutoTableHeight}px)` }}
            size='middle'
          />
        </div>
      </div>
    </div>
  )
}

export default Group
