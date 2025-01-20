import type { DashboardItem } from '@/api/model-types'
import { getDashboard, listMyDashboard } from '@/api/realtime/dashboard'
import { PreviewCard } from '@/pages/team/dashboard/chart/modal-preview'
import { useRequest } from 'ahooks'
import { Badge, Button, Row, Space, Tabs, theme } from 'antd'
import { useEffect, useRef, useState } from 'react'
import ModalAppendDashboard from './modal-append-dashboard'

const { useToken } = theme

export default function Monitor() {
  const { token } = useToken()
  const [monitorDashboard, setMonitorDashboard] = useState<DashboardItem[]>([])
  const [dashboard, setDashboard] = useState<DashboardItem>()
  const [appendDashboardModal, setAppendDashboardModal] = useState<boolean>(false)
  const ADivRef = useRef<HTMLDivElement>(null)

  const { run: runGetDashboard, loading: loadingGetDashboard } = useRequest(getDashboard, {
    manual: true,
    onSuccess: (data) => {
      setDashboard(data.detail)
    }
  })

  const { run: fetchMyDashboard, loading: loadingFetchMyDashboard } = useRequest(listMyDashboard, {
    manual: true,
    onSuccess: (data) => {
      setMonitorDashboard(data.list || [])
    }
  })

  const onRefresh = () => {
    fetchMyDashboard()
  }

  const handleEditModal = () => {
    setAppendDashboardModal(true)
  }

  const handleAppendDashboardModalOnOk = () => {
    setAppendDashboardModal(false)
    onRefresh()
  }

  const handleAppendDashboardModalOnCancel = () => {
    setAppendDashboardModal(false)
  }

  useEffect(() => {
    if (monitorDashboard.length > 0) {
      runGetDashboard({ id: monitorDashboard[0].id, charts: true, myDashboard: true })
    }
  }, [monitorDashboard, runGetDashboard])

  useEffect(() => {
    fetchMyDashboard()
  }, [fetchMyDashboard])

  return (
    <div className='flex flex-col gap-3 p-3 overflow-y-auto'>
      <ModalAppendDashboard
        open={appendDashboardModal}
        onOk={handleAppendDashboardModalOnOk}
        onCancel={handleAppendDashboardModalOnCancel}
      />
      <div className='p-3' style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <div className='flex justify-between'>
          <div className='text-lg font-bold'>监控大盘</div>
          <Space size={8}>
            <Button type='primary' onClick={() => handleEditModal()}>
              添加
            </Button>
            <Button
              color='default'
              variant='filled'
              onClick={onRefresh}
              loading={loadingFetchMyDashboard || loadingGetDashboard}
            >
              刷新
            </Button>
          </Space>
        </div>
        {monitorDashboard.length > 0 && (
          <Tabs
            className='p-0'
            items={monitorDashboard.map((item) => ({
              label: <Badge text={item.title} color={item.color} />,
              key: `${item.id}`,
              children: null
            }))}
            onTabClick={(key) => {
              runGetDashboard({ id: Number(key), charts: true })
            }}
          />
        )}
      </div>
      {!!dashboard && (
        <div
          className='overflow-y-auto p-2'
          ref={ADivRef}
          style={{
            maxHeight: 'calc(100vh - 72px)',
            background: token.colorBgContainer,
            borderRadius: token.borderRadius
          }}
        >
          <Row gutter={[8, 8]} wrap>
            {dashboard?.charts?.map((chart) => <PreviewCard key={chart.id} chart={chart} />)}
          </Row>
        </div>
      )}
    </div>
  )
}
