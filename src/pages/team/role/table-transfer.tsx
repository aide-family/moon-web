import { ResourceItem } from '@/api/model-types'
import type { GetProp, TableColumnsType, TableProps, TransferProps } from 'antd'
import { Table, Transfer } from 'antd'
import React from 'react'

type TransferItem = GetProp<TransferProps, 'dataSource'>[number]
type TableRowSelection<T extends object> = TableProps<T>['rowSelection']

export interface TableTransferProps extends TransferProps<TransferItem> {}

// Customize Table Transfer
export const TableTransfer: React.FC<TransferProps<TransferItem>> = (props) => {
  return (
    <Transfer style={{ width: '100%' }} {...props}>
      {({ filteredItems, onItemSelect, onItemSelectAll, selectedKeys: listSelectedKeys, disabled: listDisabled }) => {
        const rowSelection: TableRowSelection<TransferItem> = {
          getCheckboxProps: () => ({ disabled: listDisabled }),
          onChange(selectedRowKeys) {
            onItemSelectAll(selectedRowKeys, 'replace')
          },
          selectedRowKeys: listSelectedKeys,
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
        }

        return (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size='small'
            pagination={false}
            scroll={{ y: 300 }}
            style={{ pointerEvents: listDisabled ? 'none' : undefined }}
            onRow={({ key }) => ({
              onClick: () => {
                if (listDisabled) {
                  return
                }
                onItemSelect(key, !listSelectedKeys.includes(key))
              }
            })}
          />
        )
      }}
    </Transfer>
  )
}

export const columns: TableColumnsType<ResourceItem> = [
  {
    dataIndex: 'name',
    title: '资源名称'
  },
  {
    dataIndex: 'path',
    title: '资源地址'
  }
]

export const filterOption = (input: string, item: ResourceItem) =>
  item.name?.includes(input) || item.path?.includes(input)
