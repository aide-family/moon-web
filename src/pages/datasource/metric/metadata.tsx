import { getMetricList, syncMetric } from '@/api/datasource/metric'
import { DatasourceItemType, MetricItemType, MetricListRequest } from '@/api/datasource/types'
import { MetricTypeData } from '@/api/global'
import { DataInput } from '@/components/data/child/data-input'
import { Button, Flex, Form, Input, Space, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useEffect } from 'react'
import { Info } from './info'
import { Label } from './label'

export interface MetadataProps {
  datasource?: DatasourceItemType
}

let searchTimer: NodeJS.Timeout | null = null
export const Metadata: React.FC<MetadataProps> = (props) => {
  const { datasource } = props
  const [form] = Form.useForm()
  const [searchMetricParams, setSearchMetricParams] = React.useState<MetricListRequest>({
    pagination: {
      pageNum: 1,
      pageSize: 20
    },
    datasourceId: datasource?.id
  })
  const [metricListTotal, setMetricListTotal] = React.useState(0)
  const [refresh, setRefresh] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [metricDetail, setMetricDetail] = React.useState<MetricItemType>()
  const [openMetricLabelModal, setOpenMetricLabelModal] = React.useState(false)

  const handleRefresh = () => {
    setRefresh(!refresh)
  }

  const handleLabel = (record: MetricItemType) => {
    setMetricDetail(record)
    setOpenMetricLabelModal(true)
  }

  const hendleEditMetric = (record: MetricItemType) => {
    setMetricDetail(record)
  }

  const hanleLabelModalOnCancel = () => {
    setOpenMetricLabelModal(false)
    setMetricDetail(undefined)
  }

  const handleLabelModalOnOK = () => {
    setOpenMetricLabelModal(false)
    setMetricDetail(undefined)
  }

  const [metricList, setMetricList] = React.useState<MetricItemType[]>([])
  const columns: ColumnsType<MetricItemType> = [
    {
      title: '指标类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      fixed: 'left',
      render: (_, record) => {
        const { text, color } = MetricTypeData[record.type] || { text: '未知' }
        return (
          <>
            <Tag color={color} style={{ width: '100%' }} className='center'>
              {text}
            </Tag>
          </>
        )
      }
    },
    {
      title: '指标名称',
      dataIndex: 'name',
      key: 'name',
      // width: 200,
      render(value) {
        return <a>{value}</a>
      }
    },
    {
      title: '指标描述',
      dataIndex: 'help',
      key: 'help',
      ellipsis: {
        showTitle: true
      }
    },
    {
      title: '标签数量',
      dataIndex: 'labelCount',
      key: 'labelCount',
      width: 120,
      align: 'center',
      render: (_, record) => {
        return <>{record?.labelCount || '-'}</>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size='small'>
          <Button type='link' size='small' onClick={() => handleLabel(record)}>
            标签
          </Button>
          <Button type='link' size='small' onClick={() => hendleEditMetric(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ]

  const fectMetricList = () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    searchTimer = setTimeout(() => {
      setLoading(true)
      getMetricList(searchMetricParams)
        .then((reply) => {
          const {
            list,
            pagination: { total }
          } = reply

          if (!list || !total) return
          setMetricList(list)
          setMetricListTotal(total || 0)
        })
        .finally(() => {
          setLoading(false)
        })
    }, 500)
  }

  const fetchSyncMetric = () => {
    if (!datasource?.id) return
    syncMetric(datasource?.id).then(handleRefresh)
  }

  useEffect(() => {
    if (!datasource?.id) return
    setSearchMetricParams((prev) => {
      return {
        ...prev,
        datasourceId: datasource?.id
      }
    })
  }, [datasource])

  useEffect(() => {
    fectMetricList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMetricParams, refresh])

  return (
    <div className='metadata'>
      <Label
        metricDetail={metricDetail}
        open={openMetricLabelModal}
        onCancel={hanleLabelModalOnCancel}
        onOk={handleLabelModalOnOK}
      />
      <Info datasource={datasource} />
      <Flex justify='space-between' align='center' gap={12} className='op'>
        <Space size='middle'>
          <Button type='primary' onClick={fetchSyncMetric}>
            同步数据
          </Button>
          <Button type='primary' onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
        </Space>
        <Form
          form={form}
          layout='inline'
          onChange={() => {
            form.validateFields().then((values) => {
              setSearchMetricParams((prev) => {
                return {
                  ...prev,
                  ...values
                }
              })
            })
          }}
        >
          <Form.Item name='metricType' initialValue={0}>
            <DataInput
              type='radio-group'
              props={{
                options: Object.entries(MetricTypeData).map((item) => {
                  return {
                    label: <div style={{ color: item[1].color, width: '100%' }}>{item[1].text}</div>,
                    value: +item[0]
                  }
                }),
                optionType: 'button'
              }}
            />
          </Form.Item>
          <Form.Item name='keyword'>
            <Input.Search
              className='search'
              placeholder='请输入'
              allowClear
              onSearch={(value) => {
                setSearchMetricParams((prev) => {
                  return {
                    ...prev,
                    keyword: value
                  }
                })
              }}
              enterButton
            />
          </Form.Item>
        </Form>
      </Flex>
      <Table
        rowKey={(record) => record.id}
        loading={loading}
        size='small'
        dataSource={metricList}
        columns={columns}
        scroll={{
          y: 500,
          x: 1500
        }}
        pagination={{
          total: metricListTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: [20, 50, 100],
          defaultPageSize: 20,
          onChange: (page, pageSize) => {
            setSearchMetricParams((prev) => {
              return {
                ...prev,
                pagination: {
                  pageNum: page,
                  pageSize: pageSize
                }
              }
            })
          }
        }}
      />
    </div>
  )
}
