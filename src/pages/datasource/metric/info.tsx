import { StorageType } from '@/api/enum'
import { DatasourceItem } from '@/api/model-types'
import { Prometheus, VictoriaMetrics } from '@/components/icon'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Alert, Typography } from 'antd'
import React from 'react'

export interface InfoProps {
  datasource?: DatasourceItem
}

const { Text } = Typography

const InfoIcon = (props: { datasource?: DatasourceItem; className?: string }) => {
  const { datasource, className } = props
  switch (datasource?.storageType) {
    case StorageType.StorageTypePrometheus:
      return <Prometheus className={className} />
    case StorageType.StorageTypeVictoriaMetrics:
      return <VictoriaMetrics className={className} />
    default:
      return <InfoCircleOutlined className={className} />
  }
}

const InfoContent = (props: { datasource?: DatasourceItem }) => {
  const { datasource } = props
  return (
    <div className='flex gap-1 items-center'>
      <b>{datasource?.name}</b>
      <Text ellipsis>{datasource?.remark}</Text>
    </div>
  )
}

export const Info: React.FC<InfoProps> = (props) => {
  const { datasource } = props

  return (
    <>
      <Alert
        banner
        message={<InfoContent datasource={datasource} />}
        type='info'
        showIcon
        icon={<InfoIcon datasource={datasource} className='w-4 h-4' />}
      />
    </>
  )
}
