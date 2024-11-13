import { ActionKey } from '@/api/global'

import { Status, TemplateSourceType } from '@/api/enum'
import { StrategyGroupItem, StrategyItem } from '@/api/model-types'
import {
  createStrategy,
  CreateStrategyLevelRequest,
  CreateStrategyRequest,
  deleteStrategy,
  listStrategy,
  ListStrategyRequest,
  pushStrategy,
  updateStrategy,
  updateStrategyStatus
} from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, message, Modal, Space, theme } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Detail } from './detail'
import styles from './index.module.scss'
import { MetricEditModal, MetricEditModalData } from './metric-edit-modal'
import { formList, getColumnList } from './options'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListStrategyRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  }
  // keyword: '',
  // status: Status.ALL
  // teamId: ''
}

const StrategyMetric: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<StrategyItem[]>([])
  const [searchParams, setSearchParams] = useState<ListStrategyRequest>(defaultSearchParams)
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
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)
  const [detailId, setDetailId] = useState<number>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const handleDetailModal = (id: number) => {
    setDetailId(id)
    setOpenDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false)
    setDetailId(0)
  }

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
        const { list, pagination } = await listStrategy(params)
        setDatasource(list || [])
        setTotal(pagination?.total || 0)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  const handleMetricEditModalSubmit = (data: MetricEditModalData) => {
    const {
      name,
      expr,
      remark,
      labels,
      annotations,
      alarmGroupIds,
      categoriesIds,
      groupId,
      step,
      datasourceIds,
      strategyLevel
    } = data
    const params: CreateStrategyRequest = {
      name,
      expr,
      remark,
      labels,
      annotations,
      categoriesIds,
      groupId,
      step,
      datasourceIds,
      strategyLevel: strategyLevel.map((item) => {
        const { interval, alarmPageIds, alarmGroupIds, labelNotices } = item
        return {
          ...item,
          duration: item.duration,
          interval: interval,
          alarmPageIds,
          alarmGroupIds,
          labelNotices
        } satisfies CreateStrategyLevelRequest
      }),
      alarmGroupIds,
      status: Status.StatusEnable,
      sourceType: TemplateSourceType.TemplateSourceTypeTeam
    }

    const call = () => {
      if (!editGroupId) {
        return createStrategy(params)
      } else {
        return updateStrategy({ data: params, id: editGroupId })
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

  const onSearch = (formData: ListStrategyRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams?.pagination?.pageSize
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
        updateStrategyStatus({ ids: [item.id], status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        updateStrategyStatus({ ids: [item.id], status: Status.StatusDisable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleDetailModal(item.id)
        break
      case ActionKey.EDIT:
        handleEditModal(item.id)
        break
      case ActionKey.IMMEDIATELY_PUSH:
        pushStrategy(item.id)
          .then(() => message.success('推送成功'))
          .catch(() => message.error('推送失败'))
        break
      case ActionKey.DELETE:
        confirm({
          title: `请确认是否删除该策略组?`,
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            deleteStrategy({ id: item.id }).then(() => {
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
      <MetricEditModal
        title={editGroupId ? (disabledEditGroupModal ? '策略详情' : '编辑策略') : '新建策略'}
        width='60%'
        strategyId={editGroupId}
        style={{ minWidth: 504 }}
        open={openGroupEditModal}
        onCancel={handleCloseGroupEditModal}
        submit={handleMetricEditModalSubmit}
        disabled={disabledEditGroupModal}
      />
      <Detail width='60%' strategyId={detailId} open={openDetailModal} onCancel={handleCloseDetailModal} />
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
              y: `calc(100vh - 170px  - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          />
        </div>
      </div>
    </div>
  )
}

export default StrategyMetric
