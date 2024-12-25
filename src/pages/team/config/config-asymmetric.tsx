import { Form, Input } from 'antd'

export function AsymmetricEncryptionSection() {
  return (
    <>
      <Form.Item
        label='公钥'
        name={['asymmetricEncryptionConfig', 'publicKey']}
        rules={[{ required: true, message: '请输入公钥' }]}
      >
        <Input.TextArea rows={4} placeholder='请输入公钥...' />
      </Form.Item>
      <Form.Item
        label='私钥'
        name={['asymmetricEncryptionConfig', 'privateKey']}
        rules={[{ required: true, message: '请输入私钥' }]}
      >
        <Input.TextArea rows={4} placeholder='请输入私钥...' />
      </Form.Item>
    </>
  )
}
