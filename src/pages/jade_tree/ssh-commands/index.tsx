import type { SSHCommandItem } from '@/api'
import {
  executeSSHCommand,
  getSSHCommandDetail,
  getSSHCommandList,
  submitCreateSSHCommand,
  submitUpdateSSHCommand,
} from '@/api'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import type { MenuProps } from 'antd'
import { App, Button, Dropdown, Form, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useMemo, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import SSHCommandsTab from './components/SSHCommandsTab'
import ExecuteSSHModal, {
  type ExecuteFormValues,
} from './components/modals/ExecuteSSHModal'
import SSHCommandDetailModal from './components/modals/SSHCommandDetailModal'
import SSHCommandFormModal, {
  type SSHCommandFormValues,
} from './components/modals/SSHCommandFormModal'

type SSHCommandListQuery = {
  keyword: string
}

const SSHCommandsPage: React.FC = () => {
  const { message } = App.useApp()
  const { t } = useLocale()

  const [sshKeyword, setSSHKeyword] = useState('')
  const list = usePaginatedRequest<SSHCommandItem, SSHCommandListQuery>({
    service: ({ page, pageSize, keyword }) =>
      getSSHCommandList({
        page,
        pageSize,
        keyword: keyword || undefined,
      }),
    defaultQuery: { keyword: '' },
  })

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
  const [commandDetailUid, setCommandDetailUid] = useState<string>()
  const {
    data: commandDetailData,
    loading: commandDetailLoading,
    error: commandDetailError,
  } = useDetailRequest(getSSHCommandDetail, commandDetailUid, commandDetailOpen)

  useEffect(() => {
    if (commandDetailError && commandDetailOpen) {
      console.error('获取 SSH 命令详情失败', commandDetailError)
      setCommandDetailOpen(false)
      setCommandDetailUid(undefined)
    }
  }, [commandDetailError, commandDetailOpen])

  const openCommandDetail = useMemoizedFn((row: SSHCommandItem) => {
    if (!row.uid) return
    setCommandDetailUid(row.uid)
    setCommandDetailOpen(true)
  })

  const handleSearch = useMemoizedFn(() => {
    list.search({ keyword: sshKeyword })
  })

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
            <Button type='link' onClick={() => openCommandDetail(row)}>
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
    [executeForm, openCommandDetail, sshForm, t],
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
      list.refresh()
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
          sshPagination={list.pagination}
          sshColumns={sshColumns}
          sshCommands={list.dataSource}
          sshLoading={list.loading}
          onSearch={handleSearch}
          onPageChange={list.changePage}
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
          loading={commandDetailLoading}
          onCancel={() => {
            setCommandDetailOpen(false)
            setCommandDetailUid(undefined)
          }}
        />
      </PageContent>
    </App>
  )
}

export default SSHCommandsPage
