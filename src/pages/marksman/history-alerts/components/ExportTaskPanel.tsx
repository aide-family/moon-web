import type { HistoryAlertExportTaskItem } from '@/api/marksman/alert'
import {
  cancelHistoryAlertExportTask,
  downloadHistoryAlertExportTask,
} from '@/api/marksman/alert'
import { useLocale } from '@/contexts/LocaleContext'
import {
  EXPORT_TASK_STATUS_COLORS,
  EXPORT_TASK_STATUS_LABEL_KEYS,
  getExportTaskDetail,
  isExportTaskActive,
  isExportTaskCompleted,
  normalizeExportTaskStatus,
} from '../exportTaskHelpers'
import { App, Button, Drawer, Progress, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useMemoizedFn, useSafeState } from 'ahooks'

export interface ExportTaskPanelProps {
  open: boolean
  onClose: () => void
  tasks: HistoryAlertExportTaskItem[]
  loading: boolean
  onRefresh: () => void | Promise<void>
}

export function ExportTaskPanel({
  open,
  onClose,
  tasks,
  loading,
  onRefresh,
}: ExportTaskPanelProps) {
  const { message } = App.useApp()
  const { t } = useLocale()
  const [actionUid, setActionUid] = useSafeState<string | null>(null)

  useEffect(() => {
    if (open) {
      void onRefresh()
    }
  }, [open, onRefresh])

  const handleCancel = useMemoizedFn(async (uid?: string) => {
    if (!uid) return
    setActionUid(uid)
    try {
      await cancelHistoryAlertExportTask(uid)
      message.success(t('historyAlert.exportTask.message.cancel.success'))
      await onRefresh()
    } catch (error) {
      console.error('取消导出任务失败:', error)
    } finally {
      setActionUid(null)
    }
  })

  const handleDownload = useMemoizedFn(
    async (record: HistoryAlertExportTaskItem) => {
      if (!record.uid) return
      setActionUid(record.uid)
      try {
        await downloadHistoryAlertExportTask(
          record.uid,
          record.fileName || `history-alerts-${record.uid}.csv`,
        )
      } catch (error) {
        console.error('下载导出文件失败:', error)
        message.error(t('historyAlert.exportTask.message.download.failed'))
      } finally {
        setActionUid(null)
      }
    },
  )

  const columns: ColumnsType<HistoryAlertExportTaskItem> = [
    {
      title: t('historyAlert.exportTask.table.createdAt'),
      dataIndex: 'createdAt',
      width: 170,
      render: (value: string) =>
        value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: t('historyAlert.exportTask.table.status'),
      dataIndex: 'status',
      width: 100,
      render: (status: HistoryAlertExportTaskItem['status']) => {
        const normalized = normalizeExportTaskStatus(status)
        const labelKey =
          EXPORT_TASK_STATUS_LABEL_KEYS[normalized] ??
          'historyAlert.exportTask.status.inProgress'
        const color = EXPORT_TASK_STATUS_COLORS[normalized] ?? 'default'
        return <Tag color={color}>{t(labelKey)}</Tag>
      },
    },
    {
      title: t('historyAlert.exportTask.table.progress'),
      key: 'progress',
      width: 180,
      render: (_, record) => {
        const total = parseInt(String(record.totalRows ?? '0'), 10)
        const processed = parseInt(String(record.processedRows ?? '0'), 10)
        if (!isExportTaskActive(record.status) && total <= 0) {
          return '-'
        }
        const percent =
          total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0
        return (
          <Progress
            size='small'
            percent={percent}
            format={() => `${processed}/${total || '?'}`}
          />
        )
      },
    },
    {
      title: t('historyAlert.exportTask.table.detail'),
      key: 'detail',
      ellipsis: true,
      render: (_, record) => getExportTaskDetail(record),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => {
        const uid = record.uid
        const loadingAction = actionUid === uid
        const status = normalizeExportTaskStatus(record.status)
        return (
          <Space size='small'>
            {isExportTaskCompleted(status) ? (
              <Button
                type='link'
                size='small'
                loading={loadingAction}
                onClick={() => void handleDownload(record)}
              >
                {t('historyAlert.exportTask.action.download')}
              </Button>
            ) : null}
            {isExportTaskActive(status) ? (
              <Button
                type='link'
                size='small'
                danger
                loading={loadingAction}
                onClick={() => void handleCancel(uid)}
              >
                {t('common.cancel')}
              </Button>
            ) : null}
          </Space>
        )
      },
    },
  ]

  return (
    <Drawer
      title={t('historyAlert.exportTask.title')}
      open={open}
      onClose={onClose}
      size={920}
      destroyOnHidden={false}
      extra={
        <Button onClick={() => void onRefresh()} loading={loading}>
          {t('historyAlert.exportTask.action.refresh')}
        </Button>
      }
    >
      <Table
        rowKey='uid'
        size='small'
        loading={loading}
        columns={columns}
        dataSource={tasks}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </Drawer>
  )
}
