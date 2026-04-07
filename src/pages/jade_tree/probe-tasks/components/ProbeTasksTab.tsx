import React from 'react'
import { Button, Form, Input, Radio, Select, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocale } from '@/contexts/LocaleContext'
import { ProbeTaskStatus, type ProbeTaskItem, type ProbeTaskListParams } from '@/api'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

interface ProbeTasksTabProps {
  probePagination: {
    current: number
    pageSize: number
    total: number
  }
  probeSearchParams: ProbeTaskListParams
  setProbeSearchParams: (
    value: ProbeTaskListParams | ((prev: ProbeTaskListParams) => ProbeTaskListParams),
  ) => void
  probeColumns: ColumnsType<ProbeTaskItem>
  probeTasks: ProbeTaskItem[]
  probeLoading: boolean
  onFetchProbeTasks: (
    page?: number,
    pageSize?: number,
    override?: Partial<ProbeTaskListParams>,
  ) => Promise<void> | void
  onCreate: () => void
}

const ProbeTasksTab: React.FC<ProbeTasksTabProps> = ({
  probePagination,
  probeSearchParams,
  setProbeSearchParams,
  probeColumns,
  probeTasks,
  probeLoading,
  onFetchProbeTasks,
  onCreate,
}) => {
  const { t } = useLocale()
  const [searchForm] = Form.useForm<ProbeTaskListParams>()
  const { tableContainerRef, tableWrapperRef, tableHeight } = useAdaptiveTableHeight([
    probeTasks,
    probePagination,
    probeSearchParams,
  ])

  return (
    <div className='h-full flex flex-col'>
      <div className='flex items-center justify-between mb-4 shrink-0'>
        <Form
          form={searchForm}
          layout='inline'
          initialValues={probeSearchParams}
          onValuesChange={(_, allValues) => {
            setProbeSearchParams((prev) => ({
              ...prev,
              keyword: allValues.keyword ?? '',
              type: allValues.type,
              status: allValues.status,
            }))
          }}
        >
          <Space size='middle' wrap>
            <span>{t('table.search.keyword')}:</span>
            <Form.Item name='keyword' className='mb-0'>
              <Input
                allowClear
                placeholder={t('table.search.placeholder')}
                onPressEnter={(e) =>
                  void onFetchProbeTasks(1, probePagination.pageSize, {
                    keyword: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Form.Item>
            <span>{t('table.search.type')}:</span>
            <Form.Item name='type' className='mb-0'>
              <Select
                allowClear
                style={{ width: 180 }}
                placeholder={t('jadeTree.probe.typePlaceholder')}
                options={[
                  { label: t('jadeTree.probe.type.tcp'), value: 'tcp' },
                  { label: t('jadeTree.probe.type.port'), value: 'port' },
                  { label: t('jadeTree.probe.type.http'), value: 'http' },
                  { label: t('jadeTree.probe.type.cert'), value: 'cert' },
                ]}
              />
            </Form.Item>
            <span>{t('common.status')}:</span>
            <Form.Item name='status' className='mb-0'>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
                <Radio.Button value={ProbeTaskStatus.ENABLED}>{t('common.status.ENABLED')}</Radio.Button>
                <Radio.Button value={ProbeTaskStatus.DISABLED}>{t('common.status.DISABLED')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Button type='primary' onClick={() => void onFetchProbeTasks(1, probePagination.pageSize)}>
              {t('common.search')}
            </Button>
            <Button
              onClick={() => {
                searchForm.resetFields()
                setProbeSearchParams({ keyword: '', type: undefined, status: undefined })
                void onFetchProbeTasks(1, probePagination.pageSize, {
                  keyword: '',
                  type: undefined,
                  status: undefined,
                })
              }}
            >
              {t('common.reset')}
            </Button>
          </Space>
        </Form>
        <Space>
          <Button type='primary' onClick={onCreate}>
            {t('common.add')}
          </Button>
        </Space>
      </div>
      <div ref={tableContainerRef} className='flex-1 flex overflow-hidden flex-col' style={{ minHeight: 0 }}>
        <div ref={tableWrapperRef} className='h-full flex flex-col flex-1'>
          <Table
            rowKey='uid'
            columns={probeColumns}
            dataSource={probeTasks}
            loading={probeLoading}
            size='small'
            scroll={{ y: tableHeight, x: '100%' }}
            pagination={{
              current: probePagination.current,
              pageSize: probePagination.pageSize,
              total: probePagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t('table.total', { total }),
              onChange: (current, pageSize) => void onFetchProbeTasks(current, pageSize),
              onShowSizeChange: (current, pageSize) => void onFetchProbeTasks(current, pageSize),
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ProbeTasksTab
