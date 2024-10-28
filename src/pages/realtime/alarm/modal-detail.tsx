import { AlertStatusData } from '@/api/global'
import { RealtimeAlarmItem } from '@/api/model-types'
import { getAlarm } from '@/api/realtime/alarm'
import { Descriptions, DescriptionsProps, Modal, ModalProps } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import ReactJson from 'react-json-view'

export interface ModalDetailProps extends ModalProps {
  realtimeId?: number
}

export const ModalDetail: React.FC<ModalDetailProps> = (props) => {
  const { realtimeId, open, ...reset } = props

  const [detail, setDetail] = useState<RealtimeAlarmItem>()
  const [loading, setLoading] = useState(false)

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
    if (!realtimeId || !open) return
    fetchData(realtimeId)
  }, [realtimeId, open])

  const items = (): DescriptionsProps['items'] => {
    if (!detail) return []
    const { status, startsAt, duration, summary, description, rawInfo, expr } = detail
    return [
      {
        key: 'status',
        label: '告警状态',
        children: (
          <>
            {AlertStatusData[status!]} {duration}
          </>
        ),
        span: 2
      },
      {
        key: 'startsAt',
        label: '告警时间',
        children: startsAt,
        span: 2
      },
      {
        key: 'summary',
        label: '摘要',
        children: summary,
        span: 6
      },
      {
        key: 'description',
        label: '明细',
        children: description,
        span: 6
      },
      {
        key: 'expr',
        label: '查询表达式',
        children: expr,
        span: 6
      },
      {
        key: 'rawInfo',
        label: '原始信息',
        span: 6,
        children: (
          <ReactJson
            style={{
              maxHeight: '300px',
              overflow: 'auto',
              width: '100%'
            }}
            src={JSON.parse(rawInfo)}
            displayDataTypes={false}
            displayObjectSize={false}
            shouldCollapse={() => true}
            enableClipboard={false}
            quotesOnKeys
            name={false}
          />
        )
      }
    ]
  }
  return (
    <>
      <Modal {...reset} open={open} footer={null} loading={loading}>
        <Descriptions title='告警详情' items={items()} layout='vertical' />
      </Modal>
    </>
  )
}
