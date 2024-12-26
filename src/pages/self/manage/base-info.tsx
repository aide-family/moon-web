import type { UserItem } from '@/api/model-types'
import { type UpdateUserBaseInfoRequest, updateUserBaseInfo } from '@/api/user'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Button, Form, Space, message } from 'antd'
import type React from 'react'
import { useCallback, useEffect } from 'react'
import { baseInfoOptions } from './options'

export interface BaseInfoProps {
  userInfo: UserItem
  onOK: () => void
}

export const BaseInfo: React.FC<BaseInfoProps> = (props) => {
  const { userInfo, onOK } = props
  const [form] = Form.useForm()

  const { run: editSelfInfo, loading } = useRequest(updateUserBaseInfo, {
    manual: true,
    onSuccess: () => {
      message.success('修改成功')
      onOK()
    }
  })

  const updateSelfInfo = (values: UpdateUserBaseInfoRequest) => {
    editSelfInfo(values)
  }

  const initSelfInfo = useCallback(() => {
    if (userInfo) {
      form.setFieldsValue(userInfo)
    }
  }, [userInfo, form])

  useEffect(() => {
    initSelfInfo()
  }, [initSelfInfo])

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
            <Button type='primary' htmlType='submit' loading={loading}>
              保存
            </Button>
          </Form.Item>
        </Space>
      </DataFrom>
    </div>
  )
}
