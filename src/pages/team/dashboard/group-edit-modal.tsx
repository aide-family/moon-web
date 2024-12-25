import type { DashboardItem } from '@/api/model-types'
import { type CreateDashboardRequest, getDashboard } from '@/api/realtime/dashboard'
import { DataFrom } from '@/components/data/form'
import { Form, Modal, type ModalProps } from 'antd'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { type CreateDashobardFormType, editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  submit?: (data: CreateDashboardRequest & { id?: number }) => Promise<void>
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, submit, open, title, groupId, disabled } = props
  const [form] = Form.useForm<CreateDashobardFormType>()
  const [loading, setLoading] = useState(false)
  const [grounpDetail, setGroupDetail] = useState<DashboardItem>()

  const getGroupDetail = useCallback(() => {
    if (groupId) {
      setLoading(true)
      getDashboard({ id: groupId })
        .then(({ detail }) => {
          setGroupDetail(detail)
        })
        .finally(() => setLoading(false))
    }
  }, [groupId])

  useEffect(() => {
    if (!groupId) {
      setGroupDetail(undefined)
    }
    getGroupDetail()
  }, [groupId, getGroupDetail])

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

  const getCssClass = (formValues: CreateDashobardFormType): string => {
    const cssClass = formValues.color
    if (typeof cssClass === 'string') {
      return cssClass
    }
    return cssClass.toHexString()
  }

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      setLoading(true)
      submit?.({
        ...formValues,
        color: getCssClass(formValues),
        id: groupId
      })
        .then(() => {
          form?.resetFields()
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  return (
    <>
      <Modal {...props} title={title} open={open} onCancel={handleOnCancel} onOk={handleOnOk} confirmLoading={loading}>
        <DataFrom
          items={editModalFormItems('hex')}
          props={{
            form,
            layout: 'vertical',
            autoComplete: 'off',
            disabled: disabled || loading
          }}
        />
      </Modal>
    </>
  )
}
