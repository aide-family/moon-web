import { ResourceItem, TeamRole } from '@/api/model-types'
import { listResource, ListResourceRequest } from '@/api/resource'
import { CreateRoleRequest, getRole } from '@/api/team/role'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import FormItem from 'antd/es/form/FormItem'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { editModalFormItems } from './options'
import PermissionTree from './permission-tree'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  submit?: (data: CreateRoleRequest & { id?: number }) => Promise<void>
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, submit, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateRoleRequest>()
  const [loading, setLoading] = useState(false)
  const [grounpDetail, setGroupDetail] = useState<TeamRole>()
  const [resourceList, setResourceList] = useState<ResourceItem[]>([])

  const getGroupDetail = async () => {
    if (groupId) {
      setLoading(true)
      getRole({ id: groupId })
        .then(({ detail }) => {
          setGroupDetail(detail)
        })
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    if (!groupId) {
      setGroupDetail(undefined)
    }
    getGroupDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  useEffect(() => {
    if (open && form && grounpDetail) {
      form?.setFieldsValue({ ...grounpDetail, permissions: grounpDetail?.resources?.map((item) => item.id) || [] })
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
      setLoading(true)
      submit?.({
        ...formValues,
        id: groupId
      })
        .then(() => {
          form?.resetFields()
          setGroupDetail(undefined)
          setResourceList([])
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(async (params: ListResourceRequest) => {
      listResource(params).then(({ list }) => {
        setResourceList(list || [])
      })
    }, 500),
    []
  )

  useEffect(() => {
    if (!open) return
    fetchData({ pagination: { pageNum: 1, pageSize: 999 } })
  }, [fetchData, open])

  return (
    <>
      <Modal {...props} title={title} open={open} onCancel={handleOnCancel} onOk={handleOnOk} confirmLoading={loading}>
        <DataFrom
          items={editModalFormItems}
          props={{ form, layout: 'vertical', autoComplete: 'off', disabled: disabled || loading }}
        >
          <FormItem label='权限列表' name='permissions'>
            <PermissionTree items={resourceList} disabled={disabled} />
          </FormItem>
        </DataFrom>
      </Modal>
    </>
  )
}
