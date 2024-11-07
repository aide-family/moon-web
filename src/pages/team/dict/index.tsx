import {
  batchUpdateDictStatus,
  createDict,
  CreateDictRequest,
  deleteDict,
  listDict,
  ListDictRequest,
  updateDict
} from '@/api/dict'
import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { DictItem } from '@/api/model-types'
import { ListStrategyGroupRequest } from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, message, Modal, Space, theme } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { GroupEditModal } from './group-edit-modal'
import styles from './index.module.scss'
import { formList, getColumnList } from './options'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListDictRequest = {
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
  const [datasource, setDatasource] = useState<DictItem[]>([])
  const [searchParams, setSearchParams] = useState<ListDictRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
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

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const fetchData = useCallback(
    debounce(async (params) => {
      setLoading(true)
      listDict(params)
        .then(({ list, pagination }) => {
          setDatasource(list || [])
          setTotal(pagination?.total || 0)
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  const handleGroupEditModalSubmit = (data: CreateDictRequest) => {
    const call = () => {
      if (!editGroupId) {
        return createDict(data)
      } else {
        return updateDict({
          data: data,
          id: editGroupId
        })
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

  const onHandleMenuOnClick = (item: DictItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        batchUpdateDictStatus({ ids: [item.id], status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        batchUpdateDictStatus({ ids: [item.id], status: Status.StatusDisable }).then(() => {
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
          title: `请确认是否删除该字典?`,
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            deleteDict({ id: item.id }).then(() => {
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
        title={editGroupId ? (disabledEditGroupModal ? '字典详情' : '编辑字典') : '新建字典'}
        width='60%'
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
            字典列表
          </div>
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
