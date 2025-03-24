import { listAlarmPage, updateAlarmPage } from '@/api/realtime/alarm_page_self'
import { DataFrom } from '@/components/data/form'
import { handleFormError } from '@/utils'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Form, Modal } from 'antd'
import type React from 'react'
import { useContext, useEffect } from 'react'
import { addPagesFormItems } from './options'

export interface ModalAddPagesProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export const ModalAddPages: React.FC<ModalAddPagesProps> = (props) => {
  const { open, onClose, onSubmit } = props
  const [form] = Form.useForm()

  const { teamInfo } = useContext(GlobalContext)

  const { run: initListAlarmPage, loading: initListAlarmPageLoading } = useRequest(listAlarmPage, {
    manual: true,
    onSuccess: (res) => {
      form.setFieldsValue({ alarmPageIds: res?.list?.map((item) => item.id) })
    }
  })

  const { run: editAlarmPage, loading: editAlarmPageLoading } = useRequest(updateAlarmPage, {
    manual: true,
    onSuccess: onSubmit,
    onError: (err) => {
      handleFormError(form, err)
    }
  })

  const handleSubmit = () => {
    form.validateFields().then((val) => {
      editAlarmPage({ alarmPageIds: val.alarmPageIds })
    })
  }

  useEffect(() => {
    if (!open || !teamInfo?.id) return
    initListAlarmPage({})
  }, [open, initListAlarmPage, teamInfo])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      title='添加页面'
      loading={initListAlarmPageLoading}
      confirmLoading={editAlarmPageLoading}
    >
      <DataFrom items={addPagesFormItems} props={{ form, layout: 'vertical' }} />
    </Modal>
  )
}
