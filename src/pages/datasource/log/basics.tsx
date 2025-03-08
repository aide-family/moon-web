/* eslint-disable prettier/prettier */
import { Status } from '@/api/enum'
import { DataSourceTypeData, StorageTypeData } from '@/api/global'
import type { DatasourceItem } from '@/api/model-types'
import { GlobalContext } from '@/utils/context'
import { RedoOutlined } from '@ant-design/icons'
import { theme as AntdTheme, Badge, Button, Descriptions, type DescriptionsProps, Space, Tag, Typography } from 'antd'
import type React from 'react'
import { useContext } from 'react'
import ReactJson from 'react-json-view'

export interface BasicsProps {
    datasource: DatasourceItem
    refresh?: () => void
    editDataSource?: (id: number) => void
}

const { useToken } = AntdTheme

export const Basics: React.FC<BasicsProps> = (props) => {
    const { datasource, refresh, editDataSource } = props
    const { theme } = useContext(GlobalContext)
    const { token } = useToken()

    const items: DescriptionsProps['items'] = [
        {
            label: '数据源名称',
            children: datasource?.name
        },
        {
            label: '状态',
            children: (
                <Badge
                    status={datasource?.status === Status.StatusEnable ? 'success' : 'error'}
                    text={datasource?.status === Status.StatusEnable ? '启用' : '禁用'}
                />
            )
        },
        {
            key: 'datasourceType',
            label: '数据源类型',
            children: (
                <div className='flex flex-row items-center gap-2'>
                    <Tag color='blue'>{DataSourceTypeData[datasource?.datasourceType]}</Tag>
                    <Tag color='pink'>{StorageTypeData[datasource?.storageType]}</Tag>
                </div>
            )
        },
        {
            label: '创建者',
            children: `${datasource?.creator?.name || '-'}(${datasource?.creator?.nickname || '-'})`
        },
        {
            label: '创建时间',
            children: datasource?.createdAt
        },
        {
            label: '更新时间',
            children: datasource?.updatedAt
        },
        {
            label: '地址',
            span: { xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 },
            children: (
                <Space size={[8, 16]} wrap className='w-full'>
                    {datasource?.endpoint.split(',').map((item) => (
                        <Tag color={token.colorPrimary} key={item}>
                            {item}
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            label: '配置明细',
            span: { xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 },
            children: (
                <>
                    <ReactJson
                        src={JSON.parse(datasource?.config || '{}')}
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
                    <Button type='dashed' onClick={() => editDataSource?.(datasource?.id)}>
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
