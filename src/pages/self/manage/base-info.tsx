import { UserItem } from '@/api/model-types'
import { updateUserBaseInfo, UpdateUserBaseInfoRequest } from '@/api/user'
import { DataFrom } from '@/components/data/form'
import { Button, Form, message, Space } from 'antd'
import React, { useEffect } from 'react'
import { baseInfoOptions } from './options'

export interface BaseInfoProps {
  userInfo: UserItem
  onOK: () => void
}

export const BaseInfo: React.FC<BaseInfoProps> = (props) => {
  const { userInfo, onOK } = props
  const [form] = Form.useForm()
  const updateSelfInfo = (values: UpdateUserBaseInfoRequest) => {
    updateUserBaseInfo(values).then(() => {
      message.success('修改成功')
      onOK()
    })
  }
  const initSelfInfo = () => {
    form.setFieldsValue(userInfo)
  }
  useEffect(() => {
    initSelfInfo()
  }, [userInfo])
  return (
    <div>
      <DataFrom items={baseInfoOptions} props={{ layout: 'vertical', form, onFinish: updateSelfInfo }}>
        <Space size={8}>
          <Form.Item>
            <Button type='default' onClick={initSelfInfo}>
              重置
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              保存
            </Button>
          </Form.Item>
        </Space>
      </DataFrom>
    </div>
  )
}
