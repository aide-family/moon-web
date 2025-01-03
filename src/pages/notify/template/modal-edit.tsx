import { createTemplate, CreateTemplateRequest, getTemplate, updateTemplate } from '@/api/notify/template'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Modal, ModalProps } from 'antd'
import { useEffect } from 'react'
import { editModalFormItems } from './options'

export interface EditSendTemplateModalProps extends ModalProps {
  sendTemplateId?: number
  onOk?: () => void
  onClose?: () => void
}

export function EditSendTemplateModal(props: EditSendTemplateModalProps) {
  const { open, sendTemplateId, onOk, onClose, ...rest } = props

  const [form] = Form.useForm<CreateTemplateRequest>()

  const { run: initSendTemplateDetail, loading: initSendTemplateDetailLoading } = useRequest(getTemplate, {
    manual: true,
    onSuccess: (res) => {
      form?.setFieldsValue(res.detail)
    }
  })

  const { runAsync: addSendTemplate, loading: addSendTemplateLoading } = useRequest(createTemplate, {
    manual: true
  })

  const { runAsync: updateSendTemplate, loading: updateSendTemplateLoading } = useRequest(updateTemplate, {
    manual: true
  })

  const handleOnOk = () => {
    form.validateFields().then((values) => {
      Promise.all([
        sendTemplateId ? updateSendTemplate({ id: sendTemplateId, data: values }) : addSendTemplate(values)
      ]).then(() => {
        form.resetFields()
        onOk?.()
      })
    })
  }

  const handleOnClose = () => {
    onClose?.()
  }

  useEffect(() => {
    if (sendTemplateId && open) {
      initSendTemplateDetail(sendTemplateId)
    }
  }, [sendTemplateId, open, initSendTemplateDetail])

  return (
    <>
      <Modal
        {...rest}
        title={`${sendTemplateId ? '编辑' : '新增'}通知模板`}
        open={open}
        onOk={handleOnOk}
        onClose={handleOnClose}
        loading={initSendTemplateDetailLoading}
        confirmLoading={addSendTemplateLoading || updateSendTemplateLoading}
      >
        <DataFrom items={editModalFormItems} props={{ form, layout: 'vertical' }} />
      </Modal>
    </>
  )
}
