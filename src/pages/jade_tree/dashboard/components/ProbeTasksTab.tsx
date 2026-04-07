import React from 'react'
import { Button, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocale } from '@/contexts/LocaleContext'
import type { ProbeTaskItem } from '@/api'

interface ProbeTasksTabProps {
  probePagination: {
    current: number
    pageSize: number
    total: number
  }
  probeColumns: ColumnsType<ProbeTaskItem>
  probeTasks: ProbeTaskItem[]
  probeLoading: boolean
  onFetchProbeTasks: (page?: number, pageSize?: number) => Promise<void> | void
  onCreate: () => void
}

const ProbeTasksTab: React.FC<ProbeTasksTabProps> = ({
  probePagination,
  probeColumns,
  probeTasks,
  probeLoading,
  onFetchProbeTasks,
  onCreate,
}) => {
  const { t } = useLocale()
  return (
    <>
      <Space className='mb-4'>
        <Button type='primary' onClick={onCreate}>
          {t('common.add')}
        </Button>
      </Space>
      <Table
        rowKey='uid'
        columns={probeColumns}
        dataSource={probeTasks}
        loading={probeLoading}
        pagination={{
          current: probePagination.current,
          pageSize: probePagination.pageSize,
          total: probePagination.total,
          showSizeChanger: true,
          showTotal: (total) => t('table.total', { total }),
          onChange: (current, pageSize) => void onFetchProbeTasks(current, pageSize),
        }}
      />
    </>
  )
}

export default ProbeTasksTab
