import type { SSHCommandAuditItem, SSHCommandAuditListParams } from '@/api'
import { SSHCommandAuditKind, SSHCommandAuditStatus } from '@/api'
import { useLocale } from '@/contexts/LocaleContext'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'
import { Button, Form, Input, Radio, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'

interface AuditsTabProps {
  auditSearchParams: SSHCommandAuditListParams
  setAuditSearchParams: (
    value:
      | SSHCommandAuditListParams
      | ((prev: SSHCommandAuditListParams) => SSHCommandAuditListParams),
  ) => void
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
    override?: Partial<SSHCommandAuditListParams>,
  ) => Promise<void> | void
}

const AuditsTab: React.FC<AuditsTabProps> = ({
  auditSearchParams,
  setAuditSearchParams,
  auditPagination,
  auditColumns,
  audits,
  auditLoading,
  onFetchAudits,
}) => {
  const { t } = useLocale()
  const [searchForm] = Form.useForm<SSHCommandAuditListParams>()
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight([audits, auditPagination, auditSearchParams])
  const handleSearch = (override?: Partial<SSHCommandAuditListParams>) => {
    const values = searchForm.getFieldsValue()
    const nextParams: SSHCommandAuditListParams = {
      keyword: values.keyword ?? '',
      kind: values.kind,
      statusFilter: values.statusFilter,
      ...override,
    }
    setAuditSearchParams(nextParams)
    void onFetchAudits(1, auditPagination.pageSize, nextParams)
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='mb-4 shrink-0'>
        <Form
          form={searchForm}
          layout='inline'
          initialValues={auditSearchParams}
          onValuesChange={(_, allValues) => {
            setAuditSearchParams((prev) => ({
              ...prev,
              keyword: allValues.keyword ?? '',
              kind: allValues.kind,
              statusFilter: allValues.statusFilter,
            }))
          }}
        >
          <Space size='middle' wrap>
            <Form.Item
              label={t('table.search.keyword')}
              name='keyword'
              className='mb-0'
            >
              <Input
                allowClear
                placeholder={t('table.search.placeholder')}
                onPressEnter={(e) =>
                  handleSearch({
                    keyword: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Form.Item>
            <Form.Item
              label={t('jadeTree.audit.kind')}
              name='kind'
              className='mb-0'
            >
              <Radio.Group
                buttonStyle='solid'
                onChange={(e) => {
                  handleSearch({ kind: e.target.value as SSHCommandAuditKind | undefined })
                }}
              >
                <Radio.Button value={SSHCommandAuditKind.UNKNOWN}>
                  {t('jadeTree.audit.kind.UNKNOWN')}
                </Radio.Button>
                <Radio.Button value={SSHCommandAuditKind.CREATE}>
                  {t('jadeTree.audit.kind.CREATE')}
                </Radio.Button>
                <Radio.Button value={SSHCommandAuditKind.UPDATE}>
                  {t('jadeTree.audit.kind.UPDATE')}
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={t('common.status')}
              name='statusFilter'
              className='mb-0'
            >
              <Radio.Group
                buttonStyle='solid'
                onChange={(e) => {
                  handleSearch({
                    statusFilter: e.target.value as SSHCommandAuditStatus | undefined,
                  })
                }}
              >
                <Radio.Button value={undefined}>
                  {t('table.search.all')}
                </Radio.Button>
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
            </Form.Item>
            <Button
              type='primary'
              onClick={() => {
                handleSearch()
              }}
            >
              {t('common.search')}
            </Button>
            <Button
              onClick={() => {
                searchForm.resetFields()
                handleSearch({
                  keyword: '',
                  kind: undefined,
                  statusFilter: undefined,
                })
              }}
            >
              {t('common.reset')}
            </Button>
          </Space>
        </Form>
      </div>
      <div
        ref={tableContainerRef}
        className='flex-1 flex overflow-hidden flex-col'
        style={{ minHeight: 0 }}
      >
        <div ref={tableWrapperRef} className='h-full flex flex-col flex-1'>
          <Table
            rowKey='uid'
            columns={auditColumns}
            dataSource={audits}
            loading={auditLoading}
            size='small'
            scroll={{ y: tableHeight, x: '100%' }}
            pagination={{
              current: auditPagination.current,
              pageSize: auditPagination.pageSize,
              total: auditPagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t('table.total', { total }),
              onChange: (current, pageSize) =>
                void onFetchAudits(current, pageSize),
              onShowSizeChange: (current, pageSize) =>
                void onFetchAudits(current, pageSize),
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AuditsTab
