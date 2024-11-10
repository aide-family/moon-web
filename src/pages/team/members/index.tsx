import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { TeamMemberItem } from '@/api/model-types'
import { ListStrategyGroupRequest } from '@/api/strategy'
import { batchUpdateTeamMembersStatus, listTeamMember, ListTeamMemberRequest, removeTeamMember } from '@/api/team'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, message, Modal, Space, theme } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styles from './index.module.scss'
import { DetailModal } from './modal-detail'
import { Invite } from './modal-invite'
import { formList, getColumnList } from './options'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListTeamMemberRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  status: Status.StatusAll
}

const Group: React.FC = () => {
  const { token } = useToken()

  const { userInfo, isFullscreen } = useContext(GlobalContext)
  const [datasource, setDatasource] = useState<TeamMemberItem[]>([])
  const [searchParams, setSearchParams] = useState<ListTeamMemberRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [detail, setDetail] = useState<TeamMemberItem>()
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [openInviteModal, setOpenInviteModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const handleOpenDetailModal = (detail: TeamMemberItem) => {
    setDetail(detail)
    setOpenDetailModal(true)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const fetchData = useCallback(
    debounce(async (params) => {
      setLoading(true)
      listTeamMember(params)
        .then(({ list, pagination }) => {
          setDatasource(list || [])
          setTotal(pagination?.total || 0)
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

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

  const onHandleMenuOnClick = (item: TeamMemberItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        batchUpdateTeamMembersStatus({ memberIds: [item.id], status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        batchUpdateTeamMembersStatus({ memberIds: [item.id], status: Status.StatusDisable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetailModal(item)
        break
      case ActionKey.DELETE:
        confirm({
          title: `请确认是否删除该团队成员?`,
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            removeTeamMember({ memberID: item.id }).then(() => {
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
    pageSize: searchParams.pagination.pageSize,
    userId: userInfo?.id || 0
  })

  const onCloseDetailModal = () => {
    setOpenDetailModal(false)
  }

  const handleOpenInviteModal = () => {
    setOpenInviteModal(true)
  }

  return (
    <div className={styles.box}>
      <DetailModal
        id={detail?.id || 0}
        open={openDetailModal}
        onCancel={onCloseDetailModal}
        onOk={onCloseDetailModal}
      />
      <Invite open={openInviteModal} setOpen={setOpenInviteModal} />
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
            团队成员列表
          </div>
          <Space size={8}>
            <Button type='primary' onClick={handleOpenInviteModal}>
              邀请
            </Button>
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
