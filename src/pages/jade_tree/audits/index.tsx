import type { SSHCommandAuditItem, SSHCommandAuditListParams } from '@/api'
import {
  approveSSHCommandAudit,
  getSSHCommandAuditList,
  rejectSSHCommandAudit,
  SSHCommandAuditStatus,
} from '@/api'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import {
  DEFAULT_PAGE_SIZE,
  usePaginationState,
} from '@/utils/hooks/usePaginationState'
import type { MenuProps } from 'antd'
import { App, Button, Dropdown, Form, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AuditsTab from './components/AuditsTab'
import AuditDetailModal from './components/modals/AuditDetailModal'
import RejectAuditModal, {
  type RejectFormValues,
} from './components/modals/RejectAuditModal'

const formatTotal = (value?: string): number =>
  Number.parseInt(value ?? '0', 10) || 0

const getSSHAuditTagColor = (status?: SSHCommandAuditStatus): string => {
  if (status === SSHCommandAuditStatus.APPROVED) return 'success'
  if (status === SSHCommandAuditStatus.REJECTED) return 'error'
  if (status === SSHCommandAuditStatus.PENDING) return 'processing'
  return 'default'
}

const AuditsPage: React.FC = () => {
  const { message } = App.useApp()
  const { t } = useLocale()

  const [audits, setAudits] = useState<SSHCommandAuditItem[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditSearchParams, setAuditSearchParams] =
    useState<SSHCommandAuditListParams>({
      statusFilter: undefined,
      keyword: '',
      kind: undefined,
    })
  const [auditPagination, setAuditPagination] = usePaginationState()

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<SSHCommandAuditItem>()
  const [rejectForm] = Form.useForm<RejectFormValues>()
  const [auditDetailOpen, setAuditDetailOpen] = useState(false)
  const [auditDetailData, setAuditDetailData] = useState<SSHCommandAuditItem>()

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
        setAuditPagination({
          current: page,
          pageSize,
          total: formatTotal(res.total),
        })
      } catch (error) {
        console.error('获取审核列表失败', error)
        setAudits([])
      } finally {
        setAuditLoading(false)
      }
    },
    [auditPagination, auditSearchParams, setAuditPagination],
  )

  useEffect(() => {
    void fetchAudits(1, DEFAULT_PAGE_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const auditColumns: ColumnsType<SSHCommandAuditItem> = useMemo(
    () => [
      {
        title: t('jadeTree.audit.uid'),
        dataIndex: 'uid',
        key: 'uid',
        width: 160,
      },
      {
        title: t('jadeTree.audit.name'),
        dataIndex: 'name',
        key: 'name',
        width: 160,
      },
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
      {
        title: t('jadeTree.audit.rejectReason'),
        dataIndex: 'rejectReason',
        key: 'rejectReason',
        ellipsis: true,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.audit.updatedAt'),
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
    [fetchAudits, message, rejectForm, t],
  )

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

  return (
    <App className='h-full'>
      <PageContent>
        <AuditsTab
          auditSearchParams={auditSearchParams}
          setAuditSearchParams={setAuditSearchParams}
          auditPagination={auditPagination}
          auditColumns={auditColumns}
          audits={audits}
          auditLoading={auditLoading}
          onFetchAudits={fetchAudits}
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
      </PageContent>
    </App>
  )
}

export default AuditsPage
