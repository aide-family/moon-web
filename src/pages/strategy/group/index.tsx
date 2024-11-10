import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { StrategyGroupItem } from '@/api/model-types'
import {
  createStrategyGroup,
  deleteStrategyGroup,
  listStrategyGroup,
  ListStrategyGroupRequest,
  updateStrategyGroup,
  updateStrategyGroupStatus
} from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, message, Modal, Space, theme } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { GroupEditModal } from './group-edit-modal'
import styles from './index.module.scss'
import { formList, getColumnList, GroupEditModalFormData } from './options'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListStrategyGroupRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  status: Status.StatusAll
  // teamId: ''
}

const Group: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<StrategyGroupItem[]>([])
  const [searchParams, setSearchParams] = useState<ListStrategyGroupRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [openGroupEditModal, setOpenGroupEditModal] = useState(false)
  const [editGroupId, setEditGroupId] = useState<number>()
  const [disabledEditGroupModal, setDisabledEditGroupModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

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
    setRefresh(!refresh)
  }

  const fetchData = useCallback(
    debounce(async (params) => {
      setLoading(true)
      listStrategyGroup(params)
        .then(({ list, pagination }) => {
          setDatasource(list || [])
          setTotal(pagination?.total || 0)
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  const handleGroupEditModalSubmit = (data: GroupEditModalFormData) => {
    const { name, remark, categoriesIds } = data
    const params = {
      remark,
      name,
      categoriesIds
    }
    const upParams = {
      update: params
    }
    const call = () => {
      if (!editGroupId) {
        return createStrategyGroup(params)
      } else {
        return updateStrategyGroup({ id: editGroupId, ...upParams })
      }
    }
    return call().then(() => {
      message.success(`${editGroupId ? '编辑' : '添加'}成功`)
      handleCloseGroupEditModal()
      onRefresh()
    })
  }

  useEffect(() => {
    fetchData(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, searchParams, fetchData])

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
        updateStrategyGroupStatus({ ids: [item.id], status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        updateStrategyGroupStatus({ ids: [item.id], status: Status.StatusDisable }).then(() => {
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
          title: `请确认是否删除该策略组?`,
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

  return (
    <div className={styles.box}>
      <GroupEditModal
        title={editGroupId ? (disabledEditGroupModal ? '分组详情' : '编辑分组') : '新建分组'}
        width='40%'
        style={{ minWidth: 504 }}
        open={openGroupEditModal}
        onCancel={handleCloseGroupEditModal}
        submit={handleGroupEditModalSubmit}
        groupId={editGroupId}
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
        className={styles.main}
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <div className={styles.main_toolbar}>
          <div className={styles.main_toolbar_left} style={{ fontSize: '16px' }}>
            策略组
          </div>
          <Space size={8}>
            <Button type='primary' onClick={() => handleEditModal()}>
              添加
            </Button>
            {/* <Button onClick={() => handleEditModal()}>批量导入</Button> */}
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        </div>
        <div style={{ marginTop: '20px' }} ref={ADivRef}>
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
              y: `calc(100vh - 165px  - ${AutoTableHeight}px)`,
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
