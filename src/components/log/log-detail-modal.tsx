import { LogActionTypeData, LogModuleTypeData } from '@/api/global'
import { LogItem } from '@/api/log'
import { Avatar, Descriptions, DescriptionsProps, Modal, theme } from 'antd'
import React from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'

const { useToken } = theme

interface LogDetailModalProps {
  open: boolean
  onCancel: () => void
  record: LogItem | null
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ open, onCancel, record }) => {
  const { theme } = useToken()

  if (!record) return null
  const {
    operator: { avatar, name, nickname }
  } = record

  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: '操作人',
      children: (
        <div className='flex items-center gap-2'>
          <Avatar src={avatar}>{(nickname || name).at(0)?.toUpperCase()}</Avatar>
          {nickname || name}
        </div>
      )
    },
    {
      key: '2',
      label: '数据ID',
      children: record.dataID
    },
    {
      key: '3',
      label: '模块',
      children: LogModuleTypeData[record.module]
    },
    {
      key: '4',
      label: '操作时间',
      children: record.operateTime
    },
    {
      key: '5',
      label: '操作',
      children: LogActionTypeData[record.action]
    }
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toJsonStr = (value: any) => {
    const result = JSON.stringify(value)
      .replaceAll(',', ',\n')
      .replaceAll('{', '{\n')
      .replaceAll('}', '\n}')
      .replaceAll('\\', '')
    // 清除两边的引号
    return result.slice(1, result.length - 1)
  }

  return (
    <Modal title='日志详情' open={open} onCancel={onCancel} footer={null} width='80%'>
      <div>
        <Descriptions bordered items={items} column={2} />
        <div className='mt-4'>
          <h3>变更对比</h3>
          <div className='h-[500px] overflow-auto'>
            <ReactDiffViewer
              oldValue={toJsonStr(record.before)}
              newValue={toJsonStr(record.after)}
              splitView
              compareMethod={DiffMethod.LINES}
              showDiffOnly={false}
              useDarkTheme={theme.id === 1}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default LogDetailModal
