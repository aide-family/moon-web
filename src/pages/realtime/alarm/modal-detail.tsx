import type { Condition, SustainType } from '@/api/enum'
import { AlertStatusData, ConditionData, SustainTypeData } from '@/api/global'
import type { RealtimeAlarmItem } from '@/api/model-types'
import { getAlarm } from '@/api/realtime/alarm'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Descriptions, type DescriptionsProps, Modal, type ModalProps, Table } from 'antd'
import type React from 'react'
import { useContext, useEffect, useState } from 'react'
import ReactJson from 'react-json-view'

export interface ModalDetailProps extends ModalProps {
  realtimeId?: number
}

export const ModalDetail: React.FC<ModalDetailProps> = (props) => {
  const { theme } = useContext(GlobalContext)
  const { realtimeId, open, ...reset } = props

  const [detail, setDetail] = useState<RealtimeAlarmItem>()

  const { run: initDetail, loading: initDetailLoading } = useRequest(getAlarm, {
    manual: true,
    onSuccess: (res) => {
      setDetail(res?.detail)
    }
  })

  useEffect(() => {
    if (!realtimeId || !open) return
    initDetail({ id: realtimeId })
  }, [realtimeId, open, initDetail])

  const items = (): DescriptionsProps['items'] => {
    if (!detail) return []
    const { status, startsAt, duration, summary, description, rawInfo, expr } = detail
    let rawInfoJson: Record<string, unknown> = {}
    try {
      rawInfoJson = JSON.parse(rawInfo || '{}')
    } catch (error) {
      console.error(error)
    }
    return [
      {
        key: 'status',
        label: '告警状态',
        children: (
          <>
            {AlertStatusData[status]} {duration}
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
        key: 'detail_level',
        label: '详情级别',
        children: (
          <Table
            style={{ width: '100%' }}
            size='small'
            columns={[
              {
                title: '告警等级',
                dataIndex: 'level',
                key: 'level',
                render(value) {
                  return value?.label || '-'
                }
              },
              {
                title: '判断条件',
                dataIndex: 'condition',
                key: 'condition',
                render(value: Condition) {
                  return ConditionData[value]
                }
              },
              { title: '阈值', dataIndex: 'threshold' },
              {
                title: '触发类型',
                dataIndex: 'sustainType',
                key: 'sustainType',
                render(value: SustainType) {
                  return SustainTypeData[value]
                }
              },
              { title: '持续时间(s)', dataIndex: 'duration' },
              { title: '持续次数', dataIndex: 'count' }
            ]}
            dataSource={[detail?.metricLevel]}
            pagination={false}
          />
        ),
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
            src={rawInfoJson}
            displayDataTypes={false}
            displayObjectSize={false}
            // shouldCollapse={() => true}
            enableClipboard={false}
            quotesOnKeys
            name={false}
            theme={theme === 'dark' ? 'railscasts' : 'bright:inverted'}
          />
        )
      }
    ]
  }
  return (
    <>
      <Modal {...reset} open={open} footer={null} loading={initDetailLoading}>
        <Descriptions title='告警详情' items={items()} layout='vertical' />
      </Modal>
    </>
  )
}
