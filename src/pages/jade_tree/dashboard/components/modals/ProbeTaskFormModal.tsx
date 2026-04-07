import React from 'react'
import { Form, Input, InputNumber, Modal } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'

export interface ProbeTaskFormValues {
  type: string
  name?: string
  host?: string
  port?: string
  url?: string
  timeoutSeconds?: number
}

interface ProbeTaskFormModalProps {
  open: boolean
  isEditing: boolean
  form: ReturnType<typeof Form.useForm<ProbeTaskFormValues>>[0]
  onCancel: () => void
  onSubmit: () => void
}

const ProbeTaskFormModal: React.FC<ProbeTaskFormModalProps> = ({
  open,
  isEditing,
  form,
  onCancel,
  onSubmit,
}) => {
  const { t } = useLocale()

  return (
    <Modal
      title={isEditing ? t('jadeTree.probe.editTitle') : t('jadeTree.probe.createTitle')}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='type'
          label={t('table.search.type')}
          rules={[{ required: true, message: t('jadeTree.form.required') }]}
        >
          <Input placeholder={t('jadeTree.probe.typePlaceholder')} />
        </Form.Item>
        <Form.Item name='name' label={t('jadeTree.probe.name')}>
          <Input placeholder={t('jadeTree.probe.namePlaceholder')} />
        </Form.Item>
        <Form.Item name='host' label={t('jadeTree.probe.host')}>
          <Input placeholder={t('jadeTree.probe.hostPlaceholder')} />
        </Form.Item>
        <Form.Item name='port' label={t('jadeTree.probe.port')}>
          <Input placeholder={t('jadeTree.probe.portPlaceholder')} />
        </Form.Item>
        <Form.Item name='url' label={t('jadeTree.probe.url')}>
          <Input placeholder={t('jadeTree.probe.urlPlaceholder')} />
        </Form.Item>
        <Form.Item name='timeoutSeconds' label={t('jadeTree.probe.timeout')}>
          <InputNumber
            min={1}
            className='w-full'
            placeholder={t('jadeTree.probe.timeoutPlaceholder')}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProbeTaskFormModal
