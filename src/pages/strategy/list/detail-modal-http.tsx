import { HTTPMethod } from '@/api/enum'
import { ConditionData, HTTPMethodData, StatusCodeConditionData, StatusData } from '@/api/global'
import type { SelectItem, StrategyHTTPLevelItem, StrategyItem } from '@/api/model-types'
import { getStrategy } from '@/api/strategy'
import { useRequest } from 'ahooks'
import { Badge, Descriptions, type DescriptionsProps, Modal, type ModalProps, Space, Table, Tag } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'

export interface StrategyLevelDetailHttpProps {
  levels: StrategyHTTPLevelItem[]
}

export const StrategyLevelDetailHttp: React.FC<StrategyLevelDetailHttpProps> = (props) => {
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
          title: '请求方式',
          dataIndex: 'method',
          key: 'method',
          render(value: HTTPMethod) {
            return HTTPMethodData[value]
          }
        },
        {
          title: '状态码',
          dataIndex: 'statusCode',
          render(statusCode, record: StrategyHTTPLevelItem) {
            const { statusCodeCondition } = record
            return (
              <div className='flex items-center gap-2'>
                {StatusCodeConditionData[statusCodeCondition]} {statusCode}
              </div>
            )
          }
        },
        {
          title: '响应时间(ms)',
          dataIndex: 'responseTime',
          render(value, record) {
            const { responseTimeCondition } = record
            return (
              <div className='flex items-center gap-2'>
                {ConditionData[responseTimeCondition]} {value}
              </div>
            )
          }
        }
      ]}
      dataSource={levels}
      pagination={false}
    />
  )
}

export interface StrategyDetailHttpProps extends ModalProps {
  strategyId?: number
}

export const StrategyDetailHttp: React.FC<StrategyDetailHttpProps> = (props) => {
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
      httpLevels: levels
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
      { key: 'expr', label: '请求地址', children: expr, span: 12 },
      {
        key: 'levels',
        label: '告警级别',
        span: 12,
        children: <StrategyLevelDetailHttp levels={levels} />
      }
    ]
  }

  return (
    <Modal {...rest} open={open} loading={detailLoading} footer={null}>
      <Descriptions
        className='max-h-[70vh] overflow-y-auto overflow-x-hidden'
        items={items()}
        layout='vertical'
        size='default'
        bordered
        column={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}
      />
    </Modal>
  )
}
