import { Form, Input } from 'antd'

export function SymmetricEncryptionSection() {
  return (
    <>
      <Form.Item
        label='密钥'
        name={['symmetricEncryptionConfig', 'key']}
        rules={[{ required: true, message: '请输入密钥' }]}
      >
        <Input.TextArea rows={4} placeholder='请输入密钥...' />
      </Form.Item>
      <Form.Item
        label='向量'
        name={['symmetricEncryptionConfig', 'iv']}
        rules={[{ required: true, message: '请输入向量' }]}
      >
        <Input.TextArea rows={4} placeholder='请输入向量...' />
      </Form.Item>
    </>
  )
}
