import type { ChartItem, DashboardItem } from '@/api/model-types'
import { getDashboard } from '@/api/realtime/dashboard'
import { useRequest } from 'ahooks'
import { Card, Modal, type ModalProps } from 'antd'
import { useEffect, useState } from 'react'

export interface ModalPreviewProps extends ModalProps {
  dashboardId: number
  onClose: () => void
}

const PreviewCard = ({ chart }: { chart: ChartItem }) => {
  let width: number | string = 400
  let height: number | string = 300

  if (chart.width) {
    width = `calc(${chart.width} - 12px)`
  }
  if (chart.height) {
    height = chart.height
  }

  return (
    <Card title={chart.title} size='small' style={{ width: width, height: height, overflow: 'hidden' }}>
      <iframe src={chart.url} width='100%' height={height} title={chart.title} />
    </Card>
  )
}

export const ModalPreview: React.FC<ModalPreviewProps> = (props) => {
  const { dashboardId, onClose, open, ...rest } = props

  const [dashboard, setDashboard] = useState<DashboardItem>()

  const { run: runGetDashboard, loading } = useRequest(() => getDashboard({ id: dashboardId, charts: true }), {
    refreshDeps: [dashboardId],
    onSuccess: (data) => {
      setDashboard(data.detail)
    }
  })

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
      <div className='flex gap-3 flex-wrap overflow-y-auto h-[80vh] '>
        {dashboard?.charts?.map((chart) => <PreviewCard key={chart.id} chart={chart} />)}
      </div>
    </Modal>
  )
}
