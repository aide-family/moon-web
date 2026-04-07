import React from 'react'
import { Button, Card, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocale } from '@/contexts/LocaleContext'
import type { MachineInfoItem } from '@/api'

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
  onReportLocalMachine: () => void
}

const MachinesTab: React.FC<MachinesTabProps> = ({
  localMachine,
  clusterMachines,
  machineLoading,
  machinePagination,
  machineColumns,
  onFetchMachines,
  onReportLocalMachine,
}) => {
  const { t } = useLocale()
  return (
    <>
      <Card className='mb-4' title={t('jadeTree.machine.local')}>
        <Space size='large' wrap>
          <span>
            {t('jadeTree.machine.hostName')}: {localMachine?.host?.hostName || '-'}
          </span>
          <span>
            {t('jadeTree.machine.localIp')}: {localMachine?.network?.localIp || '-'}
          </span>
          <span>
            {t('jadeTree.machine.os')}: {localMachine?.system?.os || '-'}
          </span>
          <span>
            {t('jadeTree.machine.kernel')}: {localMachine?.system?.kernel || '-'}
          </span>
          <Button type='primary' onClick={onReportLocalMachine}>
            {t('jadeTree.machine.report')}
          </Button>
        </Space>
      </Card>
      <Table
        rowKey={(row) =>
          `${row.host?.machineUuid || ''}-${row.network?.localIp || ''}`
        }
        columns={machineColumns}
        dataSource={clusterMachines}
        loading={machineLoading}
        pagination={{
          current: machinePagination.current,
          pageSize: machinePagination.pageSize,
          total: machinePagination.total,
          showSizeChanger: true,
          showTotal: (total) => t('table.total', { total }),
          onChange: (current, pageSize) => void onFetchMachines(current, pageSize),
        }}
      />
    </>
  )
}

export default MachinesTab
