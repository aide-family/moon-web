import { ResourceItem } from '@/api/model-types'
import { getResource } from '@/api/resource'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, ModalProps } from 'antd'
import React, { useEffect, useState } from 'react'
import { editModalFormItems } from './options'

export interface ResourceEditModalProps extends ModalProps {
  resourceId?: number
  disabled?: boolean
}

export const ResourceEditModal: React.FC<ResourceEditModalProps> = (props) => {
  const { onCancel, open, title, resourceId, disabled } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [resourceDetail, setResourceDetail] = useState<ResourceItem>()

  const getResourceDetail = async () => {
    if (resourceId) {
      setLoading(true)
      getResource({ id: resourceId }, true)
        .then(({ detail }) => {
          setResourceDetail(detail)
        })
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    if (!resourceId) {
      setResourceDetail(undefined)
    }
    getResourceDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId])

  useEffect(() => {
    if (open && form && resourceDetail) {
      form?.setFieldsValue(resourceDetail)
      return
    }
    form?.resetFields()
  }, [resourceDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form?.resetFields()
    setResourceDetail(undefined)
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
