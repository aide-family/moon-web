import { type CreateTemplateRequest, createTemplate, getTemplate, updateTemplate } from '@/api/notify/template'
import { DataFrom } from '@/components/data/form'
import { useRequest } from 'ahooks'
import { Form, Input, Modal, type ModalProps } from 'antd'
import { useEffect, useState } from 'react'
import { editModalFormItems } from './options'

export interface EditSendTemplateModalProps extends ModalProps {
  sendTemplateId?: number
  onOk?: () => void
  onCancel?: () => void
}

export function EditSendTemplateModal(props: EditSendTemplateModalProps) {
  const { open, sendTemplateId, onOk, onCancel, ...rest } = props

  const [form] = Form.useForm<CreateTemplateRequest>()

  const sendType = Form.useWatch('sendType', form)

  const [contentBox, setContentBox] = useState<React.ReactNode | null>(null)

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

  const handleOnCancel = () => {
    form.resetFields()
    onCancel?.()
  }

  useEffect(() => {
    if (sendTemplateId && open) {
      initSendTemplateDetail(sendTemplateId)
    }
  }, [sendTemplateId, open, initSendTemplateDetail])

  useEffect(() => {
    switch (sendType) {
      // case AlarmSendType.AlarmSendTypeFeiShu:
      //   setContentBox(<FeishuTemplateEditor height={400} />)
      //   break
      // case AlarmSendType.AlarmSendTypeDingTalk:
      //   setContentBox(<DingTemplateEditor height={400} />)
      //   break
      // case AlarmSendType.AlarmSendTypeEmail:
      //   setContentBox(<EmailTemplateEditor height={400} />)
      //   break
      // case AlarmSendType.AlarmSendTypeWeChat:
      //   setContentBox(<WechatTemplateEditor height={400} />)
      //   break
      default:
        setContentBox(<Input.TextArea rows={4} placeholder='请输入模板内容' />)
    }
  }, [sendType])

  return (
    <>
      <Modal
        {...rest}
        title={`${sendTemplateId ? '编辑' : '新增'}通知模板`}
        open={open}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
        loading={initSendTemplateDetailLoading}
        confirmLoading={addSendTemplateLoading || updateSendTemplateLoading}
      >
        <DataFrom items={editModalFormItems} props={{ form, layout: 'vertical' }} slot={{ content: contentBox }} />
      </Modal>
    </>
  )
}
