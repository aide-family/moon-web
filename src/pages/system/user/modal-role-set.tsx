import { Role } from '@/api/enum'
import { RoleData } from '@/api/global'
import { UserItem } from '@/api/model-types'
import { updateUserRole, UpdateUserRoleRequest } from '@/api/user'
import { Alert, Form, Modal, ModalProps, Select } from 'antd'

interface ModalRoleSetProps extends ModalProps {
  detail?: UserItem
}

export const ModalRoleSet: React.FC<ModalRoleSetProps> = (props) => {
  const { detail = { role: Role.RoleAll, name: '', id: 0 }, onOk, ...rest } = props
  const [form] = Form.useForm<UpdateUserRoleRequest>()

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    form.validateFields().then((values) => {
      updateUserRole({ id: detail.id, role: +values.role }).then(() => {
        onOk?.(e)
      })
    })
  }

  return (
    <Modal {...rest} onOk={onSubmit}>
      <div className='flex flex-col gap-3'>
        <Alert message={`${detail.name} 当前角色为 ${RoleData[detail.role]}`} type='info' showIcon />
        <Form form={form} layout='vertical' initialValues={{ role: detail.role }}>
          <Form.Item label='角色' name='role' rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              options={Object.entries(RoleData)
                .filter(([key]) => +key !== Role.RoleAll)
                .map(([key, value]) => ({ label: value, value: +key }))}
              placeholder='请选择角色'
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
