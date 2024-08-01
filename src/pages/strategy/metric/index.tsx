import React, { useEffect, useState, useRef, Key, useCallback } from 'react'
import { Status, ActionKey } from '@/api/global'
import { Space, message, Modal, theme, Button } from 'antd'
import { debounce } from 'lodash'
import AutoTable from '@/components/table/index'
import SearchBox from '@/components/data/search-box'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { formList, getColumnList, GroupEditModalFormData } from './options'
import {
  getStrategyGroupList,
  createStrategyGroup,
  deleteStrategyGroup,
  updateStrategyGroup,
  changeStrategyGroup
} from '@/api/strategy'
import { GetStrategyGroupListRequest, StrategyGroupItemType } from '@/api/strategy/types'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { TemplateEditModal, TemplateEditModalData } from './group-edit-modal'
import styles from './index.module.scss'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: GetStrategyGroupListRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  status: Status.ALL
  // teamId: ''
}

const StrategyMetric: React.FC = () => {
  const { token } = useToken()
  const [datasource, setDatasource] = useState<StrategyGroupItemType[]>([])
  const [searchParams, setSearchParams] = useState<GetStrategyGroupListRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [openGroupEditModal, setOpenGroupEditModal] = useState(false)
  const [editGroupId, setEditGroupId] = useState<number>()
  const [disabledEditGroupModal, setDisabledEditGroupModal] = useState(false)
  const handleEditModal = (editId?: number) => {
    setEditGroupId(editId)
    setOpenGroupEditModal(true)
  }
  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource)

  const handleCloseGroupEditModal = () => {
    setOpenGroupEditModal(false)
    setEditGroupId(0)
    setDisabledEditGroupModal(false)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const fetchData = useCallback(
    debounce(async (params) => {
      setLoading(true)
      try {
        const { list, pagination } = await getStrategyGroupList(params)
        setDatasource(list || [])
        setTotal(pagination?.total || 0)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  const handleGroupEditModalSubmit = (data: any) => {
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
        return updateStrategyGroup(editGroupId, upParams)
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

  const onSearch = (formData: GetStrategyGroupListRequest) => {
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

  const onHandleMenuOnClick = (item: StrategyGroupItemType, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        changeStrategyGroup([item.id], 2).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        changeStrategyGroup([item.id], 1).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        console.log('详情。')
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
            deleteStrategyGroup(item.id).then(() => {
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
      <TemplateEditModal
        title={editGroupId ? (disabledEditGroupModal ? '策略详情' : '编辑策略') : '新建策略'}
        width='60%'
        style={{ minWidth: 504 }}
        open={openGroupEditModal}
        onCancel={handleCloseGroupEditModal}
        submit={handleGroupEditModalSubmit}
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
            <Button onClick={() => handleEditModal()}>批量导入</Button>
            <Button type='primary' onClick={onRefresh}>
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
              y: `calc(100vh - 170px  - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          ></AutoTable>
        </div>
      </div>
    </div>
  )
}

export default StrategyMetric
