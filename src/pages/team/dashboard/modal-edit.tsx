import { Status } from '@/api/enum'
import type { DashboardItem } from '@/api/model-types'
import { createDashboard, getDashboard, updateDashboard } from '@/api/realtime/dashboard'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps, message } from 'antd'
import type React from 'react'
import { useEffect, useState } from 'react'
import { type CreateDashobardFormType, editModalFormItems } from './options'

export interface GroupEditModalProps extends ModalProps {
  groupId?: number
  disabled?: boolean
  onOk?: () => void
}

export const GroupEditModal: React.FC<GroupEditModalProps> = (props) => {
  const { onCancel, open, title, groupId, disabled, onOk } = props
  const [form] = Form.useForm<CreateDashobardFormType>()
  const [grounpDetail, setGroupDetail] = useState<DashboardItem>()

  const { run: getGroupDetail, loading } = useRequest(getDashboard, {
    manual: true,
    onSuccess: (res) => {
      setGroupDetail(res.detail)
    }
  })

  useEffect(() => {
    if (!groupId) {
      setGroupDetail(undefined)
      return
    }
    getGroupDetail({ id: groupId })
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

  const { run: addDashboard, loading: addDashboardLoading } = useRequest(createDashboard, {
    manual: true,
    onSuccess: () => {
      message.success('新建成功')
      onOk?.()
    }
  })

  const { run: editDashboard, loading: editDashboardLoading } = useRequest(updateDashboard, {
    manual: true,
    onSuccess: () => {
      message.success('编辑成功')
      onOk?.()
    }
  })

  const handleOnOk = () => {
    form?.validateFields().then((formValues) => {
      const params = {
        ...formValues,
        color: getCssClass(formValues),
        status: Status.StatusEnable
      }
      if (groupId) {
        editDashboard({ dashboard: params, id: groupId })
      } else {
        addDashboard(params)
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
        loading={loading}
        confirmLoading={addDashboardLoading || editDashboardLoading}
      >
        <DataFrom
          items={editModalFormItems('hex')}
          props={{ form, layout: 'vertical', autoComplete: 'off', disabled: disabled || loading }}
        />
      </Modal>
    </>
  )
}
