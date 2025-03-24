import { getTopics, GetTopicsRequest } from '@/api/datasource/mq'
import { defaultPaginationReq } from '@/api/global'
import { TopicItem } from '@/api/model-types'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Button, Flex, Form, Input, message, Space, Table, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useContext, useEffect, useRef, useState } from 'react'
import ReactJson from 'react-json-view'

export interface TopicsProps {
  datasourceID?: number
}

const { Paragraph } = Typography

export default function Topics(props: TopicsProps) {
  const { datasourceID = 0 } = props

  const { isFullscreen, theme } = useContext(GlobalContext)

  const [topics, setTopics] = useState<TopicItem[]>([])
  const [total, setTotal] = useState(0)
  const [refresh, setRefresh] = useState(false)
  const [searchParams, setSearchParams] = useState<GetTopicsRequest>({
    datasourceID,
    pagination: defaultPaginationReq
  })

  const [form] = Form.useForm()

  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, topics, isFullscreen)

  const refreshTopics = () => {
    setRefresh(!refresh)
  }

  const syncTopics = () => {
    message.warning('同步数据功能还在开发中, 敬请期待')
  }

  const handleEditTopic = (record: TopicItem) => {
    message.warning(`编辑主题功能还在开发中, 敬请期待, 当前主题ID: ${record.id}`)
  }

  const columns: ColumnsType<TopicItem> = [
    {
      title: '主题名称',
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (name: string) => {
        return <Paragraph copyable>{name}</Paragraph>
      }
    },
    {
      title: '配置',
      dataIndex: 'config',
      key: 'config',
      width: 400,
      render: (_, record) => {
        return (
          <ReactJson
            src={record.config}
            name={false}
            displayDataTypes={false}
            collapsed
            theme={theme === 'dark' ? 'bright' : 'bright:inverted'}
            iconStyle='square'
          />
        )
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: {
        showTitle: true
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
          <Button type='link' size='small' onClick={() => handleEditTopic(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ]

  const { run: fetchTopics, loading } = useRequest((params: GetTopicsRequest) => getTopics(params), {
    manual: true, // 手动触发请求
    onSuccess: (res) => {
      setTopics(res.list)
      setTotal(res?.pagination?.total || 0)
    }
  })

  useEffect(() => {
    if (datasourceID) {
      fetchTopics(searchParams)
    }
  }, [datasourceID, refresh, searchParams, fetchTopics])

  return (
    <div className='flex flex-col gap-3'>
      <Flex justify='space-between' align='center' gap={12} className='gap-3'>
        <Space size='middle'>
          <Button type='primary' onClick={syncTopics}>
            同步数据
          </Button>
          <Button color='default' variant='filled' onClick={refreshTopics} loading={loading}>
            刷新
          </Button>
        </Space>
        <Form
          form={form}
          layout='inline'
          autoComplete='off'
          onChange={() => {
            form.validateFields().then((values) => {
              setSearchParams((prev) => {
                return { ...prev, ...values }
              })
            })
          }}
        >
          <Form.Item name='keyword'>
            <Input.Search
              placeholder='请输入主题名称'
              allowClear
              onSearch={(value) => {
                setSearchParams((prev) => {
                  return {
                    ...prev,
                    keyword: value,
                    pagination: { pageNum: 1, pageSize: 20 }
                  }
                })
              }}
              enterButton
            />
          </Form.Item>
        </Form>
      </Flex>
      <div ref={ADivRef}>
        <Table
          rowKey={(record) => record.id}
          loading={loading}
          size='small'
          dataSource={topics}
          columns={columns}
          scroll={{
            y: `calc(100vh - 170px  - ${AutoTableHeight}px)`,
            x: 1000
          }}
          pagination={{
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: [20, 50, 100],
            defaultPageSize: 20,
            onChange: (page, pageSize) => {
              setSearchParams((prev) => {
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
    </div>
  )
}
