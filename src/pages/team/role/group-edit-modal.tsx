import type { ResourceItem, TeamRole } from '@/api/model-types'
import { listResource } from '@/api/resource'
import { type CreateRoleRequest, createRole, getRole, updateRole } from '@/api/team/role'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps } from 'antd'
import FormItem from 'antd/es/form/FormItem'
import type React from 'react'
import { useEffect, useState } from 'react'
import { editModalFormItems } from './options'
import PermissionTree from './permission-tree'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  onOk?: () => void
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, onOk, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateRoleRequest>()
  const [grounpDetail, setGroupDetail] = useState<TeamRole>()
  const [resourceList, setResourceList] = useState<ResourceItem[]>([])

  const { run: initRoleDetail, loading: initRoleDetailLoading } = useRequest(getRole, {
    manual: true,
    onSuccess: (res) => {
      setGroupDetail(res.detail)
    }
  })

  const { run: initResourceList, loading: initResourceListLoading } = useRequest(listResource, {
    manual: true,
    onSuccess: (res) => {
      setResourceList(res.list || [])
    }
  })

  const { run: addRole, loading: addRoleLoading } = useRequest(createRole, {
    manual: true,
    onSuccess: () => {
      form?.resetFields()
      onOk?.()
    }
  })

  const { run: editRole, loading: editRoleLoading } = useRequest(updateRole, {
    manual: true,
    onSuccess: () => {
      form?.resetFields()
      onOk?.()
    }
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (groupId && open) {
      initRoleDetail({ id: groupId })
    }
    if (open) {
      initResourceList({ pagination: { pageNum: 1, pageSize: 999 } })
    }
  }, [open, groupId, initRoleDetail, initResourceList, disabled])

  useEffect(() => {
    if (open && form && grounpDetail) {
      form?.setFieldsValue({
        ...grounpDetail,
        permissions: grounpDetail?.resources?.map((item) => item.id) || []
      })
      return
    }
  }, [grounpDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form?.resetFields()
    setGroupDetail(undefined)
    setResourceList([])
  }

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      const data = {
        ...formValues,
        id: groupId
      }
      if (groupId) {
        editRole({ id: groupId, data: formValues })
      } else {
        addRole(data)
      }
    })
  }

  return (
    <>
      <Modal
        {...props}
        title={title}
        open={open}
        onCancel={handleOnCancel}
        onOk={handleOnOk}
        loading={initRoleDetailLoading || initResourceListLoading}
        confirmLoading={addRoleLoading || editRoleLoading}
      >
        <DataFrom
          items={editModalFormItems}
          props={{
            form,
            layout: 'vertical',
            autoComplete: 'off',
            disabled: disabled || addRoleLoading || editRoleLoading
          }}
        >
          <FormItem label='权限列表' name='permissions'>
            <PermissionTree items={resourceList} disabled={disabled} />
          </FormItem>
        </DataFrom>
      </Modal>
    </>
  )
}
