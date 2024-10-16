import { inviteUser, InviteUserRequest } from '@/api/team/invite'
import { DataFrom } from '@/components/data/form'
import { Form, message, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import { inviteModalFormItems } from './options'

export interface InviteProps {
  open?: boolean
  setOpen?: (open: boolean) => void
}

export const Invite: React.FC<InviteProps> = (props) => {
  const { open, setOpen } = props

  const [form] = Form.useForm<InviteUserRequest>()
  const [loading, setLoading] = useState(false)

  const onSubmit = () => {
    form.validateFields().then((values) => {
      setLoading(true)
      inviteUser(values)
        .then(() => {
          message.info('邀请成功')
          setOpen?.(false)
        })
        .finally(() => setLoading(false))
    })
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open])

  return (
    <Modal
      open={open}
      onOk={onSubmit}
      onCancel={() => setOpen!(false)}
      title='邀请成员'
      width={800}
      confirmLoading={loading}
    >
      <DataFrom items={inviteModalFormItems} props={{ form, disabled: loading, layout: 'vertical' }} />
    </Modal>
  )
}
