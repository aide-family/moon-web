import { Condition, SustainType } from '@/api/enum'
import { ConditionData, StatusData, SustainTypeData } from '@/api/global'
import { StrategyItem } from '@/api/model-types'
import { getStrategy } from '@/api/strategy'
import { Badge, Descriptions, DescriptionsProps, Modal, ModalProps, Space, Table } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'

export interface MetricDetailProps extends ModalProps {
  strategyId?: number
}

export const MetricDetail: React.FC<MetricDetailProps> = (props) => {
  const { strategyId, open, ...rest } = props
  const [detail, setDetail] = useState<StrategyItem>()
  const [loading, setLoading] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(async (id: number) => {
      //   if (!realtimeId) return
      setLoading(true)
      getStrategy({ id })
        .then(({ detail }) => {
          setDetail(detail)
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  useEffect(() => {
    if (!strategyId || !open) return
    fetchData(strategyId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyId, open])

  const items = (): DescriptionsProps['items'] => {
    if (!detail) return []
    const {
      name,
      status,
      remark,
      expr,
      datasource,
      group,
      categories,
      alarmNoticeGroups,
      labels,
      annotations,
      metricLevels: levels
    } = detail

    return [
      { key: 'name', label: '策略名称', children: name },
      {
        key: 'group?.name',
        label: '所属告警组',
        children: group?.name || '-'
      },
      {
        key: 'status',
        label: '状态',
        children: <Badge {...StatusData[status]} />
      },
      {
        key: 'datasource',
        label: '数据源',
        children: datasource.map((item) => item.name).join(',') || '-'
      },
      {
        key: 'categories',
        label: '策略类型',
        children: categories.map((item) => item.name).join(',') || '-',
        span: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 }
      },
      {
        key: 'alarmNoticeGroups',
        label: '公共通知对象',
        children: alarmNoticeGroups.map((item) => item.name).join(',') || '-',
        span: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 }
      },
      {
        key: 'labels',
        label: '自定义标签',
        children:
          Object.keys(labels)
            .map((key) => `${key}:${labels[key]}`)
            .join(', ') || '-',
        span: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 }
      },
      {
        key: 'annotations',
        label: '注释',
        children: Object.keys(annotations).map((key) => (
          <Space className='w-full' key={key}>{`${key}: ${annotations[key]}`}</Space>
        )),
        span: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 }
      },
      { key: 'remark', label: '备注', children: remark || '-', span: 12 },
      { key: 'expr', label: '表达式', children: expr, span: 12 },
      {
        key: 'levels',
        label: '告警级别',
        span: 12,
        children: (
          <Table
            className='w-full'
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
            dataSource={levels}
            pagination={false}
          />
        )
      }
    ]
  }

  return (
    <>
      <Modal {...rest} open={open} footer={null} loading={loading} title='Metric 策略详情'>
        <Descriptions
          className='max-h-[70vh] overflow-y-auto overflow-x-hidden'
          items={items()}
          layout='vertical'
          size='default'
          bordered
          column={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}
        />
      </Modal>
    </>
  )
}
