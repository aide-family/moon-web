import { StrategyType } from '@/api/enum'
import { message, Modal, ModalProps, theme } from 'antd'
import { Activity, FileText, Gauge, Globe, Network, Radio, Zap } from 'lucide-react'
import { useState } from 'react'

export interface StrategyTypeModalProps extends ModalProps {
  onSubmit: (data: StrategyType) => void
}

type StrategyTypeGroup = {
  name: string
  icon: React.ReactNode
  strategies: { id: StrategyType; name: string; icon: React.ReactNode }[]
}

const strategyGroups: StrategyTypeGroup[] = [
  {
    name: '普通监控',
    icon: <Gauge className='h-5 w-5' />,
    strategies: [
      { id: StrategyType.StrategyTypeMetric, name: 'Metric', icon: <Activity /> },
      { id: StrategyType.StrategyTypeMQ, name: '事件', icon: <Zap className='h-5 w-5' /> }
    ]
  },
  {
    name: '探测监控',
    icon: <Radio className='h-5 w-5' />,
    strategies: [
      { id: StrategyType.StrategyTypeDomainCertificate, name: '证书', icon: <FileText /> },
      { id: StrategyType.StrategyTypePing, name: 'Ping', icon: <Network className='h-5 w-5' /> },
      { id: StrategyType.StrategyTypeHTTP, name: 'HTTP', icon: <Globe className='h-5 w-5' /> }
    ]
  }
]

export default function StrategyTypeModal(props: StrategyTypeModalProps) {
  const { onSubmit, ...restProps } = props
  const [selectedType, setSelectedType] = useState<StrategyType>(StrategyType.StrategyTypeUnknown)
  const { token } = theme.useToken()
  const handleSubmit = () => {
    if (selectedType === StrategyType.StrategyTypeUnknown) {
      message.error('请选择策略类型')
      return
    }
    onSubmit(selectedType)
  }

  return (
    <Modal {...restProps} onOk={handleSubmit} okText='确定' cancelText='取消'>
      <div className='space-y-6 p-4'>
        {strategyGroups.map((group) => (
          <div key={group.name} className='space-y-3'>
            <div className='flex items-center space-x-2 text-lg font-medium text-primary'>
              {group.icon}
              <span>{group.name}</span>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              {group.strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedType(strategy.id)}
                  className='flex items-center space-x-3 rounded-lg border-2 p-4 transition-all hover:bg-accent'
                  style={{
                    borderColor: selectedType === strategy.id ? token.colorPrimary : token.colorBorder,
                    backgroundColor: selectedType === strategy.id ? token.colorBorderBg : 'transparent',
                    color: selectedType === strategy.id ? token.colorPrimary : 'inherit'
                  }}
                >
                  <div
                    className='rounded-full p-2'
                    style={{ backgroundColor: selectedType === strategy.id ? token.colorBorderBg : 'transparent' }}
                  >
                    {strategy.icon}
                  </div>
                  <span className='text-sm font-medium'>{strategy.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
