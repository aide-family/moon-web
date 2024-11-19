import { ServerItem } from '@/api/model-types'
import { getHouyiServer } from '@/api/realtime/server'
import { Button, Card, Col, Row, Spin } from 'antd'
import React, { useEffect, useState } from 'react'

const HouyiServer: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [serverList, setServerList] = React.useState<ServerItem[]>([])

  useEffect(() => {
    getHouyiServerList()
    const interval = setInterval(() => {
      getHouyiServerList()
    }, 10000)
    return () => clearInterval(interval)
  }, [])
  const getHouyiServerList = () => {
    setLoading(true)
    getHouyiServer({ type: 'houyi' })
      .then((res) => {
        setServerList(res.list)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }
  return (
    <>
      <div>
        <Row justify='start' align='middle'>
          <Col span={2}>
            <h2>houyi服务</h2>
          </Col>
          <Col span={2}>
            {' '}
            <Button color='default' variant='filled' onClick={getHouyiServerList}>
              刷新
            </Button>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Row gutter={16}>
            {serverList.map((item) => (
              <Col span={8}>
                <Card title={'版本：' + item.version} bordered={true} style={{ marginBottom: 20 }}>
                  <p>名称：{item.server.name}</p>
                  {item.server.network == 'http' || item.server.network == 'https' ? (
                    <p>http地址：{item.server.httpEndpoint}</p>
                  ) : (
                    <p>grpc地址：{item.server.grpcEndpoint}</p>
                  )}
                  <p>服务类型：{item.server.network}</p>
                  <p>工作时长：{item.server.upTime}</p>
                  <p>上线时间：{item.server.startTime}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </>
  )
}

export default HouyiServer
