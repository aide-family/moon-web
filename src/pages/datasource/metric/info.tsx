import { DatasourceItemType } from '@/api/datasource'
import { Alert } from 'antd'
import React from 'react'

export interface InfoProps {
  datasource?: DatasourceItemType
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
