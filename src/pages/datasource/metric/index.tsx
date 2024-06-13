import { Button, Input, Layout, Menu, Tabs, TabsProps, theme } from 'antd'
import React, { useEffect } from 'react'
import './index.scss'
import { Metadata } from './metadata'
import { TimelyQuery } from './timely-query'
import { AlarmTemplate } from './alarm-template'

export interface MetricProps {}

const { Sider, Content } = Layout
const { useToken } = theme

const defaultDatasource = Array.from({ length: 100 }, (_, i) => ({
  key: i,
  label: `数据源${i}`.repeat(4),
}))

const Metric: React.FC<MetricProps> = () => {
  const { token } = useToken()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [datasource, setDatasource] = React.useState<any[]>([])
  const [datasourceUrl, setDatasourceUrl] = React.useState<string>()
  const [activeKey, setActiveKey] = React.useState('1')
  const tabsItems: TabsProps['items'] = [
    {
      key: 'basics',
      label: '基本信息',
      children: (
        <div className='box' style={{ overflow: 'auto' }}>
          基本信息
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>{i}</div>
          ))}
        </div>
      ),
    },
    {
      key: 'metadata',
      label: '元数据',
      children: (
        <div className='box'>
          <Metadata datasource={datasourceUrl} />
        </div>
      ),
    },
    {
      key: 'realtime-query',
      label: '及时查询',
      children: (
        <div className='box'>
          <TimelyQuery datasource={datasourceUrl} />
        </div>
      ),
    },
    {
      key: 'alarm-template',
      label: '告警模板',
      children: (
        <div className='box'>
          <AlarmTemplate datasource={datasourceUrl} />
        </div>
      ),
    },
  ]

  const tabsOnChange = (activeKey: string) => {}

  const handleDatasourceChange = (key: string) => {
    setDatasourceUrl(key)
  }

  useEffect(() => {
    if (!datasource || !datasource.length) return
    setDatasourceUrl(datasource?.[0].key)
  }, [datasource])

  useEffect(() => {
    setDatasource(defaultDatasource)
  }, [])
  return (
    <Layout className='metricDatasourceBox'>
      <div className='sider' style={{ background: token.colorBgContainer }}>
        <Button type='primary' style={{ width: '100%' }}>
          新建数据源
        </Button>
        <Input.Search placeholder='数据源' />
        <Menu
          items={datasource}
          className='menu'
          onSelect={(k) => handleDatasourceChange(k.key)}
        />
      </div>
      <Layout>
        <Content
          className='content'
          style={{ background: token.colorBgContainer }}
        >
          <Tabs
            defaultActiveKey='1'
            items={tabsItems}
            onChange={tabsOnChange}
          />
        </Content>
      </Layout>
    </Layout>
  )
}

export default Metric
