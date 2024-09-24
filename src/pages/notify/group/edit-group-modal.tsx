import { AlarmNoticeGroupItem } from '@/api/model-types'
import { CreateAlarmGroupRequest, getAlarmGroup } from '@/api/notify/alarm-group'
import { Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'

export interface EditGroupModalProps {
  groupId?: number
  onCancel?: () => void
  onOk?: () => void
  open?: boolean
}

let timer: NodeJS.Timeout | null = null
export const EditGroupModal = (props: EditGroupModalProps) => {
  const { groupId, onCancel, onOk, open } = props

  const [form] = Form.useForm<CreateAlarmGroupRequest>()
  const [detail, setDetail] = useState<AlarmNoticeGroupItem>()

  const getAlarmGroupDetail = () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      getAlarmGroup({ id: groupId! }).then((res) => {
        setDetail(res.detail)
      })
    }, 200)
  }

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        name: detail.name,
        remark: detail.remark
      })
    } else {
      form.resetFields()
    }
  }, [detail])

  useEffect(() => {
    if (groupId) {
      getAlarmGroupDetail()
    }
  }, [groupId])

  return (
    <>
      <Modal title={`${groupId ? '编辑' : '新增'}告警组`} open={open} onOk={onOk} onCancel={onCancel}>
        <Form form={form} layout='vertical' autoComplete='off'>
          <Form.Item label='名称' name='name' rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder='请输入名称' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
