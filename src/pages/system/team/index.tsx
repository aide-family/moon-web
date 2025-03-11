import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { TeamItem } from '@/api/model-types'
import { type ListTeamRequest, listTeam, syncTeam, updateTeamStatus } from '@/api/team'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Button, Space, message, theme } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
import { TeamDetailModal } from './modal-detail'
import { formList, getColumnList } from './options'

const defaultSearchParams: ListTeamRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 50
  }
}

const { useToken } = theme

export default function Team() {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)
  const [searchParams, setSearchParams] = useState<ListTeamRequest>({
    ...defaultSearchParams
  })
  const [teamList, setTeamList] = useState<TeamItem[]>([])
  const [total, setTotal] = useState(0)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [teamId, setTeamId] = useState<number>(0)

  const { run: getTeamList, loading } = useRequest(listTeam, {
    manual: true,
    onSuccess: (data) => {
      setTeamList(data.list)
      setTotal(data.pagination.total)
    }
  })

  const { run: syncTeamInfo, loading: syncTeamInfoLoading } = useRequest(syncTeam, {
    manual: true,
    onSuccess: () => {
      message.success('同步中， 请稍后')
    }
  })

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, teamList, isFullscreen)

  const onSearch = (formData: ListTeamRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams.pagination.pageSize
      }
    })
  }

  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  const onRefresh = () => {
    getTeamList(searchParams)
  }

  const handleTurnPage = (pageNum: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pagination: { pageNum, pageSize }
    })
  }

  const handleOpenDetailModal = (id: number) => {
    setTeamId(id)
    setOpenDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false)
    setTeamId(0)
  }

  const onHandleMenuOnClick = (item: TeamItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        updateTeamStatus({ id: item.id, status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        updateTeamStatus({ id: item.id, status: Status.StatusDisable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetailModal(item.id)
        break
      case ActionKey.SYNC:
        syncTeamInfo({ teamIds: [item.id] })
        break
    }
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  useEffect(() => {
    getTeamList(searchParams)
  }, [searchParams, getTeamList])

  return (
    <div className='p-3 gap-3 flex flex-col'>
      <TeamDetailModal
        title='团队详情'
        width='50%'
        teamId={teamId}
        open={openDetailModal}
        onCancel={handleCloseDetailModal}
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
          <div className='text-lg font-bold'>团队列表</div>
          <Space size={8}>
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        </div>
        <div className='mt-4' ref={ADivRef}>
          <AutoTable
            rowKey={(record) => record.id}
            dataSource={teamList}
            total={total}
            loading={loading || syncTeamInfoLoading}
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
