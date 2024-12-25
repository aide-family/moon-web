import type { ResourceItem } from '@/api/model-types'
import { getResource } from '@/api/resource'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'
import { editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, open, title, groupId, disabled } = props
  const [form] = Form.useForm()
  const [grounpDetail, setGroupDetail] = useState<ResourceItem>()

  const { run: initResourceDetail, loading: initResourceDetailLoading } = useRequest(getResource, {
    manual: true,
    onSuccess: (res) => {
      setGroupDetail(res.detail)
    }
  })

  useEffect(() => {
    if (groupId && open) {
      initResourceDetail({ id: groupId })
    }
  }, [open, groupId, initResourceDetail])

  useEffect(() => {
    if (open && form && grounpDetail) {
      form?.setFieldsValue(grounpDetail)
      return
    }
    form?.resetFields()
  }, [grounpDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form?.resetFields()
    setGroupDetail(undefined)
  }

  return (
    <>
      <Modal
        {...props}
        title={title}
        open={open}
        onCancel={handleOnCancel}
        onOk={handleOnCancel}
        loading={initResourceDetailLoading}
      >
        <DataFrom
          items={editModalFormItems}
          props={{
            form,
            layout: 'vertical',
            autoComplete: 'off',
            disabled: disabled
          }}
        />
      </Modal>
    </>
  )
}
