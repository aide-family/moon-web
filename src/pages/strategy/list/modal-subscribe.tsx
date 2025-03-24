import { NotifyType } from '@/api/enum'
import { StrategyItem } from '@/api/model-types'
import { userSubscriberStrategy } from '@/api/subscriber'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Checkbox, Form, Modal, ModalProps, Typography } from 'antd'
import { useEffect } from 'react'

export interface ModalSubscribeProps extends ModalProps {
  onOk?: () => void
  item?: StrategyItem
}

const { Text } = Typography

export const ModalSubscribe = (props: ModalSubscribeProps) => {
  const { open, onClose, onOk, item, ...reset } = props

  const [form] = Form.useForm<{ notifyTypes: NotifyType[] }>()

  const { runAsync: subscribeStrategy, loading } = useRequest(userSubscriberStrategy, {
    manual: true
  })

  const handleSubmit = () => {
    if (!item || !item.id) return
    form.validateFields().then((values) => {
      subscribeStrategy({
        strategyId: item?.id,
        notifyType: values.notifyTypes.reduce((prev, curr) => prev | curr, 0)
      })
        .then(() => {
          form.resetFields()
          onOk?.()
        })
        .catch((err) => {
          handleFormError(form, err)
        })
    })
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal open={open} onCancel={onClose} onOk={handleSubmit} {...reset} confirmLoading={loading}>
      <Form form={form} layout='vertical'>
        <Form.Item label='通知类型' name='notifyTypes'>
          <Checkbox.Group
            options={[
              { label: '手机', value: NotifyType.NOTIFY_PHONE, disabled: true },
              { label: '邮件', value: NotifyType.NOTIFY_EMAIL },
              { label: '短信', value: NotifyType.NOTIFY_SMS, disabled: true }
            ]}
          />
        </Form.Item>
      </Form>
      <div className='mt-4 text-sm text-gray-500 flex flex-col gap-2'>
        <label>备注</label>
        <Text type='secondary'>{item?.annotations?.summary}</Text>
      </div>
    </Modal>
  )
}
