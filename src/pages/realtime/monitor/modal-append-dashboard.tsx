import type { DashboardItem, SelectItem } from '@/api/model-types'
import { listDashboardSelect, listMyDashboard, updateMyDashboard } from '@/api/realtime/dashboard'
import { DataFrom } from '@/components/data/form'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Form, Modal, type ModalProps } from 'antd'
import { useEffect, useState } from 'react'

export interface ModalAppendDashboardProps extends ModalProps {
  onOk: () => void
  onCancel: () => void
}

export default function ModalAppendDashboard(props: ModalAppendDashboardProps) {
  const { open, onOk, onCancel, ...rest } = props
  const [form] = Form.useForm()

  const [dashboardList, setDashboardList] = useState<SelectItem[]>([])
  const [myDashboardList, setMyDashboardList] = useState<DashboardItem[]>([])

  const { run: getMyDashboardList, loading: myDashboardLoading } = useRequest(listMyDashboard, {
    manual: true,
    onSuccess: (data) => {
      setMyDashboardList(data.list || [])
    }
  })

  const { run: getDashboardList, loading: dashboardLoading } = useRequest(listDashboardSelect, {
    manual: true,
    onSuccess: (data) => {
      setDashboardList(data.list || [])
    }
  })

  const { run: appendDashboard, loading: appendDashboardLoading } = useRequest(updateMyDashboard, {
    manual: true,
    onSuccess: () => {
      onOk()
    },
    onError: (err) => {
      handleFormError(form, err)
    }
  })

  const handleOk = () => {
    form.validateFields().then((values) => {
      appendDashboard({ ids: values.ids })
    })
  }
  const handleCancel = () => {
    onCancel()
  }

  useEffect(() => {
    form.setFieldsValue({
      ids: myDashboardList.map((item) => item.id)
    })
  }, [myDashboardList, form])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }
    getDashboardList({ pagination: { pageNum: 1, pageSize: 999 } })
    getMyDashboardList()
  }, [open, form, getDashboardList, getMyDashboardList])

  return (
    <Modal
      {...rest}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      onClose={handleCancel}
      loading={myDashboardLoading || dashboardLoading}
      confirmLoading={appendDashboardLoading}
    >
      <DataFrom
        items={[
          {
            label: '仪表板',
            name: 'ids',
            type: 'select',
            props: { mode: 'multiple', options: dashboardList, placeholder: '请选择仪表板', allowClear: true },
            formProps: { rules: [{ required: true, message: '请选择仪表板' }] }
          }
        ]}
        props={{ layout: 'vertical', form }}
      />
    </Modal>
  )
}
