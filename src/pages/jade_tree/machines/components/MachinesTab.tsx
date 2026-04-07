import React from 'react'
import { Card, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocale } from '@/contexts/LocaleContext'
import type { MachineInfoItem } from '@/api'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

interface MachinesTabProps {
  localMachine?: MachineInfoItem
  clusterMachines: MachineInfoItem[]
  machineLoading: boolean
  machinePagination: {
    current: number
    pageSize: number
    total: number
  }
  machineColumns: ColumnsType<MachineInfoItem>
  onFetchMachines: (page?: number, pageSize?: number) => Promise<void> | void
}

const MachinesTab: React.FC<MachinesTabProps> = ({
  localMachine,
  clusterMachines,
  machineLoading,
  machinePagination,
  machineColumns,
  onFetchMachines,
}) => {
  const { t } = useLocale()
  const { tableContainerRef, tableWrapperRef, tableHeight } = useAdaptiveTableHeight([
    clusterMachines,
    machinePagination,
  ])

  return (
    <div className='h-full flex flex-col'>
      {localMachine ? (
        <Card className='mb-8' title={t('jadeTree.machine.local')}>
          <Space size='large' wrap>
            <span>{t('jadeTree.machine.hostName')}: {localMachine.host?.hostName || '-'}</span>
            <span>{t('jadeTree.machine.localIp')}: {localMachine.network?.localIp || '-'}</span>
            <span>{t('jadeTree.machine.os')}: {localMachine.system?.os || '-'}</span>
            <span>{t('jadeTree.machine.kernel')}: {localMachine.system?.kernel || '-'}</span>
          </Space>
        </Card>
      ) : null}
      <div ref={tableContainerRef} className='flex-1 flex overflow-hidden flex-col' style={{ minHeight: 0 }}>
        <div ref={tableWrapperRef} className='h-full flex flex-col flex-1'>
          <Table
            rowKey={(row) => `${row.host?.machineUuid || ''}-${row.network?.localIp || ''}`}
            columns={machineColumns}
            dataSource={clusterMachines}
            loading={machineLoading}
            size='small'
            scroll={{ y: tableHeight, x: '100%' }}
            pagination={{
              current: machinePagination.current,
              pageSize: machinePagination.pageSize,
              total: machinePagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t('table.total', { total }),
              onChange: (current, pageSize) => void onFetchMachines(current, pageSize),
              onShowSizeChange: (current, pageSize) => void onFetchMachines(current, pageSize),
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MachinesTab
