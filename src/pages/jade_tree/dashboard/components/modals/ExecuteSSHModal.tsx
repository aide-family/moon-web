import React from 'react'
import { Card, Form, Input, InputNumber, Modal } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import type { SSHCommandItem } from '@/api'

export interface ExecuteFormValues {
  host: string
  port?: number
  username: string
  password?: string
  privateKey?: string
  timeoutSeconds?: number
}

interface ExecuteSSHModalProps {
  open: boolean
  target?: SSHCommandItem
  form: ReturnType<typeof Form.useForm<ExecuteFormValues>>[0]
  result?: {
    stdout?: string
    stderr?: string
    exitCode?: number
  }
  onCancel: () => void
  onSubmit: () => void
}

const ExecuteSSHModal: React.FC<ExecuteSSHModalProps> = ({
  open,
  target,
  form,
  result,
  onCancel,
  onSubmit,
}) => {
  const { t } = useLocale()

  return (
    <Modal
      title={t('jadeTree.command.executeTitle', { name: target?.name || '-' })}
      open={open}
      width={720}
      onCancel={onCancel}
      onOk={onSubmit}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='host'
          label={t('jadeTree.execute.host')}
          rules={[{ required: true, message: t('jadeTree.form.required') }]}
        >
          <Input placeholder={t('jadeTree.execute.hostPlaceholder')} />
        </Form.Item>
        <Form.Item name='port' label={t('jadeTree.execute.port')} initialValue={22}>
          <InputNumber
            className='w-full'
            min={1}
            placeholder={t('jadeTree.execute.portPlaceholder')}
          />
        </Form.Item>
        <Form.Item
          name='username'
          label={t('jadeTree.execute.username')}
          rules={[{ required: true, message: t('jadeTree.form.required') }]}
        >
          <Input placeholder={t('jadeTree.execute.usernamePlaceholder')} />
        </Form.Item>
        <Form.Item name='password' label={t('jadeTree.execute.password')}>
          <Input.Password placeholder={t('jadeTree.execute.passwordPlaceholder')} />
        </Form.Item>
        <Form.Item name='privateKey' label={t('jadeTree.execute.privateKey')}>
          <Input.TextArea
            rows={4}
            placeholder={t('jadeTree.execute.privateKeyPlaceholder')}
          />
        </Form.Item>
        <Form.Item name='timeoutSeconds' label={t('jadeTree.execute.timeout')}>
          <InputNumber
            className='w-full'
            min={1}
            placeholder={t('jadeTree.execute.timeoutPlaceholder')}
          />
        </Form.Item>
      </Form>
      {result ? (
        <Card
          size='small'
          title={`${t('jadeTree.execute.result')} (exitCode=${result.exitCode ?? '-'})`}
        >
          <pre className='whitespace-pre-wrap mb-2'>{result.stdout || '-'}</pre>
          <pre className='whitespace-pre-wrap text-red-500'>{result.stderr || '-'}</pre>
        </Card>
      ) : null}
    </Modal>
  )
}

export default ExecuteSSHModal
