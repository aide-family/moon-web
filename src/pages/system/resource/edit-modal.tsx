import type { ResourceItem } from '@/api/model-types'
import { getResource } from '@/api/resource'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'
import { editModalFormItems } from './options'

export interface ResourceEditModalProps extends ModalProps {
  resourceId?: number
  disabled?: boolean
}

export const ResourceEditModal: React.FC<ResourceEditModalProps> = (props) => {
  const { onCancel, open, title, resourceId, disabled } = props
  const [form] = Form.useForm()
  const [resourceDetail, setResourceDetail] = useState<ResourceItem>()

  const { run: initResourceDetail, loading: initResourceDetailLoading } = useRequest(getResource, {
    manual: true,
    onSuccess: (data) => {
      setResourceDetail(data.detail)
    }
  })

  useEffect(() => {
    if (resourceId && open) {
      initResourceDetail({ id: resourceId })
    }
  }, [resourceId, open, initResourceDetail])

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
        confirmLoading={initResourceDetailLoading}
      >
        <DataFrom
          items={editModalFormItems}
          props={{
            form,
            layout: 'vertical',
            autoComplete: 'off',
            disabled: disabled || initResourceDetailLoading
          }}
        />
      </Modal>
    </>
  )
}
