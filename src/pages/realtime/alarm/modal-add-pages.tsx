import { listAlarmPage, updateAlarmPage } from '@/api/realtime/alarm_page_self'
import { DataFrom } from '@/components/data/form'
import { GlobalContext } from '@/utils/context'
import { Form, Modal } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { addPagesFormItems } from './options'

export interface ModalAddPagesProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export const ModalAddPages: React.FC<ModalAddPagesProps> = (props) => {
  const { open, onClose, onSubmit } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { teamInfo } = useContext(GlobalContext)

  const handleSubmit = () => {
    form.validateFields().then((val) => {
      setLoading(true)
      updateAlarmPage({ alarmPageIds: val.alarmPageIds })
        .then(onSubmit)
        .finally(() => setLoading(false))
    })
  }

  const fetchMypageData = useCallback(
    debounce(async () => {
      if (!teamInfo || !teamInfo.id) return
      listAlarmPage({})
        .then(({ list }) => {
          form.setFieldsValue({ alarmPageIds: list?.map((item) => item.id) })
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  useEffect(() => {
    if (!open) return
    fetchMypageData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} onCancel={onClose} onOk={handleSubmit} title='添加页面' confirmLoading={loading}>
      <DataFrom items={addPagesFormItems} props={{ form, layout: 'vertical' }} />
    </Modal>
  )
}
