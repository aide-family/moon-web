import { Form, Input } from 'antd'

export function PublicKeySection() {
  return (
    <Form.Item label='加密密钥' name='publicKey' rules={[{ required: true, message: '请输入加密密钥' }]}>
      <Input.TextArea rows={4} placeholder='请输入加密密钥...' />
    </Form.Item>
  )
}
