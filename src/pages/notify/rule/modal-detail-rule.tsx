import { TimeEngineRuleType } from '@/api/enum'
import { StatusData, TimeEngineRuleTypeData } from '@/api/global'
import { TimeEngineRuleItem } from '@/api/model-types'
import { getTimeEngineRule } from '@/api/notify/rule'
import { Avatar, Badge, Descriptions, DescriptionsProps, Modal, Space, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

export interface RuleDetailModalProps {
  ruleId: number
  open?: boolean
  onCancel?: () => void
  onOk?: () => void
}

let timer: NodeJS.Timeout | null = null
export function RuleDetailModal(props: RuleDetailModalProps) {
  const { ruleId, open, onCancel, onOk } = props

  const [detail, setDetail] = useState<TimeEngineRuleItem>()
  const getRuleDetail = () => {
    if (!ruleId) {
      return
    }
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      getTimeEngineRule(ruleId).then((res) => {
        setDetail(res.detail)
      })
    }, 400)
  }

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
      children: detail?.rules,
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
      getRuleDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleId, open])

  return (
    <>
      <Modal width='50%' centered open={open} onOk={onOk} onCancel={onCancel} footer={null}>
        <Descriptions title='通知规则信息' bordered items={items} />
      </Modal>
    </>
  )
}
