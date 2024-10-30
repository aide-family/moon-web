import { Condition, SustainType } from '@/api/enum'
import { ConditionData, StatusData, SustainTypeData } from '@/api/global'
import { StrategyItem } from '@/api/model-types'
import { getStrategy } from '@/api/strategy'
import { Badge, Descriptions, DescriptionsProps, Modal, ModalProps, Table } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'

export interface DetailProps extends ModalProps {
  strategyId?: number
}

export const Detail: React.FC<DetailProps> = (props) => {
  const { strategyId, open, ...rest } = props
  const [detail, setDetail] = useState<StrategyItem>()
  const [loading, setLoading] = useState(false)

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
      step,
      alarmNoticeGroups,
      labels,
      annotations,
      levels
    } = detail
    return [
      { key: 'name', label: '策略名称', children: name },
      { key: 'group?.name', label: '所属告警组', children: group?.name || '-' },
      { key: 'status', label: '状态', children: <Badge {...StatusData[status]} /> },
      { key: 'step', label: '采样率', children: step },
      { key: 'datasource', label: '数据源', children: datasource.map((item) => item.name).join(',') },
      { key: 'categories', label: '策略类型', children: categories.map((item) => item.name).join(',') },
      {
        key: 'alarmNoticeGroups',
        label: '公共通知对象',
        children: alarmNoticeGroups.map((item) => item.name).join(','),
        span: 10
      },
      {
        key: 'labels',
        label: '自定义标签',
        children: Object.keys(labels)
          .map((key) => `${key}:${labels[key]}`)
          .join(', '),
        span: 10
      },
      {
        key: 'annotations',
        label: '注释',
        children: Object.keys(annotations)
          .map((key) => `${key}: ${annotations[key]}`)
          .join(', '),
        span: 10
      },
      { key: 'remark', label: '备注', children: remark || '-', span: 10 },
      { key: 'expr', label: '表达式', children: expr, span: 10 },
      {
        key: 'levels',
        label: '告警级别',
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
            dataSource={levels}
            pagination={false}
          />
        )
      }
    ]
  }

  return (
    <>
      <Modal {...rest} open={open} footer={null} loading={loading}>
        <Descriptions title='策略详情' items={items()} layout='vertical' />
      </Modal>
    </>
  )
}
