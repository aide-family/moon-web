import { StrategyItem } from '@/api/model-types'
import { getStrategy } from '@/api/strategy'
import { Descriptions, Modal, ModalProps } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'

export interface StrategyDetailHttpProps extends ModalProps {
  strategyId?: number
}

export const StrategyDetailHttp: React.FC<StrategyDetailHttpProps> = (props) => {
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

  return (
    <Modal {...rest} open={open} title='HTTP监控策略详情' loading={loading}>
      <Descriptions title='HTTP监控策略详情'>
        <Descriptions.Item label='策略名称'>{detail?.name}</Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}
