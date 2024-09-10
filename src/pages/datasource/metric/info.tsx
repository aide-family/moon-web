import { DatasourceItem } from '@/api/model-types'
import { Alert } from 'antd'
import React from 'react'

export interface InfoProps {
  datasource?: DatasourceItem
}

export const Info: React.FC<InfoProps> = (props) => {
  const { datasource } = props
  return (
    <>
      <Alert
        banner
        message={`数据源：${datasource?.name} ${datasource?.remark || ''} ${datasource?.id}`}
        type='info'
        showIcon
      />
    </>
  )
}
