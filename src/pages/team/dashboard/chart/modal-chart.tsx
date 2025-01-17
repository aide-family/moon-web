import { ChartItem } from '@/api/model-types'
import { Modal, ModalProps } from 'antd'

export interface ModalChartProps extends ModalProps {
  chart: ChartItem
  onCancel: () => void
}

export const ModalChart: React.FC<ModalChartProps> = (props) => {
  const { chart, onCancel, ...resetProps } = props
  return (
    <Modal {...resetProps} onCancel={onCancel} footer={null} width='80vw' centered>
      <div className='overflow-hidden h-[80vh] w-full'>
        <iframe src={chart.url} width='100%' height='100%' className='overflow-hidden' />
      </div>
    </Modal>
  )
}
