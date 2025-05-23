import { StrategyType } from '@/api/enum'
import { AlertStatusData } from '@/api/global'
import { AlarmHistoryItem, getHistory } from '@/api/realtime/history'
import { StrategyLevelDetailDomain } from '@/pages/strategy/list/detail-modal-domain'
import { StrategyLevelDetailEvent } from '@/pages/strategy/list/detail-modal-event'
import { StrategyLevelDetailHttp } from '@/pages/strategy/list/detail-modal-http'
import { StrategyLevelDetailMetric } from '@/pages/strategy/list/detail-modal-metric'
import { StrategyLevelDetailPort } from '@/pages/strategy/list/detail-modal-port'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Descriptions, DescriptionsProps, Modal, ModalProps } from 'antd'
import { FC, useContext, useEffect, useState } from 'react'
import ReactJson from 'react-json-view'

export interface ModalDetailProps extends ModalProps {
  historyItem?: AlarmHistoryItem
}

const getStrategyLevelDetail = (detail: AlarmHistoryItem) => {
  switch (detail?.strategy?.strategyType) {
    case StrategyType.StrategyTypeMetric:
      return <StrategyLevelDetailMetric levels={detail?.metricLevel ? [detail?.metricLevel] : []} />
    case StrategyType.StrategyTypeDomainPort:
      return <StrategyLevelDetailPort levels={detail?.portLevel ? [detail?.portLevel] : []} />
    case StrategyType.StrategyTypeDomainCertificate:
      return <StrategyLevelDetailDomain levels={detail?.domainLevel ? [detail?.domainLevel] : []} />
    case StrategyType.StrategyTypeHTTP:
      return <StrategyLevelDetailHttp levels={detail?.httpLevel ? [detail?.httpLevel] : []} />
    case StrategyType.StrategyTypeEvent:
      return <StrategyLevelDetailEvent levels={detail?.eventLevel ? [detail?.eventLevel] : []} />
    default:
      return <div>-</div>
  }
}

const ModalDetail: FC<ModalDetailProps> = ({ historyItem, open, ...reset }) => {
  const { theme } = useContext(GlobalContext)
  const [detail, setDetail] = useState(historyItem)

  const { run: initHistoryDetail, loading } = useRequest(getHistory, {
    manual: true,
    onSuccess: (res) => {
      setDetail(res.alarmHistory)
    },
    onError: () => {
      setDetail(historyItem)
    }
  })

  useEffect(() => {
    if (historyItem && open) {
      initHistoryDetail({ id: historyItem.id })
    }
  }, [historyItem, initHistoryDetail, open])

  const items = (): DescriptionsProps['items'] => {
    if (!detail) return []
    const { alertStatus, startsAt, endsAt, duration, summary, description, rawInfo, expr } = detail
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
            {AlertStatusData[alertStatus]} {duration}
          </>
        ),
        span: 2
      },
      {
        key: 'startsAt',
        label: '告警时间',
        children: (
          <div className='flex justify-between items-center gap-2'>
            <div>{startsAt}</div>
            <div>~</div>
            <div>{endsAt}</div>
          </div>
        ),
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
        children: getStrategyLevelDetail(detail),
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
      <Modal {...reset} open={open} footer={null} loading={loading}>
        <Descriptions title='告警详情' items={items()} layout='vertical' />
      </Modal>
    </>
  )
}

export default ModalDetail
