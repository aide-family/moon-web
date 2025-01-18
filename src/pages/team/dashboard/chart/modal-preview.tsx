import { DashboardItem } from '@/api/model-types'
import { getDashboard } from '@/api/realtime/dashboard'
import { useRequest } from 'ahooks'
import { Card, Modal, ModalProps } from 'antd'
import { useEffect, useState } from 'react'

export interface ModalPreviewProps extends ModalProps {
  dashboardId: number
  onClose: () => void
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
    <Modal {...rest} onCancel={onClose} onClose={onClose} footer={null} open={open} loading={loading}>
      <div className='h-[80vh] flex flex-col gap-3 overflow-y-auto'>
        {dashboard?.charts?.map((chart) => (
          <Card
            title={chart.title}
            className='cursor-pointer hover:shadow-md hover:shadow-gray-300/50 transition-all duration-300'
          >
            <div className='overflow-hidden h-[200px] w-full' id={`chart-iframe-${chart.id}`}>
              <iframe src={chart.url} width='100%' height='100%' className='overflow-hidden' />
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  )
}
