import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { ResourceItem } from '@/api/model-types'
import { type ListResourceRequest, batchUpdateResourceStatus, listResource } from '@/api/resource'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { SwapOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Space, message, theme } from 'antd'
import type React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import { ResourceEditModal } from './edit-modal'
import { formList, getColumnList } from './options'

const { useToken } = theme

const defaultSearchParams: ListResourceRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  status: Status.StatusAll
}
export interface ResourceListProps {
  switchMenuList: () => void
}

const ResourceList: React.FC<ResourceListProps> = ({ switchMenuList }) => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<ResourceItem[]>([])
  const [searchParams, setSearchParams] = useState<ListResourceRequest>(defaultSearchParams)
  const [total, setTotal] = useState(0)
  const [openGroupEditModal, setOpenGroupEditModal] = useState(false)
  const [editGroupId, setEditGroupId] = useState<number>()
  const [disabledEditGroupModal, setDisabledEditGroupModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const { run: initResourceDetail, loading: initResourceDetailLoading } = useRequest(listResource, {
    manual: true,
    onSuccess: (data) => {
      setDatasource(data.list || [])
      setTotal(data.pagination?.total || 0)
    }
  })

  const handleCloseGroupEditModal = () => {
    setOpenGroupEditModal(false)
    setEditGroupId(0)
    setDisabledEditGroupModal(false)
  }

  const handleOpenDetailModal = (groupId: number) => {
    setEditGroupId(groupId)
    setOpenGroupEditModal(true)
    setDisabledEditGroupModal(true)
  }

  const onRefresh = () => {
    initResourceDetail(searchParams)
  }

  useEffect(() => {
    initResourceDetail(searchParams)
  }, [searchParams, initResourceDetail])

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

  const onHandleResourceOnClick = (item: ResourceItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        batchUpdateResourceStatus({ ids: [item.id], status: Status.StatusEnable }, true).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        batchUpdateResourceStatus({ ids: [item.id], status: Status.StatusDisable }, true).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetailModal(item.id)
        break
    }
  }

  const columns = getColumnList({
    onHandleResourceOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  return (
    <div className='p-3 gap-3 flex flex-col'>
      <ResourceEditModal
        title={editGroupId ? (disabledEditGroupModal ? '资源详情' : '编辑资源') : '新建资源'}
        width='60%'
        style={{ minWidth: 504 }}
        open={openGroupEditModal}
        onCancel={handleCloseGroupEditModal}
        resourceId={editGroupId}
        disabled={disabledEditGroupModal}
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
          <div className='flex items-center gap-2'>
            <div className='text-lg font-bold flex items-center gap-2'>API管理</div>
            <Button type='link' onClick={switchMenuList}>
              <SwapOutlined />
            </Button>
            <div
              className='text-lg font-bold text-slate-400 cursor-pointer hover:text-purple-500'
              onClick={switchMenuList}
            >
              菜单管理
            </div>
          </div>
          <Space size={8}>
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
            loading={initResourceDetailLoading}
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

export default ResourceList
