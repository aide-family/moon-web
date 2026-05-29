import type { SSHCommandAuditItem, SSHCommandAuditListParams } from '@/api'
import {
  approveSSHCommandAudit,
  getSSHCommandAuditDetail,
  getSSHCommandAuditList,
  rejectSSHCommandAudit,
  SSHCommandAuditStatus,
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
import AuditsTab from './components/AuditsTab'
import AuditDetailModal from './components/modals/AuditDetailModal'
import RejectAuditModal, {
  type RejectFormValues,
} from './components/modals/RejectAuditModal'

const getSSHAuditTagColor = (status?: SSHCommandAuditStatus): string => {
  if (status === SSHCommandAuditStatus.APPROVED) return 'success'
  if (status === SSHCommandAuditStatus.REJECTED) return 'error'
  if (status === SSHCommandAuditStatus.PENDING) return 'processing'
  return 'default'
}

type AuditListQuery = Omit<SSHCommandAuditListParams, 'page' | 'pageSize'>

const defaultAuditQuery: AuditListQuery = {
  statusFilter: undefined,
  keyword: '',
  kind: undefined,
}

const AuditsPage: React.FC = () => {
  const { message } = App.useApp()
  const { t } = useLocale()

  const list = usePaginatedRequest<SSHCommandAuditItem, AuditListQuery>({
    service: ({ page, pageSize, statusFilter, keyword, kind }) =>
      getSSHCommandAuditList({
        page,
        pageSize,
        statusFilter,
        keyword: keyword || undefined,
        kind,
      }),
    defaultQuery: defaultAuditQuery,
  })

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<SSHCommandAuditItem>()
  const [rejectForm] = Form.useForm<RejectFormValues>()
  const [auditDetailOpen, setAuditDetailOpen] = useState(false)
  const [auditDetailUid, setAuditDetailUid] = useState<string>()
  const {
    data: auditDetailData,
    loading: auditDetailLoading,
    error: auditDetailError,
  } = useDetailRequest(
    getSSHCommandAuditDetail,
    auditDetailUid,
    auditDetailOpen,
  )

  useEffect(() => {
    if (auditDetailError && auditDetailOpen) {
      console.error('获取审核详情失败', auditDetailError)
      setAuditDetailOpen(false)
      setAuditDetailUid(undefined)
    }
  }, [auditDetailError, auditDetailOpen])

  const openAuditDetail = useMemoizedFn((row: SSHCommandAuditItem) => {
    if (!row.uid) return
    setAuditDetailUid(row.uid)
    setAuditDetailOpen(true)
  })

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
            <Button type='link' onClick={() => openAuditDetail(row)}>
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
                        list.refresh()
                      },
                    },
                    MENU_DIVIDER,
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
    [list, message, openAuditDetail, rejectForm, t],
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
      list.refresh()
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
          auditSearchParams={list.query}
          setAuditSearchParams={list.setQuery}
          auditPagination={list.pagination}
          auditColumns={auditColumns}
          audits={list.dataSource}
          auditLoading={list.loading}
          onSearch={list.search}
          onPageChange={list.changePage}
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
          loading={auditDetailLoading}
          onCancel={() => {
            setAuditDetailOpen(false)
            setAuditDetailUid(undefined)
          }}
        />
      </PageContent>
    </App>
  )
}

export default AuditsPage
