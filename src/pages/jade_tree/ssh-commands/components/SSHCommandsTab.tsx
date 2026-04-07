import React from 'react'
import { Button, Input, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocale } from '@/contexts/LocaleContext'
import type { SSHCommandItem } from '@/api'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

interface SSHCommandsTabProps {
  sshKeyword: string
  setSSHKeyword: (value: string) => void
  sshPagination: {
    current: number
    pageSize: number
    total: number
  }
  sshColumns: ColumnsType<SSHCommandItem>
  sshCommands: SSHCommandItem[]
  sshLoading: boolean
  onSearch: (page: number, pageSize: number, keyword: string) => Promise<void> | void
  onCreate: () => void
}

const SSHCommandsTab: React.FC<SSHCommandsTabProps> = ({
  sshKeyword,
  setSSHKeyword,
  sshPagination,
  sshColumns,
  sshCommands,
  sshLoading,
  onSearch,
  onCreate,
}) => {
  const { t } = useLocale()
  const { tableContainerRef, tableWrapperRef, tableHeight } = useAdaptiveTableHeight([
    sshCommands,
    sshPagination,
  ])

  return (
    <div className='h-full flex flex-col'>
      <Space className='mb-4'>
        <Input
          allowClear
          value={sshKeyword}
          onChange={(e) => setSSHKeyword(e.target.value)}
          onPressEnter={(e) => {
            const value = (e.target as HTMLInputElement).value
            setSSHKeyword(value)
            void onSearch(1, sshPagination.pageSize, value)
          }}
          placeholder={t('jadeTree.command.searchPlaceholder')}
          style={{ width: 260 }}
        />
        <Button type='primary' onClick={() => void onSearch(1, sshPagination.pageSize, sshKeyword)}>
          {t('common.search')}
        </Button>
        <Button onClick={onCreate} type='primary'>
          {t('common.add')}
        </Button>
      </Space>
      <div ref={tableContainerRef} className='flex-1 flex overflow-hidden flex-col' style={{ minHeight: 0 }}>
        <div ref={tableWrapperRef} className='h-full flex flex-col flex-1'>
          <Table
            rowKey='uid'
            columns={sshColumns}
            dataSource={sshCommands}
            loading={sshLoading}
            size='small'
            scroll={{ y: tableHeight, x: '100%' }}
            pagination={{
              current: sshPagination.current,
              pageSize: sshPagination.pageSize,
              total: sshPagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t('table.total', { total }),
              onChange: (current, pageSize) => void onSearch(current, pageSize, sshKeyword),
              onShowSizeChange: (current, pageSize) => void onSearch(current, pageSize, sshKeyword),
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SSHCommandsTab
