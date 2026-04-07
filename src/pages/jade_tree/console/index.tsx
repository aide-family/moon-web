import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Dropdown,
  Form,
  Space,
  Tabs,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
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
  ProbeTaskListParams,
  SSHCommandAuditItem,
  SSHCommandAuditListParams,
  SSHCommandItem,
} from '@/api'
import SSHCommandsTab from '../ssh-commands/components/SSHCommandsTab'
import AuditsTab from '../audits/components/AuditsTab'
import ProbeTasksTab from '../probe-tasks/components/ProbeTasksTab'
import MachinesTab from '../machines/components/MachinesTab'
import SSHCommandFormModal, {
  type SSHCommandFormValues,
} from '../ssh-commands/components/modals/SSHCommandFormModal'
import ExecuteSSHModal, {
  type ExecuteFormValues,
} from '../ssh-commands/components/modals/ExecuteSSHModal'
import SSHCommandDetailModal from '../ssh-commands/components/modals/SSHCommandDetailModal'
import RejectAuditModal, {
  type RejectFormValues,
} from '../audits/components/modals/RejectAuditModal'
import AuditDetailModal from '../audits/components/modals/AuditDetailModal'
import ProbeTaskFormModal, {
  type ProbeTaskFormValues,
} from '../probe-tasks/components/modals/ProbeTaskFormModal'
import ProbeTaskDetailModal from '../probe-tasks/components/modals/ProbeTaskDetailModal'
import MachineDetailModal from '../machines/components/modals/MachineDetailModal'
import { DEFAULT_PAGE_SIZE, usePaginationState } from '@/utils/hooks/usePaginationState'

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
  const { message, modal } = App.useApp()
  const { t } = useLocale()

  const [sshCommands, setSSHCommands] = useState<SSHCommandItem[]>([])
  const [sshLoading, setSSHLoading] = useState(false)
  const [sshKeyword, setSSHKeyword] = useState('')
  const [sshPagination, setSSHPagination] = usePaginationState()

  const [audits, setAudits] = useState<SSHCommandAuditItem[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditSearchParams, setAuditSearchParams] = useState<SSHCommandAuditListParams>({
    statusFilter: undefined,
    keyword: '',
    kind: undefined,
  })
  const [auditPagination, setAuditPagination] = usePaginationState()

  const [probeTasks, setProbeTasks] = useState<ProbeTaskItem[]>([])
  const [probeLoading, setProbeLoading] = useState(false)
  const [probePagination, setProbePagination] = usePaginationState()
  const [probeSearchParams, setProbeSearchParams] = useState<ProbeTaskListParams>({
    keyword: '',
    type: undefined,
    status: undefined,
  })

  const [localMachine, setLocalMachine] = useState<MachineInfoItem>()
  const [clusterMachines, setClusterMachines] = useState<MachineInfoItem[]>([])
  const [machineLoading, setMachineLoading] = useState(false)
  const [machinePagination, setMachinePagination] = usePaginationState()
  const [machineDetailOpen, setMachineDetailOpen] = useState(false)
  const [machineDetailData, setMachineDetailData] = useState<MachineInfoItem>()

  const [sshFormOpen, setSSHFormOpen] = useState(false)
  const [sshEditing, setSSHEditing] = useState<SSHCommandItem>()
  const [sshForm] = Form.useForm<SSHCommandFormValues>()

  const [executeOpen, setExecuteOpen] = useState(false)
  const [executeTarget, setExecuteTarget] = useState<SSHCommandItem>()
  const [executeResult, setExecuteResult] = useState<{ stdout?: string; stderr?: string; exitCode?: number }>()
  const [executeForm] = Form.useForm<ExecuteFormValues>()
  const [commandDetailOpen, setCommandDetailOpen] = useState(false)
  const [commandDetailData, setCommandDetailData] = useState<SSHCommandItem>()

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<SSHCommandAuditItem>()
  const [rejectForm] = Form.useForm<RejectFormValues>()
  const [auditDetailOpen, setAuditDetailOpen] = useState(false)
  const [auditDetailData, setAuditDetailData] = useState<SSHCommandAuditItem>()

  const [probeOpen, setProbeOpen] = useState(false)
  const [probeEditing, setProbeEditing] = useState<ProbeTaskItem>()
  const [probeForm] = Form.useForm<ProbeTaskFormValues>()
  const [probeDetailOpen, setProbeDetailOpen] = useState(false)
  const [probeDetailData, setProbeDetailData] = useState<ProbeTaskItem>()

  const fetchSSHCommands = useCallback(
    async (
      page = sshPagination.current,
      pageSize = sshPagination.pageSize,
      keyword = sshKeyword,
    ) => {
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
    },
    [setSSHPagination, sshKeyword, sshPagination],
  )

  const fetchAudits = useCallback(
    async (
      page = auditPagination.current,
      pageSize = auditPagination.pageSize,
      override?: Partial<SSHCommandAuditListParams>,
    ) => {
      setAuditLoading(true)
      try {
        const effective = override
          ? { ...auditSearchParams, ...override }
          : auditSearchParams
        const res = await getSSHCommandAuditList({
          page,
          pageSize,
          statusFilter: effective.statusFilter,
          keyword: effective.keyword || undefined,
          kind: effective.kind,
        })
        setAudits(res.items ?? [])
        setAuditPagination({ current: page, pageSize, total: formatTotal(res.total) })
      } catch (error) {
        console.error('获取审核列表失败', error)
        setAudits([])
      } finally {
        setAuditLoading(false)
      }
    },
    [auditPagination, auditSearchParams, setAuditPagination],
  )

  const fetchProbeTasks = useCallback(
    async (
      page = probePagination.current,
      pageSize = probePagination.pageSize,
      override?: Partial<ProbeTaskListParams>,
    ) => {
      setProbeLoading(true)
      try {
        const effective = override
          ? { ...probeSearchParams, ...override }
          : probeSearchParams
        const res = await getProbeTaskList({
          page,
          pageSize,
          type: effective.type || undefined,
          keyword: effective.keyword || undefined,
          status: effective.status,
        })
        setProbeTasks(res.items ?? [])
        setProbePagination({ current: page, pageSize, total: formatTotal(res.total) })
      } catch (error) {
        console.error('获取探测任务失败', error)
        setProbeTasks([])
      } finally {
        setProbeLoading(false)
      }
    },
    [probePagination, probeSearchParams, setProbePagination],
  )

  const fetchMachines = async (page = machinePagination.current, pageSize = machinePagination.pageSize) => {
    setMachineLoading(true)
    try {
      const [localResult, clusterResult] = await Promise.allSettled([
        getMachineInfo(),
        getClusterMachineInfoList({ page, pageSize }),
      ])
      if (localResult.status === 'fulfilled') {
        setLocalMachine(localResult.value)
      } else {
        setLocalMachine(undefined)
      }
      if (clusterResult.status === 'fulfilled') {
        setClusterMachines(clusterResult.value.machines ?? [])
        setMachinePagination({
          current: page,
          pageSize,
          total: formatTotal(clusterResult.value.total),
        })
      } else {
        setClusterMachines([])
        setMachinePagination({ current: page, pageSize, total: 0 })
      }
    } catch (error) {
      console.error('获取机器信息失败', error)
      setLocalMachine(undefined)
      setClusterMachines([])
      setMachinePagination({ current: page, pageSize, total: 0 })
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
        width: 140,
        fixed: 'right',
        align: 'center',
        render: (_, row) => (
          <Space size='small'>
            <Button
              type='link'
              onClick={() => {
                setAuditDetailData(row)
                setAuditDetailOpen(true)
              }}
            >
              {t('common.detail')}
            </Button>
            {row.status === SSHCommandAuditStatus.PENDING ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'approve',
                      label: t('jadeTree.audit.approve'),
                      onClick: async () => {
                        if (!row.uid) return
                        await approveSSHCommandAudit(row.uid, { uid: row.uid })
                        message.success(t('message.update.success'))
                        void fetchAudits()
                        void fetchSSHCommands()
                      },
                    },
                    {
                      key: 'reject',
                      label: t('jadeTree.audit.reject'),
                      danger: true,
                      onClick: () => {
                        setRejectTarget(row)
                        rejectForm.resetFields()
                        setRejectOpen(true)
                      },
                    },
                  ] as MenuProps['items'],
                }}
                trigger={['click']}
              >
                <Button type='link'>{t('common.more')}</Button>
              </Dropdown>
            ) : null}
          </Space>
        ),
      },
    ],
    [fetchAudits, fetchSSHCommands, message, rejectForm, t],
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
        width: 140,
        fixed: 'right',
        align: 'center',
        render: (_, row) => (
          <Space size='small'>
            <Button
              type='link'
              onClick={() => {
                setProbeDetailData(row)
                setProbeDetailOpen(true)
              }}
            >
              {t('common.detail')}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: t('common.edit'),
                    onClick: () => {
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
                    },
                  },
                  {
                    key: 'status',
                    label:
                      row.status === ProbeTaskStatus.ENABLED
                        ? t('common.status.DISABLED')
                        : t('common.status.ENABLED'),
                    onClick: async () => {
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
                    },
                  },
                  {
                    key: 'delete',
                    label: t('common.delete'),
                    danger: true,
                    onClick: () => {
                      modal.confirm({
                        title: t('jadeTree.probe.deleteConfirm'),
                        okText: t('common.ok'),
                        cancelText: t('common.cancel'),
                        onOk: async () => {
                          if (!row.uid) return
                          await deleteProbeTask(row.uid)
                          message.success(t('message.delete.success'))
                          void fetchProbeTasks()
                        },
                      })
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
    [fetchProbeTasks, message, modal, probeForm, t],
  )

  const machineColumns: ColumnsType<MachineInfoItem> = useMemo(
    () => [
      { title: t('jadeTree.machine.hostName'), dataIndex: ['host', 'hostName'], key: 'hostName', width: 180, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.machineUuid'), dataIndex: ['host', 'machineUuid'], key: 'machineUuid', width: 220, ellipsis: true, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.localIp'), dataIndex: ['network', 'localIp'], key: 'localIp', width: 160, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.os'), dataIndex: ['system', 'os'], key: 'os', width: 120, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.version'), dataIndex: ['system', 'version'], key: 'version', width: 160, render: (v?: string) => v || '-' },
      { title: t('jadeTree.machine.kernel'), dataIndex: ['system', 'kernel'], key: 'kernel', width: 180, render: (v?: string) => v || '-' },
      {
        title: t('table.action'),
        key: 'action',
        width: 120,
        fixed: 'right',
        align: 'center',
        render: (_, row) => (
          <Button
            type='link'
            size='small'
            onClick={() => {
              setMachineDetailData(row)
              setMachineDetailOpen(true)
            }}
          >
            {t('common.detail')}
          </Button>
        ),
      },
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
          auditSearchParams={auditSearchParams}
          setAuditSearchParams={setAuditSearchParams}
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
          probeSearchParams={probeSearchParams}
          setProbeSearchParams={setProbeSearchParams}
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

      <SSHCommandDetailModal
        open={commandDetailOpen}
        data={commandDetailData}
        onCancel={() => setCommandDetailOpen(false)}
      />

      <RejectAuditModal
        open={rejectOpen}
        form={rejectForm}
        onCancel={() => setRejectOpen(false)}
        onSubmit={() => void handleSubmitRejectAudit()}
      />

      <AuditDetailModal
        open={auditDetailOpen}
        data={auditDetailData}
        onCancel={() => setAuditDetailOpen(false)}
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

      <ProbeTaskDetailModal
        open={probeDetailOpen}
        data={probeDetailData}
        onCancel={() => setProbeDetailOpen(false)}
      />

      <MachineDetailModal
        open={machineDetailOpen}
        data={machineDetailData}
        onCancel={() => setMachineDetailOpen(false)}
      />
    </PageContent>
  )
}

interface JadeTreeConsoleWrapperProps {
  fixedTab?: JadeTreeTabKey
}

export default function JadeTreeConsoleWrapper({
  fixedTab,
}: JadeTreeConsoleWrapperProps) {
  return (
    <App className='h-full'>
      <DashboardPage fixedTab={fixedTab} />
    </App>
  )
}
