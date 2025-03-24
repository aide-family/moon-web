import { Role } from '@/api/enum'
import { RoleData } from '@/api/global'
import type { UserItem } from '@/api/model-types'
import { type UpdateUserRoleRequest, updateUserRole } from '@/api/user'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Alert, Form, Modal, type ModalProps, Select } from 'antd'

interface ModalRoleSetProps extends ModalProps {
  detail?: UserItem
}

export const ModalRoleSet: React.FC<ModalRoleSetProps> = (props) => {
  const { detail = { role: Role.RoleAll, name: '', id: 0 }, onOk, ...rest } = props
  const [form] = Form.useForm<UpdateUserRoleRequest>()

  const { runAsync: setUserRole, loading: setUserRoleLoading } = useRequest(updateUserRole, {
    manual: true
  })

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    form.validateFields().then((values) => {
      setUserRole({ id: detail.id, role: +values.role })
        .then(() => {
          onOk?.(e)
        })
        .catch((err) => {
          handleFormError(form, err)
        })
    })
  }

  return (
    <Modal {...rest} onOk={onSubmit} confirmLoading={setUserRoleLoading}>
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
