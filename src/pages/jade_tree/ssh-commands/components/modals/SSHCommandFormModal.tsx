import React from 'react'
import { Form, Input, Modal } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'

export interface SSHCommandFormValues {
  name: string
  description?: string
  content: string
  workDir?: string
}

interface SSHCommandFormModalProps {
  open: boolean
  isEditing: boolean
  form: ReturnType<typeof Form.useForm<SSHCommandFormValues>>[0]
  onCancel: () => void
  onSubmit: () => void
}

const SSHCommandFormModal: React.FC<SSHCommandFormModalProps> = ({
  open,
  isEditing,
  form,
  onCancel,
  onSubmit,
}) => {
  const { t } = useLocale()

  return (
    <Modal title={isEditing ? t('jadeTree.command.editTitle') : t('jadeTree.command.createTitle')} open={open} onCancel={onCancel} onOk={onSubmit}>
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label={t('jadeTree.command.name')} rules={[{ required: true, message: t('jadeTree.form.required') }]}>
          <Input placeholder={t('jadeTree.command.namePlaceholder')} />
        </Form.Item>
        <Form.Item name='description' label={t('jadeTree.command.description')}>
          <Input placeholder={t('jadeTree.command.descriptionPlaceholder')} />
        </Form.Item>
        <Form.Item name='content' label={t('jadeTree.command.content')} rules={[{ required: true, message: t('jadeTree.form.required') }]}>
          <Input.TextArea rows={5} placeholder={t('jadeTree.command.contentPlaceholder')} />
        </Form.Item>
        <Form.Item name='workDir' label={t('jadeTree.command.workDir')}>
          <Input placeholder={t('jadeTree.command.workDirPlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SSHCommandFormModal
