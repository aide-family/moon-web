import { TimeEngineRuleType } from '@/api/enum'
import { StatusData, TimeEngineRuleTypeData } from '@/api/global'
import { TimeEngineRuleItem } from '@/api/model-types'
import { getTimeEngineRule } from '@/api/notify/rule'
import { useRequest } from 'ahooks'
import { Avatar, Badge, Descriptions, DescriptionsProps, Modal, Space, Tag, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { dayOptions, hourOptions, monthOptions, weekOptions } from './options'

const RenderRule = (props: { rules: number[]; category?: TimeEngineRuleType }) => {
  const { rules, category } = props
  switch (category) {
    case TimeEngineRuleType.TimeEngineRuleTypeHourRange:
      return (
        <Space direction='horizontal' wrap>
          {rules.map((item, index) => {
            const hour = hourOptions.find((hour) => hour.value === item)
            return <Tag key={index}>{hour?.label}</Tag>
          })}
        </Space>
      )
    case TimeEngineRuleType.TimeEngineRuleTypeDaysOfWeek:
      return (
        <Space direction='horizontal' wrap>
          {rules.map((item, index) => {
            const week = weekOptions.find((week) => week.value === item)
            return <Tag key={index}>{week?.label}</Tag>
          })}
        </Space>
      )
    case TimeEngineRuleType.TimeEngineRuleTypeDaysOfMonth:
      return (
        <Space direction='horizontal' wrap>
          {rules.map((item, index) => {
            const day = dayOptions.find((day) => day.value === item)
            return <Tag key={index}>{day?.label}</Tag>
          })}
        </Space>
      )
    case TimeEngineRuleType.TimeEngineRuleTypeMonths:
      return (
        <Space direction='horizontal' wrap>
          {rules.map((item, index) => {
            const month = monthOptions.find((month) => month.value === item)
            return <Tag key={index}>{month?.label}</Tag>
          })}
        </Space>
      )
    default:
      return <div>未知</div>
  }
}

export interface RuleDetailModalProps {
  ruleId: number
  open?: boolean
  onCancel?: () => void
  onOk?: () => void
}

export function RuleDetailModal(props: RuleDetailModalProps) {
  const { ruleId, open, onCancel, onOk } = props

  const [detail, setDetail] = useState<TimeEngineRuleItem>()
  const { run: getRuleDetail } = useRequest((id: number) => getTimeEngineRule(id), {
    manual: true, // 手动触发请求
    onSuccess: (res) => {
      setDetail(res.detail)
    }
  })

  const items: DescriptionsProps['items'] = [
    {
      label: '名称',
      children: detail?.name,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '类型',
      children: (
        <Space direction='horizontal'>
          <Avatar
            size='small'
            shape='square'
            icon={TimeEngineRuleTypeData[detail?.category || TimeEngineRuleType.TimeEngineRuleTypeUnknown]?.icon}
          />
          {TimeEngineRuleTypeData[detail?.category || TimeEngineRuleType.TimeEngineRuleTypeUnknown].label}
        </Space>
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '状态',
      children: detail ? (
        <Badge color={StatusData[detail?.status].color} text={StatusData[detail?.status].text} />
      ) : (
        '-'
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '规则',
      children: <RenderRule rules={detail?.rules || []} category={detail?.category} />,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '创建人',
      children: (
        <Tooltip title={detail?.creator?.nickname || detail?.creator?.name}>
          <div className='flex items-center gap-2'>
            <Avatar src={detail?.creator?.avatar}>{detail?.creator?.nickname || detail?.creator?.name}</Avatar>
            {detail?.creator?.nickname || detail?.creator?.name}
          </div>
        </Tooltip>
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '备注',
      children: detail?.remark || '-',
      span: 3
    },

    {
      label: '创建时间',
      children: detail?.createdAt,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '更新时间',
      children: detail?.updatedAt,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    }
  ]

  useEffect(() => {
    if (ruleId && open) {
      getRuleDetail(ruleId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleId, open])

  return (
    <>
      <Modal width='50%' centered open={open} onOk={onOk} onCancel={onCancel} footer={null}>
        <Descriptions title='规则单元信息' bordered items={items} />
      </Modal>
    </>
  )
}
