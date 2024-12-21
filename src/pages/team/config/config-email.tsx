import { Form, Input, Select } from 'antd'

export function EmailConfigSection() {
  return (
    <>
      <Form.Item
        label='邮箱账号'
        name={['email', 'username']}
        rules={[{ type: 'email', message: '请输入邮箱账号', required: true }]}
      >
        <Input placeholder='example@domain.com' />
      </Form.Item>

      <Form.Item label='邮箱密码' name={['email', 'password']} rules={[{ required: true, message: '请输入邮箱密码' }]}>
        <Input placeholder='请输入邮箱密码' />
      </Form.Item>

      <Form.Item
        label='SMTP服务器'
        name={['email', 'host']}
        rules={[
          {
            required: true,
            message: '请输入SMTP服务器地址',
            type: 'regexp',
            pattern: /^([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$|^(\d{1,3}\.){3}\d{1,3}$/
          }
        ]}
      >
        <Select
          mode='tags'
          options={[
            { label: '网易(smtp.163.com)', value: 'smtp.163.com' },
            { label: '网易(smtp.126.com)', value: 'smtp.126.com' },
            { label: '移动(smtp.139.com)', value: 'smtp.139.com' },
            { label: '电信(smtp.189.com)', value: 'smtp.189.com' },
            { label: 'QQ(smtp.qq.com)', value: 'smtp.qq.com' }
          ]}
          maxTagCount={1}
          maxCount={1}
          placeholder='请选择SMTP服务器, 也可以输入自定义SMTP服务器'
        />
      </Form.Item>

      <Form.Item label='端口' name={['email', 'port']} rules={[{ required: true, message: '请输入端口号' }]}>
        <Select
          mode='tags'
          options={[
            { label: '网易(25)', value: 25 },
            { label: '网易(465)', value: 465 },
            { label: '网易(587)', value: 587 }
          ]}
          maxCount={1}
          placeholder='请选择端口号'
        />
      </Form.Item>
    </>
  )
}
