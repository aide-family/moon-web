import { Button, Flex, Input } from 'antd'
import React from 'react'

export interface MetadataProps {
  datasource?: string
}

export const Metadata: React.FC<MetadataProps> = (props) => {
  const { datasource } = props

  return (
    <div className='metadata'>
      <Flex justify='space-between' align='center' gap={12} className='op'>
        <Button type='primary'>同步数据</Button>
        <Input.Search
          className='search'
          placeholder='请输入'
          onSearch={(value) => console.log(value)}
          enterButton
        />
      </Flex>
      Metadata {datasource}
    </div>
  )
}
