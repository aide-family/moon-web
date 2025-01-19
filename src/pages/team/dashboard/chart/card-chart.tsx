import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { ChartItem } from '@/api/model-types'
import { batchUpdateChartStatus, deleteChart } from '@/api/realtime/dashboard'
import MoreMenu, { type MoreMenuProps } from '@/components/moreMenu'
import { useRequest } from 'ahooks'
import { Badge, Button, Card, type CardProps, Space, message } from 'antd'
import { Ellipsis, Expand, Fullscreen, PanelBottomDashed } from 'lucide-react'
import { useState } from 'react'
import { ModalChart } from './modal-chart'

export type SortType = 'up' | 'down' | 'top' | 'bottom'

export interface ChartCardProps extends CardProps {
  /** 仪表板 ID */
  dashboardId: number
  /** 图表 */
  chart: ChartItem
  /** 编辑图表 */
  handleEditModal: (data?: ChartItem) => void
  /** 刷新图表 */
  refreshChart: () => void
  /** 更新图表排序 */
  updateChartSort: (data: { id: number; sort: SortType }) => void
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
    key: ActionKey.CHART_SORT_UP,
    label: (
      <Button size='small' type='link'>
        上移
      </Button>
    )
  },
  {
    key: ActionKey.CHART_SORT_DOWN,
    label: (
      <Button size='small' type='link'>
        下移
      </Button>
    )
  },
  {
    key: ActionKey.CHART_SORT_TOP,
    label: (
      <Button size='small' type='link'>
        置顶
      </Button>
    )
  },
  {
    key: ActionKey.CHART_SORT_BOTTOM,
    label: (
      <Button size='small' type='link'>
        置底
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
  const { dashboardId, chart, handleEditModal, refreshChart, updateChartSort } = props

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

  const { run: runBatchUpdateChartStatus } = useRequest(batchUpdateChartStatus, {
    manual: true,
    onSuccess: () => {
      message.success('修改状态成功')
      refreshChart()
    }
  })

  const { run: runDeleteChart } = useRequest(deleteChart, {
    manual: true,
    onSuccess: () => {
      message.success('删除图表成功')
      refreshChart()
    }
  })

  const onHandleMenuOnClick = (key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        runBatchUpdateChartStatus({
          dashboardId,
          ids: [chart.id],
          status: Status.StatusEnable
        })
        break
      case ActionKey.DISABLE:
        runBatchUpdateChartStatus({
          dashboardId,
          ids: [chart.id],
          status: Status.StatusDisable
        })
        break
      case ActionKey.EDIT:
        handleEditModal(chart)
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DELETE:
        runDeleteChart({ dashboardId, id: chart.id })
        break
      case ActionKey.CHART_SORT_UP:
        updateChartSort({ id: chart.id, sort: 'up' })
        break
      case ActionKey.CHART_SORT_DOWN:
        updateChartSort({ id: chart.id, sort: 'down' })
        break
      case ActionKey.CHART_SORT_TOP:
        updateChartSort({ id: chart.id, sort: 'top' })
        break
      case ActionKey.CHART_SORT_BOTTOM:
        updateChartSort({ id: chart.id, sort: 'bottom' })
        break
    }
  }

  return (
    <>
      <ModalChart chart={chart} open={chartModalOpen} onCancel={closeChartModal} title={chart.title} />
      <Card
        title={
          <div className='flex items-center gap-2'>
            <PanelBottomDashed size={16} />
            <Badge color={chart.status === Status.StatusEnable ? 'green' : 'red'} />
            <div>{chart.title}</div>
          </div>
        }
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
          <iframe src={chart.url} width='100%' height='100%' className='overflow-hidden' title={chart.title} />
        </div>
      </Card>
    </>
  )
}
