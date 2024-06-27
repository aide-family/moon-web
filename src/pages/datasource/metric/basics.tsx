import { DatasourceItemType } from '@/api/datasource'
import { Status } from '@/api/global'
import { RedoOutlined } from '@ant-design/icons'
import {
  Badge,
  Button,
  Descriptions,
  DescriptionsProps,
  Typography,
} from 'antd'
import React from 'react'
import ReactJson from 'react-json-view'

export interface BasicsProps {
  datasource?: DatasourceItemType
  refresh?: () => void
}

export const Basics: React.FC<BasicsProps> = (props) => {
  const { datasource, refresh } = props

  const items: DescriptionsProps['items'] = [
    {
      label: '数据源名称',
      span: 2,
      children: datasource?.name,
    },
    {
      label: '状态',
      span: 2,
      children: (
        <Badge
          status={datasource?.status === Status.ENABLE ? 'success' : 'error'}
          text={datasource?.status === Status.ENABLE ? '启用' : '禁用'}
        />
      ),
    },
    {
      label: '创建者',
      span: 2,
      // span: { xl: 2, xxl: 2 },
      children: datasource?.creator?.name,
    },
    {
      label: '创建时间',
      span: 2,
      // span: { xl: 2, xxl: 2 },
      children: datasource?.createdAt,
    },
    {
      label: '地址',
      span: 2,
      children: '$60.00',
    },
    {
      label: '更新时间',
      span: 2,
      // span: { xl: 2, xxl: 2 },
      children: datasource?.updatedAt,
    },
    {
      label: '配置明细',
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
      children: (
        <>
          <ReactJson
            src={datasource?.config || {}}
            name={false}
            displayDataTypes={false}
            iconStyle='square'
          />
        </>
      ),
    },
    {
      label: '说明信息',
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 },
      children: (
        <>
          <Typography.Text type='secondary'>
            {datasource?.remark}
          </Typography.Text>
        </>
      ),
    },
  ]
  return (
    <div>
      <Descriptions
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type='primary'
              onClick={refresh}
              icon={<RedoOutlined />}
              size='small'
            />
            <span>名称：{datasource?.name}</span>
          </div>
        }
        bordered
        column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        items={items}
      />
    </div>
  )
}
