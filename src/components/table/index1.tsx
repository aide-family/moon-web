import { Table, TableProps } from 'antd'
import { ColumnGroupType, ColumnType } from 'antd/es/table'
import React from 'react'

export type AutoTableColumnType<T> = ColumnType<T> | ColumnGroupType<T>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AutoTableProps<T = any> extends TableProps {
  columns: AutoTableColumnType<T>[]
  dataSource: T[]
  request?: () => Promise<T[]>
  // 是否显示序号
  index?: boolean | ((index: number) => React.ReactNode)
  // 是否显示操作列
  operator?: (record: T) => React.ReactNode
}

export const AutoTable: React.FC<AutoTableProps> = (props) => {
  const { columns, dataSource } = props

  return <Table {...props} columns={columns} dataSource={dataSource} />
}
