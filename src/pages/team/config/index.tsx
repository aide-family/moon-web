import { KeyOutlined, MailOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, message, Row } from 'antd'
import { EmailConfigSection } from './config-email'
import { PublicKeySection } from './config-public-key'

export interface TeamConfigFormData {
  email: {
    user: string
    pass: string
    host: string
    port: string
  }
  publicKey: string
}

export default function TeamConfig() {
  const [form] = Form.useForm<TeamConfigFormData>()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      console.log(values)
      message.success('配置保存成功')
    } catch (error) {
      message.error('请检查表单填写是否完整')
    }
  }

  return (
    <Form className='p-3 gap-3 flex flex-col' form={form} layout='vertical' onFinish={handleSubmit}>
      <Card
        bordered={false}
        title={
          <>
            <MailOutlined /> 团队配置
          </>
        }
        extra={
          <Button type='primary' htmlType='submit' icon={<SaveOutlined />}>
            保存配置
          </Button>
        }
        className='shadow-md overflow-auto'
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card
              type='inner'
              title={
                <div className='flex items-center gap-2'>
                  <MailOutlined /> 邮箱配置
                </div>
              }
              className='mb-4'
            >
              <EmailConfigSection />
            </Card>
          </Col>
          <Col span={12}>
            <Card
              type='inner'
              title={
                <div className='flex items-center gap-2'>
                  <KeyOutlined /> 加密密钥
                </div>
              }
              className='mb-4'
            >
              <PublicKeySection />
            </Card>
          </Col>
        </Row>
      </Card>
    </Form>
  )
}
