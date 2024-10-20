import { HookApp } from '@/api/enum'
import { HookAppData } from '@/api/global'
import { AlarmHookItem } from '@/api/model-types'
import { createHook, getHook, updateHook } from '@/api/notify/hook'
import { Avatar, Form, Input, Modal, Select, Space } from 'antd'
import { useEffect, useState } from 'react'

export interface EditHookModalProps {
  open?: boolean
  hookId?: number
  onOk?: (hook: AlarmHookItem) => void
  onCancel?: () => void
}

let timer: NodeJS.Timeout | null = null
export function EditHookModal(props: EditHookModalProps) {
  const { open, hookId, onOk, onCancel } = props

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<AlarmHookItem>()

  const handleOnOk = () => {
    form.validateFields().then((values) => {
      setLoading(true)
      if (hookId) {
        updateHook({ id: hookId, update: values })
          .then(() => {
            form.resetFields()
            onOk?.(values)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        createHook(values)
          .then(() => {
            form.resetFields()
            onOk?.(values)
          })
          .finally(() => {
            setLoading(false)
          })
      }
    })
  }

  const handleOnCancel = () => {
    onCancel?.()
  }

  const handleGetHookDetail = () => {
    if (!hookId) {
      return
    }
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      getHook({ id: hookId }).then((res) => {
        setDetail(res.detail)
      })
    }, 200)
  }

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        name: detail.name,
        hookApp: detail.hookApp,
        url: detail.url,
        secret: detail.secret,
        remark: detail.remark
      })
    } else {
      form.resetFields()
    }
  }, [detail])

  useEffect(() => {
    if (hookId && open) {
      handleGetHookDetail()
    }
  }, [hookId, open])

  return (
    <>
      <Modal
        title={`${hookId ? '编辑' : '新增'}告警Hook`}
        open={open}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
        loading={loading}
      >
        <Form form={form} layout='vertical' autoComplete='off'>
          <Form.Item label='名称' name='name' rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder='请输入名称' />
          </Form.Item>
          <Form.Item label='类型' name='hookApp' rules={[{ required: true, message: '请选择类型' }]}>
            <Select
              placeholder='请选择类型'
              options={Object.entries(HookAppData)
                .filter(([key]) => +key !== HookApp.HOOK_APP_UNKNOWN)
                .map(([key, value]) => {
                  const { icon, label } = value
                  return {
                    value: +key,
                    label: (
                      <Space direction='horizontal'>
                        <Avatar size='small' shape='square' icon={icon} />
                        {label}
                      </Space>
                    )
                  }
                })}
            />
          </Form.Item>
          <Form.Item
            label='URL'
            name='url'
            rules={[
              { required: true, message: '请输入URL' },
              { type: 'url', message: '请输入正确的URL' }
            ]}
          >
            <Input placeholder='请输入URL' />
          </Form.Item>
          <Form.Item label='密钥' name='secret'>
            <Input placeholder='请输入密钥' />
          </Form.Item>
          <Form.Item label='备注' name='remark'>
            <Input.TextArea placeholder='请输入备注' showCount maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
