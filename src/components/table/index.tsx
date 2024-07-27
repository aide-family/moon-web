import React from 'react'
import { Table, TableProps, Pagination } from 'antd'
import { ColumnGroupType, ColumnType } from 'antd/es/table'
import styles from "./index.module.scss"
export type AutoTableColumnType<T> = ColumnType<T> | ColumnGroupType<T>
export interface AutoTableProps<T = any> extends TableProps {
  columns: AutoTableColumnType<T>[]
  dataSource: T[]
  total: number,
  handleTurnPage: () => Promise<T[]>,
  showQuickJumper? : boolean,
  onShowSizeChange?:  () => Promise<T[]>,
  selectedRowKey?: string,
  style?: any,
  size?: string | number
}

export const AutoTable: React.FC<AutoTableProps> = (props) => {
  const { columns, dataSource, total, pageSize, pageNum,handleTurnPage, showQuickJumper, showSizeChanger, onShowSizeChange, selectedRowKey, style } = props

  const getRowClassName = (record: any, index: number) => {
    if (index % 2 !== 0) {
      return `gray`;
    }
  };
  const showTotal = (total: number) => {
    return `共 ${total} 条`;
  }
  return <div className={styles.a_table}>
    <Table
      {...props}
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      rowClassName={getRowClassName}
      style={style}
    />
    {
      total > 0 &&  <Pagination
      total={total}
      onChange={(e,size) => handleTurnPage(e, size)}
      pageSize={pageSize}
      defaultCurrent={1}
      current={pageNum}
      showQuickJumper={showQuickJumper}
      showSizeChanger={showSizeChanger} // 是否展示切换size 大于50时默认为true，写死
      onShowSizeChange = {onShowSizeChange}
      showTotal={showTotal}
      ></Pagination>
    }
  </div>
}
export default AutoTable
