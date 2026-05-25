import type { ProbeTaskItem, ProbeTaskListParams } from '@/api'
import {
  createProbeTask,
  deleteProbeTask,
  getProbeTaskList,
  ProbeTaskStatus,
  updateProbeTask,
  updateProbeTaskStatus,
} from '@/api'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import {
  DEFAULT_PAGE_SIZE,
  usePaginationState,
} from '@/utils/hooks/usePaginationState'
import { MENU_DIVIDER } from '@/utils/menu'
import type { MenuProps } from 'antd'
import { App, Button, Dropdown, Form, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ProbeTasksTab from './components/ProbeTasksTab'
import ProbeTaskDetailModal from './components/modals/ProbeTaskDetailModal'
import ProbeTaskFormModal, {
  type ProbeTaskFormValues,
} from './components/modals/ProbeTaskFormModal'

const formatTotal = (value?: string): number =>
  Number.parseInt(value ?? '0', 10) || 0

const getProbeStatusTagColor = (status?: ProbeTaskStatus): string => {
  if (status === ProbeTaskStatus.ENABLED) return 'success'
  if (status === ProbeTaskStatus.DISABLED) return 'default'
  return 'warning'
}

const ProbeTasksPage: React.FC = () => {
  const { message, modal } = App.useApp()
  const { t } = useLocale()

  const [probeTasks, setProbeTasks] = useState<ProbeTaskItem[]>([])
  const [probeLoading, setProbeLoading] = useState(false)
  const [probePagination, setProbePagination] = usePaginationState()
  const [probeSearchParams, setProbeSearchParams] =
    useState<ProbeTaskListParams>({
      keyword: '',
      type: undefined,
      status: undefined,
    })

  const [probeOpen, setProbeOpen] = useState(false)
  const [probeEditing, setProbeEditing] = useState<ProbeTaskItem>()
  const [probeForm] = Form.useForm<ProbeTaskFormValues>()
  const [probeDetailOpen, setProbeDetailOpen] = useState(false)
  const [probeDetailData, setProbeDetailData] = useState<ProbeTaskItem>()

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
        setProbePagination({
          current: page,
          pageSize,
          total: formatTotal(res.total),
        })
      } catch (error) {
        console.error('获取探测任务失败', error)
        setProbeTasks([])
      } finally {
        setProbeLoading(false)
      }
    },
    [probePagination, probeSearchParams, setProbePagination],
  )

  useEffect(() => {
    void fetchProbeTasks(1, DEFAULT_PAGE_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const probeColumns: ColumnsType<ProbeTaskItem> = useMemo(
    () => [
      {
        title: t('jadeTree.probe.uid'),
        dataIndex: 'uid',
        key: 'uid',
        width: 160,
      },
      {
        title: t('table.search.type'),
        dataIndex: 'type',
        key: 'type',
        width: 120,
        align: 'center',
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.probe.name'),
        dataIndex: 'name',
        key: 'name',
        width: 140,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.probe.host'),
        dataIndex: 'host',
        key: 'host',
        width: 140,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.probe.port'),
        dataIndex: 'port',
        key: 'port',
        width: 100,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.probe.url'),
        dataIndex: 'url',
        key: 'url',
        ellipsis: true,
        minWidth: 180,
        render: (v?: string) => v || '-',
      },
      {
        title: t('common.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status?: ProbeTaskStatus) => (
          <Tag color={getProbeStatusTagColor(status)}>
            {status === ProbeTaskStatus.ENABLED
              ? t('common.status.ENABLED')
              : status === ProbeTaskStatus.DISABLED
                ? t('common.status.DISABLED')
                : t('common.status.UNKNOWN')}
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
                  MENU_DIVIDER,
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

  return (
    <App className='h-full'>
      <PageContent>
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
      </PageContent>
    </App>
  )
}

export default ProbeTasksPage
