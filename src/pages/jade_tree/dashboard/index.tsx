import React, { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Form,
  Popconfirm,
  Space,
  Tabs,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import {
  approveSSHCommandAudit,
  createProbeTask,
  deleteProbeTask,
  executeSSHCommand,
  getClusterMachineInfoList,
  getMachineInfo,
  getProbeTaskList,
  getSSHCommandAuditList,
  getSSHCommandList,
  ProbeTaskStatus,
  reportMachineInfos,
  rejectSSHCommandAudit,
  SSHCommandAuditStatus,
  submitCreateSSHCommand,
  submitUpdateSSHCommand,
  updateProbeTask,
  updateProbeTaskStatus,
} from '@/api'
import type {
  MachineInfoItem,
  ProbeTaskItem,
  SSHCommandAuditItem,
  SSHCommandItem,
} from '@/api'
import {
  AuditsTab,
  MachinesTab,
  ProbeTasksTab,
  SSHCommandsTab,
} from './components'
import {
  ExecuteSSHModal,
  ProbeTaskFormModal,
  RejectAuditModal,
  SSHCommandFormModal,
  type ExecuteFormValues,
  type ProbeTaskFormValues,
  type RejectFormValues,
  type SSHCommandFormValues,
} from './components/modals'
import { DEFAULT_PAGE_SIZE, usePaginationState } from './hooks/usePaginationState'

const formatTotal = (value?: string): number => Number.parseInt(value ?? '0', 10) || 0

const getSSHAuditTagColor = (status?: SSHCommandAuditStatus): string => {
  if (status === SSHCommandAuditStatus.APPROVED) return 'success'
  if (status === SSHCommandAuditStatus.REJECTED) return 'error'
  if (status === SSHCommandAuditStatus.PENDING) return 'processing'
  return 'default'
}

const getProbeStatusTagColor = (status?: ProbeTaskStatus): string => {
  if (status === ProbeTaskStatus.ENABLED) return 'success'
  if (status === ProbeTaskStatus.DISABLED) return 'default'
  return 'warning'
}

type JadeTreeTabKey = 'ssh-commands' | 'audits' | 'probe-tasks' | 'machines'

interface DashboardPageProps {
  fixedTab?: JadeTreeTabKey
}

const DashboardPage: React.FC<DashboardPageProps> = ({ fixedTab }) => {
  const { message } = App.useApp()
  const { t } = useLocale()

  const [sshCommands, setSSHCommands] = useState<SSHCommandItem[]>([])
  const [sshLoading, setSSHLoading] = useState(false)
  const [sshKeyword, setSSHKeyword] = useState('')
  const [sshPagination, setSSHPagination] = usePaginationState()

  const [audits, setAudits] = useState<SSHCommandAuditItem[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditStatusFilter, setAuditStatusFilter] = useState<SSHCommandAuditStatus | undefined>(undefined)
  const [auditPagination, setAuditPagination] = usePaginationState()

  const [probeTasks, setProbeTasks] = useState<ProbeTaskItem[]>([])
  const [probeLoading, setProbeLoading] = useState(false)
  const [probePagination, setProbePagination] = usePaginationState()

  const [localMachine, setLocalMachine] = useState<MachineInfoItem>()
  const [clusterMachines, setClusterMachines] = useState<MachineInfoItem[]>([])
  const [machineLoading, setMachineLoading] = useState(false)
  const [machinePagination, setMachinePagination] = usePaginationState()

  const [sshFormOpen, setSSHFormOpen] = useState(false)
  const [sshEditing, setSSHEditing] = useState<SSHCommandItem>()
  const [sshForm] = Form.useForm<SSHCommandFormValues>()

  const [executeOpen, setExecuteOpen] = useState(false)
  const [executeTarget, setExecuteTarget] = useState<SSHCommandItem>()
  const [executeResult, setExecuteResult] = useState<{ stdout?: string; stderr?: string; exitCode?: number }>()
  const [executeForm] = Form.useForm<ExecuteFormValues>()

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<SSHCommandAuditItem>()
  const [rejectForm] = Form.useForm<RejectFormValues>()

  const [probeOpen, setProbeOpen] = useState(false)
  const [probeEditing, setProbeEditing] = useState<ProbeTaskItem>()
  const [probeForm] = Form.useForm<ProbeTaskFormValues>()

  const fetchSSHCommands = async (page = sshPagination.current, pageSize = sshPagination.pageSize, keyword = sshKeyword) => {
    setSSHLoading(true)
    try {
      const res = await getSSHCommandList({ page, pageSize, keyword: keyword || undefined })
      setSSHCommands(res.items ?? [])
      setSSHPagination({ current: page, pageSize, total: formatTotal(res.total) })
    } catch (error) {
      console.error('获取 SSH 命令列表失败', error)
      setSSHCommands([])
    } finally {
      setSSHLoading(false)
    }
  }

  const fetchAudits = async (page = auditPagination.current, pageSize = auditPagination.pageSize, statusFilter = auditStatusFilter) => {
    setAuditLoading(true)
    try {
      const res = await getSSHCommandAuditList({ page, pageSize, statusFilter })
      setAudits(res.items ?? [])
      setAuditPagination({ current: page, pageSize, total: formatTotal(res.total) })
    } catch (error) {
      console.error('获取审核列表失败', error)
      setAudits([])
    } finally {
      setAuditLoading(false)
    }
  }

  const fetchProbeTasks = async (page = probePagination.current, pageSize = probePagination.pageSize) => {
    setProbeLoading(true)
    try {
      const res = await getProbeTaskList({ page, pageSize })
      setProbeTasks(res.items ?? [])
      setProbePagination({ current: page, pageSize, total: formatTotal(res.total) })
    } catch (error) {
      console.error('获取探测任务失败', error)
      setProbeTasks([])
    } finally {
      setProbeLoading(false)
    }
  }

  const fetchMachines = async (page = machinePagination.current, pageSize = machinePagination.pageSize) => {
    setMachineLoading(true)
    try {
      const [local, cluster] = await Promise.all([
        getMachineInfo(),
        getClusterMachineInfoList({ page, pageSize }),
      ])
      setLocalMachine(local)
      setClusterMachines(cluster.machines ?? [])
      setMachinePagination({ current: page, pageSize, total: formatTotal(cluster.total) })
    } catch (error) {
      console.error('获取机器信息失败', error)
      setClusterMachines([])
    } finally {
      setMachineLoading(false)
    }
  }

  useEffect(() => {
    void fetchSSHCommands(1, DEFAULT_PAGE_SIZE)
    void fetchAudits(1, DEFAULT_PAGE_SIZE)
    void fetchProbeTasks(1, DEFAULT_PAGE_SIZE)
    void fetchMachines(1, DEFAULT_PAGE_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sshColumns: ColumnsType<SSHCommandItem> = useMemo(
    () => [
      { title: t('jadeTree.command.uid'), dataIndex: 'uid', key: 'uid', width: 160 },
      { title: t('jadeTree.command.name'), dataIndex: 'name', key: 'name', width: 180 },
      { title: t('jadeTree.command.description'), dataIndex: 'description', key: 'description', ellipsis: true },
      { title: t('jadeTree.command.workDir'), dataIndex: 'workDir', key: 'workDir', width: 180, render: (value?: string) => value || '-' },
      { title: t('jadeTree.command.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
      {
        title: t('table.action'),
        key: 'action',
        width: 200,
        render: (_, row) => (
          <Space>
            <Button type='link' onClick={() => {
              setExecuteTarget(row)
              setExecuteResult(undefined)
              executeForm.resetFields()
              setExecuteOpen(true)
            }}>
              {t('jadeTree.command.execute')}
            </Button>
            <Button type='link' onClick={() => {
              sshForm.setFieldsValue({
                name: row.name || '',
                description: row.description,
                content: row.content || '',
                workDir: row.workDir,
              })
              setSSHEditing(row)
              setSSHFormOpen(true)
            }}>
              {t('common.edit')}
            </Button>
          </Space>
        ),
      },
    ],
    [executeForm, t],
  )

  const auditColumns: ColumnsType<SSHCommandAuditItem> = useMemo(
    () => [
      { title: t('jadeTree.audit.uid'), dataIndex: 'uid', key: 'uid', width: 160 },
      { title: t('jadeTree.audit.name'), dataIndex: 'name', key: 'name', width: 160 },
      {
        title: t('common.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status?: SSHCommandAuditStatus) => (
          <Tag color={getSSHAuditTagColor(status)}>
            {status === SSHCommandAuditStatus.PENDING
              ? t('jadeTree.audit.status.PENDING')
              : status === SSHCommandAuditStatus.APPROVED
                ? t('jadeTree.audit.status.APPROVED')
                : status === SSHCommandAuditStatus.REJECTED
                  ? t('jadeTree.audit.status.REJECTED')
                  : t('jadeTree.audit.status.UNKNOWN')}
          </Tag>
        ),
      },
      { title: t('jadeTree.audit.rejectReason'), dataIndex: 'rejectReason', key: 'rejectReason', ellipsis: true, render: (v?: string) => v || '-' },
      { title: t('jadeTree.audit.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
      {
        title: t('table.action'),
        key: 'action',
        width: 160,
        render: (_, row) => (
          <Space>
            <Button
              type='link'
              disabled={row.status !== SSHCommandAuditStatus.PENDING}
              onClick={async () => {
                if (!row.uid) return
                await approveSSHCommandAudit(row.uid, { uid: row.uid })
                message.success(t('message.update.success'))
                void fetchAudits()
                void fetchSSHCommands()
              }}
            >
              {t('jadeTree.audit.approve')}
            </Button>
            <Button
              type='link'
              danger
              disabled={row.status !== SSHCommandAuditStatus.PENDING}
              onClick={() => {
                setRejectTarget(row)
                rejectForm.resetFields()
                setRejectOpen(true)
              }}
            >
              {t('jadeTree.audit.reject')}
            </Button>
          </Space>
        ),
      },
    ],
    [message, rejectForm, t],
  )

  const probeColumns: ColumnsType<ProbeTaskItem> = useMemo(
    () => [
      { title: t('jadeTree.probe.uid'), dataIndex: 'uid', key: 'uid', width: 160 },
      { title: t('table.search.type'), dataIndex: 'type', key: 'type', width: 120, render: (v?: string) => v || '-' },
      { title: t('jadeTree.probe.name'), dataIndex: 'name', key: 'name', width: 140, render: (v?: string) => v || '-' },
      { title: t('jadeTree.probe.host'), dataIndex: 'host', key: 'host', width: 140, render: (v?: string) => v || '-' },
      { title: t('jadeTree.probe.port'), dataIndex: 'port', key: 'port', width: 100, render: (v?: string) => v || '-' },
      { title: t('jadeTree.probe.url'), dataIndex: 'url', key: 'url', ellipsis: true, render: (v?: string) => v || '-' },
      {
        title: t('common.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status?: ProbeTaskStatus) => (
          <Tag color={getProbeStatusTagColor(status)}>
            {status === ProbeTaskStatus.ENABLED ? t('common.status.ENABLED') : status === ProbeTaskStatus.DISABLED ? t('common.status.DISABLED') : t('common.status.UNKNOWN')}
          </Tag>
        ),
      },
      {
        title: t('table.action'),
        key: 'action',
        width: 220,
        render: (_, row) => (
          <Space>
            <Button
              type='link'
              onClick={() => {
                setProbeEditing(row)
                probeForm.setFieldsValue({
                  type: row.type || '',
                  name: row.name,
                  host: row.host,
                  port: row.port,
                  url: row.url,
                  timeoutSeconds: row.timeoutSeconds,
                })
                setProbeOpen(true)
              }}
            >
              {t('common.edit')}
            </Button>
            <Button
              type='link'
              onClick={async () => {
                if (!row.uid) return
                await updateProbeTaskStatus(row.uid, {
                  uid: row.uid,
                  status:
                    row.status === ProbeTaskStatus.ENABLED
                      ? ProbeTaskStatus.DISABLED
                      : ProbeTaskStatus.ENABLED,
                })
                message.success(t('message.update.success'))
                void fetchProbeTasks()
              }}
            >
              {row.status === ProbeTaskStatus.ENABLED ? t('common.status.DISABLED') : t('common.status.ENABLED')}
            </Button>
            <Popconfirm
              title={t('jadeTree.probe.deleteConfirm')}
              onConfirm={async () => {
                if (!row.uid) return
                await deleteProbeTask(row.uid)
                message.success(t('message.delete.success'))
                void fetchProbeTasks()
              }}
            >
              <Button type='link' danger>{t('common.delete')}</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [message, probeForm, t],
  )

  const machineColumns: ColumnsType<MachineInfoItem> = useMemo(
    () => [
      { title: t('jadeTree.machine.hostName'), dataIndex: ['host', 'hostName'], key: 'hostName', width: 180, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.machineUuid'), dataIndex: ['host', 'machineUuid'], key: 'machineUuid', width: 220, ellipsis: true, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.localIp'), dataIndex: ['network', 'localIp'], key: 'localIp', width: 160, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.os'), dataIndex: ['system', 'os'], key: 'os', width: 120, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.version'), dataIndex: ['system', 'version'], key: 'version', width: 160, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.kernel'), dataIndex: ['system', 'kernel'], key: 'kernel', width: 180, render: (v?: string) => v || '-' },
    ],
    [t],
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
      void fetchAudits()
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

  const handleSubmitRejectAudit = async () => {
    if (!rejectTarget?.uid) return
    try {
      const values = await rejectForm.validateFields()
      await rejectSSHCommandAudit(rejectTarget.uid, {
        uid: rejectTarget.uid,
        reason: values.reason,
      })
      message.success(t('message.update.success'))
      setRejectOpen(false)
      void fetchAudits()
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'errorFields' in (error as Record<string, unknown>)
      )
        return
      console.error('拒绝审核失败', error)
    }
  }

  const handleSubmitProbeTask = async () => {
    try {
      const values = await probeForm.validateFields()
      if (probeEditing?.uid) {
        await updateProbeTask(probeEditing.uid, {
          uid: probeEditing.uid,
          ...values,
        })
        message.success(t('message.update.success'))
      } else {
        await createProbeTask({ ...values, status: ProbeTaskStatus.ENABLED })
        message.success(t('message.create.success'))
      }
      setProbeOpen(false)
      setProbeEditing(undefined)
      void fetchProbeTasks()
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'errorFields' in (error as Record<string, unknown>)
      )
        return
      console.error('保存探测任务失败', error)
    }
  }

  const tabItems = [
    {
      key: 'ssh-commands',
      label: t('jadeTree.tabs.commands'),
      children: (
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
      ),
    },
    {
      key: 'audits',
      label: t('jadeTree.tabs.audits'),
      children: (
        <AuditsTab
          auditStatusFilter={auditStatusFilter}
          setAuditStatusFilter={setAuditStatusFilter}
          auditPagination={auditPagination}
          auditColumns={auditColumns}
          audits={audits}
          auditLoading={auditLoading}
          onFetchAudits={fetchAudits}
        />
      ),
    },
    {
      key: 'probe-tasks',
      label: t('jadeTree.tabs.probes'),
      children: (
        <ProbeTasksTab
          probePagination={probePagination}
          probeColumns={probeColumns}
          probeTasks={probeTasks}
          probeLoading={probeLoading}
          onFetchProbeTasks={fetchProbeTasks}
          onCreate={() => {
            setProbeEditing(undefined)
            probeForm.resetFields()
            setProbeOpen(true)
          }}
        />
      ),
    },
    {
      key: 'machines',
      label: t('jadeTree.tabs.machines'),
      children: (
        <MachinesTab
          localMachine={localMachine}
          clusterMachines={clusterMachines}
          machineLoading={machineLoading}
          machinePagination={machinePagination}
          machineColumns={machineColumns}
          onFetchMachines={fetchMachines}
          onReportLocalMachine={() => {
            void (async () => {
              try {
                if (!localMachine) return
                await reportMachineInfos({ machines: [localMachine] })
                message.success(t('message.success'))
                await fetchMachines()
              } catch (error) {
                console.error('上报机器信息失败', error)
              }
            })()
          }}
        />
      ),
    },
  ]

  const content = fixedTab
    ? tabItems.find((item) => item.key === fixedTab)?.children
    : <Tabs items={tabItems} />

  return (
    <PageContent>
      {content}

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

      <RejectAuditModal
        open={rejectOpen}
        form={rejectForm}
        onCancel={() => setRejectOpen(false)}
        onSubmit={() => void handleSubmitRejectAudit()}
      />

      <ProbeTaskFormModal
        open={probeOpen}
        isEditing={Boolean(probeEditing?.uid)}
        form={probeForm}
        onCancel={() => {
          setProbeOpen(false)
          setProbeEditing(undefined)
        }}
        onSubmit={() => void handleSubmitProbeTask()}
      />
    </PageContent>
  )
}

interface JadeTreeDashboardWrapperProps {
  fixedTab?: JadeTreeTabKey
}

export default function JadeTreeDashboardWrapper({
  fixedTab,
}: JadeTreeDashboardWrapperProps) {
  return (
    <App className='h-full'>
      <DashboardPage fixedTab={fixedTab} />
    </App>
  )
}
