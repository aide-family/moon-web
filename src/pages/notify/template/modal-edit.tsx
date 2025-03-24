import { AlarmSendType } from '@/api/enum'
import { createTemplate, getTemplate, updateTemplate, type CreateTemplateRequest } from '@/api/notify/template'
import { ErrorResponse } from '@/api/request'
import { dingTalkTemplates } from '@/components/data/child/config/ding-talk'
import { feishuTemplates } from '@/components/data/child/config/feishu'
import { wechatTemplates } from '@/components/data/child/config/wechat'
import { DingTemplateEditor } from '@/components/data/child/template-editor-ding'
import { EmailTemplateEditor } from '@/components/data/child/template-editor-eamil'
import { FeishuTemplateEditor } from '@/components/data/child/template-editor-feishu'
import { JsonTemplateEditor } from '@/components/data/child/template-editor-json'
import { WechatTemplateEditor } from '@/components/data/child/template-editor-wechat'
import { DataFrom } from '@/components/data/form'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Form, Input, Modal, Select, type ModalProps } from 'antd'
import { useEffect } from 'react'
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
      Promise.all([sendTemplateId ? updateSendTemplate({ id: sendTemplateId, data: values }) : addSendTemplate(values)])
        .then(() => {
          form.resetFields()
          onOk?.()
        })
        .catch((err: ErrorResponse) => {
          handleFormError(form, err)
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
    if (!open) {
      form.resetFields()
    }
  }, [sendTemplateId, open, initSendTemplateDetail, form])

  const getCendTypeContent = (t: AlarmSendType) => {
    const height = '40vh'
    switch (t) {
      case AlarmSendType.AlarmSendTypeFeiShu:
        return <FeishuTemplateEditor height={height} />
      case AlarmSendType.AlarmSendTypeDingTalk:
        return <DingTemplateEditor height={height} />
      case AlarmSendType.AlarmSendTypeWeChat:
        return <WechatTemplateEditor height={height} />
      case AlarmSendType.AlarmSendTypeCustom:
        return <JsonTemplateEditor height={height} />
      case AlarmSendType.AlarmSendTypeEmail:
        return <EmailTemplateEditor height={height} />
      default:
        return <Input.TextArea rows={10} showCount placeholder='请输入模板内容' />
    }
  }

  const getTemplateType = (t: AlarmSendType) => {
    form.setFieldsValue({
      templateType: undefined
    })
    let options: { label: string; value: string }[] = []
    switch (t) {
      case AlarmSendType.AlarmSendTypeFeiShu:
        options = feishuTemplates.map((item): { label: string; value: string } => ({
          label: item.name,
          value: JSON.stringify(item.template, null, 2)
        }))
        break
      case AlarmSendType.AlarmSendTypeDingTalk:
        options = dingTalkTemplates.map((item): { label: string; value: string } => ({
          label: item.name,
          value: JSON.stringify(item.template, null, 2)
        }))
        break
      case AlarmSendType.AlarmSendTypeWeChat:
        options = wechatTemplates.map((item): { label: string; value: string } => ({
          label: item.name,
          value: JSON.stringify(item.template, null, 2)
        }))
        break
    }
    return (
      <Select
        placeholder='请选择模板类型'
        options={options}
        disabled={!options.length}
        onChange={(value) => form.setFieldsValue({ content: value })}
      />
    )
  }

  return (
    <>
      <Modal
        {...rest}
        forceRender
        centered
        title={`${sendTemplateId ? '编辑' : '新增'}通知模板`}
        open={open}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
        loading={initSendTemplateDetailLoading}
        confirmLoading={addSendTemplateLoading || updateSendTemplateLoading}
      >
        <DataFrom
          items={editModalFormItems}
          props={{
            form,
            layout: 'vertical'
          }}
          slot={{
            content: getCendTypeContent(sendType),
            templateType: getTemplateType(sendType)
          }}
        />
      </Modal>
    </>
  )
}
