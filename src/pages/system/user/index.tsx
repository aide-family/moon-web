import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { UserItem } from '@/api/model-types'
import { batchUpdateUserStatus, listUser, resetUserPassword, type ListUserRequest } from '@/api/user'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Button, Space, message, theme } from 'antd'
import type React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import { DetailModal } from './modal-detail'
import { ModalRoleSet } from './modal-role-set'
import { formList, getColumnList } from './options'

const { useToken } = theme

const defaultSearchParams: ListUserRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 50
  }
}

const User: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<UserItem[]>([])
  const [searchParams, setSearchParams] = useState<ListUserRequest>(defaultSearchParams)
  const [total, setTotal] = useState(0)
  const [openDetail, setOpenDetail] = useState(false)
  const [detailId, setDetailId] = useState(0)
  const [openSetRoleModal, setOpenSetRoleModal] = useState(false)
  const [userDetail, setUserDetail] = useState<UserItem>()

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const { run: initUserList, loading: initUserListLoading } = useRequest(listUser, {
    manual: true,
    onSuccess: (data) => {
      setDatasource(data.list || [])
      setTotal(data.pagination?.total || 0)
    }
  })

  const { run: onResetUserPassword } = useRequest(resetUserPassword, {
    manual: true,
    onSuccess: () => {
      message.success('重置密码成功, 邮件已发送')
      onRefresh()
    }
  })

  const onRefresh = () => {
    initUserList(searchParams)
  }

  const onOpenDetail = (id: number) => {
    setDetailId(id)
    setOpenDetail(true)
  }

  const onCloseDetail = () => {
    setOpenDetail(false)
    setDetailId(0)
  }

  const onOpenSetRoleModal = (item: UserItem) => {
    setUserDetail(item)
    setOpenSetRoleModal(true)
  }

  const onCloseSetRoleModal = () => {
    setOpenSetRoleModal(false)
    setUserDetail(undefined)
  }

  const onOkSetRoleModal = () => {
    onCloseSetRoleModal()
    onRefresh()
  }

  useEffect(() => {
    initUserList(searchParams)
  }, [searchParams, initUserList])

  const onSearch = (formData: ListUserRequest) => {
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

  const onHandleMenuOnClick = (item: UserItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        batchUpdateUserStatus({
          ids: [item.id],
          status: Status.StatusEnable
        }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        batchUpdateUserStatus({
          ids: [item.id],
          status: Status.StatusDisable
        }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.UPDATE_ROLE:
        onOpenSetRoleModal(item)
        break
      case ActionKey.DETAIL:
        onOpenDetail(item.id)
        break
      case ActionKey.RESET_PASSWORD:
        onResetUserPassword({ id: item.id })
        break
    }
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  return (
    <div className='p-3 gap-3 flex flex-col'>
      <DetailModal id={detailId} open={openDetail} onCancel={onCloseDetail} />
      <ModalRoleSet
        title='设置角色'
        detail={userDetail}
        open={openSetRoleModal}
        onCancel={onCloseSetRoleModal}
        onOk={onOkSetRoleModal}
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
          <div className='text-lg font-bold'>用户列表</div>
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
            loading={initUserListLoading}
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

export default User
