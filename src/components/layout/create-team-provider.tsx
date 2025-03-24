import { Status } from '@/api/enum'
import type { ErrorResponse } from '@/api/request'
import { type CreateTeamRequest, createTeam } from '@/api/team'
import { handleFormError } from '@/utils'
import { GlobalContext } from '@/utils/context'
import { Form, Input, Modal, message } from 'antd'
import { createContext, useContext, useState } from 'react'

export type CreateTeamModalProps = {
  children: React.ReactNode
}

export type CreateTeamModalProviderState = {
  open?: boolean
  setOpen?: (open: boolean) => void
}

const initialState: CreateTeamModalProviderState = {
  open: false,
  setOpen: () => null
}

export const CreateTeamModalProviderContext = createContext<CreateTeamModalProviderState>(initialState)

export function CreateTeamModalProvider({ children }: CreateTeamModalProps) {
  const [open, setOpen] = useState(false)
  // const {
  //   Layout: { team }
  // } = useI18nConfig()
  const { setTeamInfo } = useContext(GlobalContext)
  const [loading, setLoading] = useState(false)

  const value = {
    open,
    setOpen
  }

  const [form] = Form.useForm()

  const handleCreateTean = () => {
    form.validateFields().then((value: CreateTeamRequest) => {
      setLoading(true)
      createTeam({ ...value, adminIds: [], status: Status.StatusEnable })
        .then(({ detail }) => {
          message.success(`${value.name}创建成功`)
          form.resetFields()
          detail && setTeamInfo?.(detail)
          setOpen(false)
          window.location.reload()
        })
        .catch((err: ErrorResponse) => {
          handleFormError(form, err)
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setOpen(false)
  }

  return (
    <CreateTeamModalProviderContext.Provider value={value}>
      <Modal title='创建团队' open={open} onOk={handleCreateTean} onCancel={handleCancel} confirmLoading={loading}>
        <Form form={form} layout='vertical'>
          <Form.Item label='团队名称' name='name' rules={[{ required: true, message: '团队名称不能为空' }]}>
            <Input placeholder='请输入团队名称' autoComplete='off' />
          </Form.Item>
          <Form.Item label='Logo' name='logo'>
            <Input placeholder='请输入团队Logo' autoComplete='off' />
          </Form.Item>
          <Form.Item label='团队描述' name='remark'>
            <Input.TextArea placeholder='请输入团队描述' autoComplete='off' showCount maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>

      {children}
    </CreateTeamModalProviderContext.Provider>
  )
}
