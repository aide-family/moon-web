import React from 'react'
import { Form, Input, Modal } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'

export interface RejectFormValues {
  reason: string
}

interface RejectAuditModalProps {
  open: boolean
  form: ReturnType<typeof Form.useForm<RejectFormValues>>[0]
  onCancel: () => void
  onSubmit: () => void
}

const RejectAuditModal: React.FC<RejectAuditModalProps> = ({
  open,
  form,
  onCancel,
  onSubmit,
}) => {
  const { t } = useLocale()

  return (
    <Modal
      title={t('jadeTree.audit.rejectTitle')}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='reason'
          label={t('jadeTree.audit.rejectReason')}
          rules={[{ required: true, message: t('jadeTree.form.required') }]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t('jadeTree.audit.rejectReasonPlaceholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RejectAuditModal
