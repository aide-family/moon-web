import { Input, Tabs, TabsProps } from 'antd'
import React from 'react'

export interface TimelyQueryProps {
  datasource?: string
}

export const TimelyQuery: React.FC<TimelyQueryProps> = (props) => {
  const { datasource } = props
  const tabsItems: TabsProps['items'] = [
    {
      key: '1',
      label: `Table`,
      children: <div>table</div>,
    },
    {
      key: '2',
      label: `Graph`,
      children: <div>graph</div>,
    },
  ]
  const tabsOnChange = (key: string) => {
    console.log(key)
  }
  return (
    <div>
      <div>
        <Input placeholder='PromQL...' />
      </div>
      <Tabs defaultActiveKey='1' items={tabsItems} onChange={tabsOnChange} />
      TimelyQuery {datasource}
    </div>
  )
}
