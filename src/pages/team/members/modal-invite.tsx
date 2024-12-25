import { inviteUser, InviteUserRequest } from '@/api/team/invite'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, message, Modal } from 'antd'
import React, { useEffect } from 'react'
import { inviteModalFormItems } from './options'

export interface InviteProps {
  open?: boolean
  setOpen?: (open: boolean) => void
}

export const Invite: React.FC<InviteProps> = (props) => {
  const { open, setOpen } = props

  const [form] = Form.useForm<InviteUserRequest>()

  const { run: submitInvite, loading: inviteUserLoading } = useRequest(inviteUser, {
    manual: true,
    onSuccess: () => {
      message.info('邀请发送成功')
      setOpen?.(false)
    }
  })

  const onSubmit = () => {
    form.validateFields().then((values) => {
      submitInvite(values)
    })
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal
      open={open}
      onOk={onSubmit}
      onCancel={() => setOpen!(false)}
      title='邀请成员'
      width={800}
      confirmLoading={inviteUserLoading}
    >
      <DataFrom items={inviteModalFormItems} props={{ form, disabled: inviteUserLoading, layout: 'vertical' }} />
    </Modal>
  )
}
