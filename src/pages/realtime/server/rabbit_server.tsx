import type { ServerItem } from '@/api/model-types'
import { getRabbitServer } from '@/api/realtime/moon-server'
import { useRequest } from 'ahooks'
import { Button, Card, Col, Empty, Row, Spin } from 'antd'
import React, { useCallback, useEffect } from 'react'

const RabbitServer: React.FC = () => {
  const [serverList, setServerList] = React.useState<ServerItem[]>([])

  const { run: initRabbitServerList, loading: initRabbitServerListLoading } = useRequest(getRabbitServer, {
    manual: true,
    onSuccess: (res) => {
      setServerList(res.list)
    }
  })

  const getRabbitServerList = useCallback(() => {
    initRabbitServerList({ type: 'rabbit' })
  }, [initRabbitServerList])

  useEffect(() => {
    getRabbitServerList()
    const interval = setInterval(() => {
      getRabbitServerList()
    }, 10000)
    return () => clearInterval(interval)
  }, [getRabbitServerList])

  return (
    <>
      <div className='flex flex-col gap-3'>
        <Row justify='start' align='middle'>
          <Col span={2}>
            <span className='text-lg font-bold'>rabbit服务</span>
          </Col>
          <Col span={2}>
            <Button color='default' variant='filled' onClick={getRabbitServerList}>
              刷新
            </Button>
          </Col>
        </Row>
        <Spin spinning={initRabbitServerListLoading}>
          <Row gutter={16}>
            {serverList?.length > 0 ? (
              serverList.map((item, index) => (
                <Col span={8} key={`${item.server.name}-${item.version}-${index}`}>
                  <Card title={`版本：${item.version}`} bordered={true} style={{ marginBottom: 20 }}>
                    <p>名称: {item.server.name}</p>
                    {item.server.network.startsWith('http') ? (
                      <p>http地址: {item.server.httpEndpoint}</p>
                    ) : (
                      <p>grpc地址: {item.server.grpcEndpoint}</p>
                    )}
                    <p>服务类型: {item.server.network}</p>
                    <p>工作时长: {item.server.upTime}</p>
                    <p>上线时间: {item.server.startTime}</p>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={8}>
                <Card bordered={true} style={{ marginBottom: 20 }}>
                  <Empty description='暂无数据' />
                </Card>
              </Col>
            )}
          </Row>
        </Spin>
      </div>
    </>
  )
}

export default RabbitServer
