import React from 'react'
import { Button, Card, Form, Input, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocale } from '@/contexts/LocaleContext'
import type { ClusterMachineInfoListParams, MachineInfoItem } from '@/api'
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
  machineSearchParams: ClusterMachineInfoListParams
  setMachineSearchParams: (
    value:
      | ClusterMachineInfoListParams
      | ((prev: ClusterMachineInfoListParams) => ClusterMachineInfoListParams),
  ) => void
  machineColumns: ColumnsType<MachineInfoItem>
  onFetchMachines: (
    page?: number,
    pageSize?: number,
    override?: Partial<ClusterMachineInfoListParams>,
  ) => Promise<void> | void
}

const MachinesTab: React.FC<MachinesTabProps> = ({
  localMachine,
  clusterMachines,
  machineLoading,
  machinePagination,
  machineSearchParams,
  setMachineSearchParams,
  machineColumns,
  onFetchMachines,
}) => {
  const { t } = useLocale()
  const [searchForm] = Form.useForm<ClusterMachineInfoListParams>()
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()

  const handleSearch = (override?: Partial<ClusterMachineInfoListParams>) => {
    const values = searchForm.getFieldsValue()
    const nextParams: ClusterMachineInfoListParams = {
      keywords: values.keywords ?? '',
      ip: values.ip ?? '',
      hostname: values.hostname ?? '',
      ...override,
    }
    setMachineSearchParams(nextParams)
    void onFetchMachines(1, machinePagination.pageSize, nextParams)
  }

  return (
    <div className='h-full flex flex-col'>
      {localMachine ? (
        <Card className='mb-8' title={t('jadeTree.machine.local')}>
          <Space size='large' wrap>
            <span>
              {t('jadeTree.machine.hostName')}:{' '}
              {localMachine.host?.hostName || '-'}
            </span>
            <span>
              {t('jadeTree.machine.localIp')}:{' '}
              {localMachine.network?.localIp || '-'}
            </span>
            <span>
              {t('jadeTree.machine.os')}: {localMachine.system?.os || '-'}
            </span>
            <span>
              {t('jadeTree.machine.kernel')}:{' '}
              {localMachine.system?.kernel || '-'}
            </span>
          </Space>
        </Card>
      ) : null}
      <div className='m-4 shrink-0'>
        <Form
          form={searchForm}
          layout='inline'
          initialValues={machineSearchParams}
          onValuesChange={(_, allValues) => {
            setMachineSearchParams((prev) => ({
              ...prev,
              keywords: allValues.keywords ?? '',
              ip: allValues.ip ?? '',
              hostname: allValues.hostname ?? '',
            }))
          }}
        >
          <Space size='middle' wrap>
            <Form.Item
              label={t('table.search.keyword')}
              name='keywords'
              className='mb-0'
            >
              <Input
                allowClear
                placeholder={t('table.search.placeholder')}
                onPressEnter={(e) =>
                  handleSearch({
                    keywords: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Form.Item>
            <Form.Item
              label={t('jadeTree.machine.localIp')}
              name='ip'
              className='mb-0'
            >
              <Input
                allowClear
                placeholder={t('table.search.placeholder')}
                onPressEnter={(e) =>
                  handleSearch({
                    ip: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Form.Item>
            <Form.Item
              label={t('jadeTree.machine.hostName')}
              name='hostname'
              className='mb-0'
            >
              <Input
                allowClear
                placeholder={t('table.search.placeholder')}
                onPressEnter={(e) =>
                  handleSearch({
                    hostname: (e.target as HTMLInputElement).value,
                  })
                }
              />
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
                  keywords: '',
                  ip: '',
                  hostname: '',
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
            rowKey={(row) =>
              `${row.host?.machineUuid || ''}-${row.network?.localIp || ''}`
            }
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
              onChange: (current, pageSize) =>
                void onFetchMachines(current, pageSize),
              onShowSizeChange: (current, pageSize) =>
                void onFetchMachines(current, pageSize),
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MachinesTab
