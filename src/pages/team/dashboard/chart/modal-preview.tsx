import type { ChartItem, DashboardItem } from '@/api/model-types'
import { getDashboard } from '@/api/realtime/dashboard'
import { useRequest } from 'ahooks'
import { Card, Col, Modal, type ModalProps, Row, theme } from 'antd'
import { useEffect, useState } from 'react'

export interface ModalPreviewProps extends ModalProps {
  dashboardId: number
  onClose: () => void
}

export const PreviewCard = ({ chart }: { chart: ChartItem }) => {
  let width: number | string = 6
  let height: number | string = 300

  if (chart.width && Number(chart.width) > 0 && Number(chart.width) <= 24) {
    width = Number(chart.width)
  }
  if (chart.height) {
    height = chart.height
  }

  return (
    <Col span={width}>
      <Card title={chart.title} size='small' style={{ height: height, overflow: 'hidden' }}>
        <iframe src={chart.url} width='100%' height={height} title={chart.title} />
      </Card>
    </Col>
  )
}

const { useToken } = theme

export const ModalPreview: React.FC<ModalPreviewProps> = (props) => {
  const { dashboardId, onClose, open, ...rest } = props
  const { token } = useToken()

  const [dashboard, setDashboard] = useState<DashboardItem>()

  const { run: runGetDashboard, loading } = useRequest(
    () => getDashboard({ id: dashboardId, charts: true, myDashboard: true }),
    {
      refreshDeps: [dashboardId],
      onSuccess: (data) => {
        setDashboard(data.detail)
      }
    }
  )

  useEffect(() => {
    if (open) {
      runGetDashboard()
    }
  }, [open, runGetDashboard])

  return (
    <Modal
      {...rest}
      onCancel={onClose}
      onClose={onClose}
      footer={null}
      open={open}
      loading={loading}
      className='h-[80vh]'
    >
      <Row
        gutter={[8, 8]}
        wrap
        className='p-2 overflow-y-auto max-h-[80vh]'
        style={{ background: token.colorBgLayout, borderRadius: token.borderRadius }}
      >
        {dashboard?.charts?.map((chart) => <PreviewCard key={chart.id} chart={chart} />)}
      </Row>
    </Modal>
  )
}
