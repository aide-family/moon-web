import type { RealtimeAlarmItem } from '@/api/model-types'
import { getAlarm } from '@/api/realtime/alarm'
import { MetricsChart } from '@/components/chart/metrics-charts'
import { metricQueryRange } from '@/components/chart/query-range'
import type { MetricsResponse } from '@/types/metrics'
import { GlobalContext } from '@/utils/context'
import { transformMetricsData } from '@/utils/metricsTransform'
import { AreaChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { Button, Empty, Modal, type ModalProps, message } from 'antd'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

export interface RealtimeChartProps extends ModalProps {
  alarmID?: number
}
export default function RealtimeChart(props: RealtimeChartProps) {
  const { alarmID, open, ...rest } = props
  const { teamInfo } = useContext(GlobalContext)
  const [metricsData, setMetricsData] = useState<MetricsResponse>()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<RealtimeAlarmItem>()
  const [showArea, setShowArea] = useState(true)
  const transformedData = useMemo(
    () => transformMetricsData(metricsData?.data || { result: [], resultType: '' }),
    [metricsData]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(async (id: number) => {
      //   if (!realtimeId) return
      setLoading(true)
      getAlarm({ id })
        .then(({ detail }) => {
          setDetail(detail)
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  useEffect(() => {
    if (!detail) return
    let datasourceID = 0
    try {
      const rowInfo = JSON.parse(detail.rawInfo || '{}')
      datasourceID = rowInfo?.labels?.__moon__datasource_id__
    } catch (error) {
      console.error(error)
    }
    metricQueryRange(detail?.expr || '', {
      teamID: teamInfo?.id || 0,
      datasourceID: Number(datasourceID),
      start: dayjs(detail.startsAt),
      end: dayjs(detail.endsAt),
      step: 600
    })
      .then((res) => {
        setMetricsData(res)
      })
      .catch((err) => {
        message.error(err?.message || '获取数据失败')
      })
  }, [detail, teamInfo])

  useEffect(() => {
    if (!alarmID || !open) return
    fetchData(alarmID)
  }, [alarmID, open, fetchData])

  return (
    <Modal
      {...rest}
      closable={false}
      title={
        <div className='flex items-center justify-between'>
          事件图表
          <Button type='default' onClick={() => setShowArea(!showArea)}>
            {showArea ? <AreaChartOutlined /> : <LineChartOutlined />}
          </Button>
        </div>
      }
      loading={loading}
      open={open}
      footer={
        <Button type='primary' onClick={rest.onCancel}>
          取消
        </Button>
      }
      width={'70%'}
    >
      <div className='tab-content'>
        {transformedData && transformedData?.length > 0 ? (
          <MetricsChart
            data={transformedData}
            showArea={showArea}
            thresholds={[
              {
                value: detail?.metricLevel?.threshold || 0,
                label: { text: detail?.metricLevel?.level?.label || '' },
                color: detail?.metricLevel?.level?.extend?.color || ''
              }
            ]}
          />
        ) : (
          <Empty />
        )}
      </div>
    </Modal>
  )
}
