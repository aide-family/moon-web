import { Condition, SustainType } from '@/api/enum'
import { ConditionData, StatusData, SustainTypeData } from '@/api/global'
import type { SelectItem, StrategyItem, StrategyMetricLevelItem } from '@/api/model-types'
import { getStrategy } from '@/api/strategy'
import { useRequest } from 'ahooks'
import { Badge, Descriptions, type DescriptionsProps, Modal, type ModalProps, Space, Table, Tag } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'

export interface StrategyLevelDetailMetricProps {
  levels: StrategyMetricLevelItem[]
}

export const StrategyLevelDetailMetric: React.FC<StrategyLevelDetailMetricProps> = (props) => {
  const { levels } = props
  return (
    <Table
      className='w-full'
      size='small'
      rowKey={(recrd) => recrd?.level?.value}
      columns={[
        {
          title: '告警等级',
          dataIndex: 'level',
          key: 'level',
          render(value: SelectItem) {
            return <Tag color={value?.extend?.color}>{value?.label || '-'}</Tag>
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

export interface MetricDetailProps extends ModalProps {
  strategyId?: number
}

export const MetricDetail: React.FC<MetricDetailProps> = (props) => {
  const { strategyId, open, ...rest } = props
  const [detail, setDetail] = useState<StrategyItem>()

  const { run: initDetail, loading: detailLoading } = useRequest(getStrategy, {
    manual: true,
    onSuccess: (data) => {
      setDetail(data?.detail)
    }
  })

  useEffect(() => {
    if (!strategyId || !open) return
    initDetail({ id: strategyId })
  }, [strategyId, open, initDetail])

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
        children: <StrategyLevelDetailMetric levels={levels} />
      }
    ]
  }

  return (
    <>
      <Modal {...rest} open={open} footer={null} loading={detailLoading}>
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
