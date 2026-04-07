import React from 'react'
import { Radio, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocale } from '@/contexts/LocaleContext'
import type { SSHCommandAuditItem } from '@/api'
import { SSHCommandAuditStatus } from '@/api'

interface AuditsTabProps {
  auditStatusFilter?: SSHCommandAuditStatus
  setAuditStatusFilter: (value: SSHCommandAuditStatus | undefined) => void
  auditPagination: {
    current: number
    pageSize: number
    total: number
  }
  auditColumns: ColumnsType<SSHCommandAuditItem>
  audits: SSHCommandAuditItem[]
  auditLoading: boolean
  onFetchAudits: (
    page?: number,
    pageSize?: number,
    statusFilter?: SSHCommandAuditStatus,
  ) => Promise<void> | void
}

const AuditsTab: React.FC<AuditsTabProps> = ({
  auditStatusFilter,
  setAuditStatusFilter,
  auditPagination,
  auditColumns,
  audits,
  auditLoading,
  onFetchAudits,
}) => {
  const { t } = useLocale()
  return (
    <>
      <Space className='mb-4'>
        <span>{t('common.status')}:</span>
        <Radio.Group
          value={auditStatusFilter}
          onChange={(e) => {
            setAuditStatusFilter(e.target.value)
            void onFetchAudits(1, auditPagination.pageSize, e.target.value)
          }}
        >
          <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
          <Radio.Button value={SSHCommandAuditStatus.PENDING}>
            {t('jadeTree.audit.status.PENDING')}
          </Radio.Button>
          <Radio.Button value={SSHCommandAuditStatus.APPROVED}>
            {t('jadeTree.audit.status.APPROVED')}
          </Radio.Button>
          <Radio.Button value={SSHCommandAuditStatus.REJECTED}>
            {t('jadeTree.audit.status.REJECTED')}
          </Radio.Button>
        </Radio.Group>
      </Space>
      <Table
        rowKey='uid'
        columns={auditColumns}
        dataSource={audits}
        loading={auditLoading}
        pagination={{
          current: auditPagination.current,
          pageSize: auditPagination.pageSize,
          total: auditPagination.total,
          showSizeChanger: true,
          showTotal: (total) => t('table.total', { total }),
          onChange: (current, pageSize) =>
            void onFetchAudits(current, pageSize, auditStatusFilter),
        }}
      />
    </>
  )
}

export default AuditsTab
