import type { ProbeTaskItem, ProbeTaskListParams } from '@/api'
import {
  createProbeTask,
  deleteProbeTask,
  getProbeTaskDetail,
  getProbeTaskList,
  ProbeTaskStatus,
  updateProbeTask,
  updateProbeTaskStatus,
} from '@/api'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { MENU_DIVIDER } from '@/utils/menu'
import type { MenuProps } from 'antd'
import { App, Button, Dropdown, Form, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useMemo, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import ProbeTasksTab from './components/ProbeTasksTab'
import ProbeTaskDetailModal from './components/modals/ProbeTaskDetailModal'
import ProbeTaskFormModal, {
  type ProbeTaskFormValues,
} from './components/modals/ProbeTaskFormModal'

const getProbeStatusTagColor = (status?: ProbeTaskStatus): string => {
  if (status === ProbeTaskStatus.ENABLED) return 'success'
  if (status === ProbeTaskStatus.DISABLED) return 'default'
  return 'warning'
}

type ProbeTaskListQuery = Omit<ProbeTaskListParams, 'page' | 'pageSize'>

const defaultProbeQuery: ProbeTaskListQuery = {
  keyword: '',
  type: undefined,
  status: undefined,
}

const ProbeTasksPage: React.FC = () => {
  const { message, modal } = App.useApp()
  const { t } = useLocale()

  const list = usePaginatedRequest<ProbeTaskItem, ProbeTaskListQuery>({
    service: ({ page, pageSize, type, keyword, status }) =>
      getProbeTaskList({
        page,
        pageSize,
        type: type || undefined,
        keyword: keyword || undefined,
        status,
      }),
    defaultQuery: defaultProbeQuery,
  })

  const [probeOpen, setProbeOpen] = useState(false)
  const [probeEditing, setProbeEditing] = useState<ProbeTaskItem>()
  const [probeForm] = Form.useForm<ProbeTaskFormValues>()
  const [probeDetailOpen, setProbeDetailOpen] = useState(false)
  const [probeDetailUid, setProbeDetailUid] = useState<string>()
  const {
    data: probeDetailData,
    loading: probeDetailLoading,
    error: probeDetailError,
  } = useDetailRequest(getProbeTaskDetail, probeDetailUid, probeDetailOpen)

  useEffect(() => {
    if (probeDetailError && probeDetailOpen) {
      console.error('获取探测任务详情失败', probeDetailError)
      setProbeDetailOpen(false)
      setProbeDetailUid(undefined)
    }
  }, [probeDetailError, probeDetailOpen])

  const openProbeDetail = useMemoizedFn((row: ProbeTaskItem) => {
    if (!row.uid) return
    setProbeDetailUid(row.uid)
    setProbeDetailOpen(true)
  })

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
            <Button type='link' onClick={() => openProbeDetail(row)}>
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
                      list.refresh()
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
                          list.refresh()
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
    [list, message, modal, openProbeDetail, probeForm, t],
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
      list.refresh()
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
          probePagination={list.pagination}
          probeSearchParams={list.query}
          setProbeSearchParams={list.setQuery}
          probeColumns={probeColumns}
          probeTasks={list.dataSource}
          probeLoading={list.loading}
          onSearch={list.search}
          onPageChange={list.changePage}
          onReset={() => list.reset(defaultProbeQuery)}
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
          loading={probeDetailLoading}
          onCancel={() => {
            setProbeDetailOpen(false)
            setProbeDetailUid(undefined)
          }}
        />
      </PageContent>
    </App>
  )
}

export default ProbeTasksPage
