import { Pagination, Table, TableProps } from 'antd'
import { ColumnGroupType, ColumnType } from 'antd/es/table'
import React from 'react'
import styles from './index.module.scss'
export type AutoTableColumnType<T> = ColumnType<T> | ColumnGroupType<T>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AutoTableProps<T = any> extends TableProps<T> {
  columns: AutoTableColumnType<T>[]
  dataSource: T[]
  total: number
  handleTurnPage?: (e: number, size: number) => void
  showQuickJumper?: boolean
  onShowSizeChange?: () => Promise<T[]>
  showSizeChanger?: boolean
  selectedRowKey?: string
  pageSize: number
  pageNum: number
  style?: React.CSSProperties
  size?: 'large' | 'middle' | 'small'
}

export const AutoTable: React.FC<AutoTableProps> = (props) => {
  const {
    columns,
    dataSource,
    total,
    pageSize,
    pageNum,
    handleTurnPage,
    showQuickJumper,
    showSizeChanger,
    onShowSizeChange,
    style
  } = props

  const showTotal = (total: number) => {
    return `共 ${total} 条`
  }

  return (
    <div className={styles.a_table}>
      <Table {...props} columns={columns} dataSource={dataSource} pagination={false} style={style} />
      {total > 0 && (
        <Pagination
          className='text-right p-0 inline-block w-full'
          total={total}
          onChange={(e, size) => handleTurnPage?.(e, size)}
          pageSize={pageSize}
          defaultCurrent={1}
          current={pageNum}
          showQuickJumper={showQuickJumper}
          showSizeChanger={showSizeChanger} // 是否展示切换size 大于50时默认为true，写死
          onShowSizeChange={onShowSizeChange}
          showTotal={showTotal}
        />
      )}
    </div>
  )
}
export default AutoTable
