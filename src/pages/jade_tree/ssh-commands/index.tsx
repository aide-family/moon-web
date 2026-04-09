import type { SSHCommandItem } from '@/api'
import {
  executeSSHCommand,
  getSSHCommandList,
  submitCreateSSHCommand,
  submitUpdateSSHCommand,
} from '@/api'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import {
  DEFAULT_PAGE_SIZE,
  usePaginationState,
} from '@/utils/hooks/usePaginationState'
import type { MenuProps } from 'antd'
import { App, Button, Dropdown, Form, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import SSHCommandsTab from './components/SSHCommandsTab'
import ExecuteSSHModal, {
  type ExecuteFormValues,
} from './components/modals/ExecuteSSHModal'
import SSHCommandDetailModal from './components/modals/SSHCommandDetailModal'
import SSHCommandFormModal, {
  type SSHCommandFormValues,
} from './components/modals/SSHCommandFormModal'

const formatTotal = (value?: string): number =>
  Number.parseInt(value ?? '0', 10) || 0

const SSHCommandsPage: React.FC = () => {
  const { message } = App.useApp()
  const { t } = useLocale()

  const [sshCommands, setSSHCommands] = useState<SSHCommandItem[]>([])
  const [sshLoading, setSSHLoading] = useState(false)
  const [sshKeyword, setSSHKeyword] = useState('')
  const [sshPagination, setSSHPagination] = usePaginationState()

  const [sshFormOpen, setSSHFormOpen] = useState(false)
  const [sshEditing, setSSHEditing] = useState<SSHCommandItem>()
  const [sshForm] = Form.useForm<SSHCommandFormValues>()

  const [executeOpen, setExecuteOpen] = useState(false)
  const [executeTarget, setExecuteTarget] = useState<SSHCommandItem>()
  const [executeResult, setExecuteResult] = useState<{
    stdout?: string
    stderr?: string
    exitCode?: number
  }>()
  const [executeForm] = Form.useForm<ExecuteFormValues>()

  const [commandDetailOpen, setCommandDetailOpen] = useState(false)
  const [commandDetailData, setCommandDetailData] = useState<SSHCommandItem>()

  const fetchSSHCommands = useCallback(
    async (
      page = sshPagination.current,
      pageSize = sshPagination.pageSize,
      keyword = sshKeyword,
    ) => {
      setSSHLoading(true)
      try {
        const res = await getSSHCommandList({
          page,
          pageSize,
          keyword: keyword || undefined,
        })
        setSSHCommands(res.items ?? [])
        setSSHPagination({
          current: page,
          pageSize,
          total: formatTotal(res.total),
        })
      } catch (error) {
        console.error('获取 SSH 命令列表失败', error)
        setSSHCommands([])
      } finally {
        setSSHLoading(false)
      }
    },
    [setSSHPagination, sshKeyword, sshPagination],
  )

  useEffect(() => {
    void fetchSSHCommands(1, DEFAULT_PAGE_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sshColumns: ColumnsType<SSHCommandItem> = useMemo(
    () => [
      {
        title: t('jadeTree.command.uid'),
        dataIndex: 'uid',
        key: 'uid',
        width: 160,
      },
      {
        title: t('jadeTree.command.name'),
        dataIndex: 'name',
        key: 'name',
        width: 180,
      },
      {
        title: t('jadeTree.command.description'),
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        minWidth: 180,
        render: (value?: string) => value || '-',
      },
      {
        title: t('jadeTree.command.workDir'),
        dataIndex: 'workDir',
        key: 'workDir',
        width: 180,
        render: (value?: string) => value || '-',
      },
      {
        title: t('jadeTree.command.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 180,
      },
      {
        title: t('table.action'),
        key: 'action',
        width: 140,
        fixed: 'right',
        align: 'center',
        render: (_, row) => (
          <Space size='small'>
            <Button
              type='link'
              onClick={() => {
                setCommandDetailData(row)
                setCommandDetailOpen(true)
              }}
            >
              {t('common.detail')}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'execute',
                    label: t('jadeTree.command.execute'),
                    onClick: () => {
                      setExecuteTarget(row)
                      setExecuteResult(undefined)
                      executeForm.resetFields()
                      setExecuteOpen(true)
                    },
                  },
                  {
                    key: 'edit',
                    label: t('common.edit'),
                    onClick: () => {
                      sshForm.setFieldsValue({
                        name: row.name || '',
                        description: row.description,
                        content: row.content || '',
                        workDir: row.workDir,
                      })
                      setSSHEditing(row)
                      setSSHFormOpen(true)
                    },
                  },
                ] as MenuProps['items'],
              }}
              trigger={['click']}
            >
              <Button type='link'>{t('common.more')}</Button>
            </Dropdown>
          </Space>
        ),
      },
    ],
    [executeForm, sshForm, t],
  )

  const handleSubmitSSHCommand = async () => {
    try {
      const values = await sshForm.validateFields()
      if (sshEditing?.uid) {
        await submitUpdateSSHCommand(sshEditing.uid, {
          commandUid: sshEditing.uid,
          ...values,
        })
        message.success(t('message.update.success'))
      } else {
        await submitCreateSSHCommand(values)
        message.success(t('message.create.success'))
      }
      setSSHFormOpen(false)
      setSSHEditing(undefined)
      void fetchSSHCommands()
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'errorFields' in (error as Record<string, unknown>)
      )
        return
      console.error('创建命令提交失败', error)
    }
  }

  const handleSubmitExecute = async () => {
    if (!executeTarget?.uid) return
    try {
      const values = await executeForm.validateFields()
      const res = await executeSSHCommand(executeTarget.uid, values)
      setExecuteResult(res)
      message.success(t('message.success'))
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'errorFields' in (error as Record<string, unknown>)
      )
        return
      console.error('执行命令失败', error)
    }
  }

  return (
    <App className='h-full'>
      <PageContent>
        <SSHCommandsTab
          sshKeyword={sshKeyword}
          setSSHKeyword={setSSHKeyword}
          sshPagination={sshPagination}
          sshColumns={sshColumns}
          sshCommands={sshCommands}
          sshLoading={sshLoading}
          onSearch={fetchSSHCommands}
          onCreate={() => {
            setSSHEditing(undefined)
            sshForm.resetFields()
            setSSHFormOpen(true)
          }}
        />

        <SSHCommandFormModal
          open={sshFormOpen}
          isEditing={Boolean(sshEditing?.uid)}
          form={sshForm}
          onCancel={() => {
            setSSHFormOpen(false)
            setSSHEditing(undefined)
          }}
          onSubmit={() => void handleSubmitSSHCommand()}
        />

        <ExecuteSSHModal
          open={executeOpen}
          target={executeTarget}
          form={executeForm}
          result={executeResult}
          onCancel={() => setExecuteOpen(false)}
          onSubmit={() => void handleSubmitExecute()}
        />

        <SSHCommandDetailModal
          open={commandDetailOpen}
          data={commandDetailData}
          onCancel={() => setCommandDetailOpen(false)}
        />
      </PageContent>
    </App>
  )
}

export default SSHCommandsPage
