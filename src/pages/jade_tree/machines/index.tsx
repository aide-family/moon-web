import type { ClusterMachineInfoListParams, MachineInfoItem } from '@/api'
import { getClusterMachineInfoList, getMachineInfo } from '@/api'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import {
  DEFAULT_PAGE_SIZE,
  usePaginationState,
} from '@/utils/hooks/usePaginationState'
import { App, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useMemo, useState } from 'react'
import MachinesTab from './components/MachinesTab'
import MachineDetailModal from './components/modals/MachineDetailModal'

const formatTotal = (value?: string): number =>
  Number.parseInt(value ?? '0', 10) || 0

const MachinesPage: React.FC = () => {
  const { t } = useLocale()

  const [localMachine, setLocalMachine] = useState<MachineInfoItem>()
  const [clusterMachines, setClusterMachines] = useState<MachineInfoItem[]>([])
  const [machineLoading, setMachineLoading] = useState(false)
  const [machinePagination, setMachinePagination] = usePaginationState()
  const [machineSearchParams, setMachineSearchParams] =
    useState<ClusterMachineInfoListParams>({
      keywords: '',
      ip: '',
      hostname: '',
    })
  const [machineDetailOpen, setMachineDetailOpen] = useState(false)
  const [machineDetailData, setMachineDetailData] = useState<MachineInfoItem>()

  const fetchMachines = async (
    page = machinePagination.current,
    pageSize = machinePagination.pageSize,
    override?: Partial<ClusterMachineInfoListParams>,
  ) => {
    setMachineLoading(true)
    try {
      const effective = override
        ? { ...machineSearchParams, ...override }
        : machineSearchParams
      const [localResult, clusterResult] = await Promise.allSettled([
        getMachineInfo(),
        getClusterMachineInfoList({
          page,
          pageSize,
          keywords: effective.keywords || undefined,
          ip: effective.ip || undefined,
          hostname: effective.hostname || undefined,
        }),
      ])
      if (localResult.status === 'fulfilled') {
        setLocalMachine(localResult.value)
      } else {
        setLocalMachine(undefined)
      }
      if (clusterResult.status === 'fulfilled') {
        setClusterMachines(clusterResult.value.machines ?? [])
        setMachinePagination({
          current: page,
          pageSize,
          total: formatTotal(clusterResult.value.total),
        })
      } else {
        setClusterMachines([])
        setMachinePagination({ current: page, pageSize, total: 0 })
      }
    } catch (error) {
      console.error('获取机器信息失败', error)
      setLocalMachine(undefined)
      setClusterMachines([])
      setMachinePagination({ current: page, pageSize, total: 0 })
    } finally {
      setMachineLoading(false)
    }
  }

  useEffect(() => {
    void fetchMachines(1, DEFAULT_PAGE_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const machineColumns: ColumnsType<MachineInfoItem> = useMemo(
    () => [
      {
        title: t('jadeTree.machine.hostName'),
        dataIndex: ['host', 'hostName'],
        key: 'hostName',
        minWidth: 180,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.machine.localIp'),
        dataIndex: ['network', 'localIp'],
        key: 'localIp',
        width: 160,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.machine.os'),
        dataIndex: ['system', 'os'],
        key: 'os',
        width: 120,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.machine.version'),
        dataIndex: ['system', 'version'],
        key: 'version',
        width: 160,
        render: (v?: string) => v || '-',
      },
      {
        title: t('jadeTree.machine.kernel'),
        dataIndex: ['system', 'kernel'],
        key: 'kernel',
        minWidth: 180,
        render: (v?: string) => v || '-',
      },
      {
        title: t('table.action'),
        key: 'action',
        width: 120,
        fixed: 'right',
        align: 'center',
        render: (_, row) => (
          <Button
            type='link'
            size='small'
            onClick={() => {
              setMachineDetailData(row)
              setMachineDetailOpen(true)
            }}
          >
            {t('common.detail')}
          </Button>
        ),
      },
    ],
    [t],
  )

  return (
    <App className='h-full'>
      <PageContent>
        <MachinesTab
          localMachine={localMachine}
          clusterMachines={clusterMachines}
          machineLoading={machineLoading}
          machinePagination={machinePagination}
          machineSearchParams={machineSearchParams}
          setMachineSearchParams={setMachineSearchParams}
          machineColumns={machineColumns}
          onFetchMachines={fetchMachines}
        />

        <MachineDetailModal
          open={machineDetailOpen}
          data={machineDetailData}
          onCancel={() => setMachineDetailOpen(false)}
        />
      </PageContent>
    </App>
  )
}

export default MachinesPage
