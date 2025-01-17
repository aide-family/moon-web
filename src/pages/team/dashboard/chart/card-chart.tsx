import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { ChartItem } from '@/api/model-types'
import MoreMenu, { MoreMenuProps } from '@/components/moreMenu'
import { Button, Card, CardProps, Space } from 'antd'
import { Ellipsis, Expand, Fullscreen } from 'lucide-react'
import { useState } from 'react'
import { ModalChart } from './modal-chart'

export interface ChartCardProps extends CardProps {
  chart: ChartItem
  handleEditModal: (data?: ChartItem) => void
}

const tableOperationItems = (record: ChartItem): MoreMenuProps['items'] => [
  record.status === Status.StatusDisable
    ? {
        key: ActionKey.ENABLE,
        label: (
          <Button type='link' size='small'>
            启用
          </Button>
        )
      }
    : {
        key: ActionKey.DISABLE,
        label: (
          <Button type='link' size='small' danger>
            禁用
          </Button>
        )
      },
  {
    key: ActionKey.EDIT,
    label: (
      <Button size='small' type='link'>
        编辑
      </Button>
    )
  },
  {
    key: ActionKey.OPERATION_LOG,
    label: (
      <Button size='small' type='link'>
        操作日志
      </Button>
    )
  },
  {
    key: ActionKey.DELETE,
    label: (
      <Button type='link' size='small' danger>
        删除
      </Button>
    )
  }
]

export const ChartCard = (props: ChartCardProps) => {
  const { chart, handleEditModal } = props

  const [chartModalOpen, setChartModalOpen] = useState(false)

  const openChartModal = () => {
    setChartModalOpen(true)
  }

  const closeChartModal = () => {
    setChartModalOpen(false)
  }

  // 进入全屏模式的函数
  function openFullscreen() {
    const elem = document.getElementById(`chart-iframe-${chart.id}`)
    if (!elem) return
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    }
  }

  const onHandleMenuOnClick = (key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        break
      case ActionKey.DISABLE:
        break
      case ActionKey.EDIT:
        handleEditModal(chart)
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DELETE:
        break
    }
  }
  return (
    <>
      <ModalChart chart={chart} open={chartModalOpen} onCancel={closeChartModal} title={chart.title} />
      <Card
        title={chart.title}
        className='cursor-pointer hover:shadow-md hover:shadow-gray-300/50 transition-all duration-300'
        extra={
          <Space size={20}>
            <Button size='small' type='link' onClick={() => openFullscreen()}>
              <Expand size={16} />
            </Button>
            <Button size='small' type='link' onClick={() => openChartModal()}>
              <Fullscreen size={16} />
            </Button>
            {tableOperationItems && tableOperationItems?.length > 0 && (
              <MoreMenu
                items={tableOperationItems(chart)}
                onClick={onHandleMenuOnClick}
                text={<Ellipsis size={16} />}
              />
            )}
          </Space>
        }
      >
        <div className='overflow-hidden h-[200px] w-full' id={`chart-iframe-${chart.id}`}>
          <iframe src={chart.url} width='100%' height='100%' className='overflow-hidden' />
        </div>
      </Card>
    </>
  )
}
