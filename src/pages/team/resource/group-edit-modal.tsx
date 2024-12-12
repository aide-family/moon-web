import { ResourceItem } from '@/api/model-types'
import { getResource } from '@/api/resource'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import React, { useEffect, useState } from 'react'
import { editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, open, title, groupId, disabled } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [grounpDetail, setGroupDetail] = useState<ResourceItem>()

  const getGroupDetail = async () => {
    if (groupId) {
      setLoading(true)
      getResource({ id: groupId })
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
        confirmLoading={loading}
      >
        <DataFrom
          items={editModalFormItems}
          props={{ form, layout: 'vertical', autoComplete: 'off', disabled: disabled || loading }}
        />
      </Modal>
    </>
  )
}
