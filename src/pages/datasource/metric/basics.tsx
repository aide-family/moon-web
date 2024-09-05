import { DatasourceItemType } from '@/api/datasource/types'
import { Status } from '@/api/global'
import { GlobalContext } from '@/utils/context'
import { RedoOutlined } from '@ant-design/icons'
import { Badge, Button, Descriptions, DescriptionsProps, Typography } from 'antd'
import React, { useContext } from 'react'
import ReactJson from 'react-json-view'

export interface BasicsProps {
  datasource?: DatasourceItemType
  refresh?: () => void
}

export const Basics: React.FC<BasicsProps> = (props) => {
  const { datasource, refresh } = props
  const { theme } = useContext(GlobalContext)

  const items: DescriptionsProps['items'] = [
    {
      label: '数据源名称',
      // span: 2,
      children: datasource?.name
    },
    {
      label: '状态',
      // span: 2,
      children: (
        <Badge
          status={datasource?.status === Status.ENABLE ? 'success' : 'error'}
          text={datasource?.status === Status.ENABLE ? '启用' : '禁用'}
        />
      )
    },
    {
      label: '创建者',
      // span: 2,
      children: `${datasource?.creator?.name || '-'}(${datasource?.creator?.nickname || '-'})`
    },
    {
      label: '创建时间',
      // span: 2,
      children: datasource?.createdAt
    },
    {
      label: '地址',
      // span: 2,
      children: datasource?.endpoint
    },
    {
      label: '更新时间',
      // span: 2,
      children: datasource?.updatedAt
    },
    {
      label: '配置明细',
      span: { xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 },
      children: (
        <>
          <ReactJson
            src={datasource?.config || {}}
            name={false}
            displayDataTypes={false}
            theme={theme === 'dark' ? 'bright' : 'bright:inverted'}
            iconStyle='square'
          />
        </>
      )
    },
    {
      label: '说明信息',
      span: { xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 },
      children: (
        <>
          <Typography.Text type='secondary'>{datasource?.remark}</Typography.Text>
        </>
      )
    }
  ]
  return (
    <div>
      <Descriptions
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button type='primary' onClick={refresh} icon={<RedoOutlined />} size='small' />
            <span>名称：{datasource?.name}</span>
          </div>
        }
        extra={
          <Button type='dashed' onClick={refresh}>
            编辑
          </Button>
        }
        bordered
        column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
        items={items}
      />
    </div>
  )
}
