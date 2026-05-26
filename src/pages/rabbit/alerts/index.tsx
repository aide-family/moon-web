import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App,
  Button,
  Descriptions,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import CopyButton from '@/components/CopyButton'
import { formatRecordJson } from '@/components/KeyValueEditor'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder } from '@/utils/marksman'
import {
  getAlertRecordDetail,
  getAlertRecordList,
  type AlertRecordItem,
  type ListAlertRecordsParams,
} from '@/api/rabbit/alert'

const { Search } = Input
const { Text } = Typography

const ALERT_STATUS_COLORS: Record<string, string> = {
  firing: 'error',
  resolved: 'success',
}

const defaultSearchParams: ListAlertRecordsParams = {
  keyword: '',
  fingerprint: '',
  status: undefined,
}

export default function AlertsPage() {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<AlertRecordItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [searchParams, setSearchParams] =
    useState<ListAlertRecordsParams>(defaultSearchParams)
  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<AlertRecordItem | null>(null)

  const statusOptions = useMemo(
    () => [
      { label: t('table.search.all'), value: '' },
      { label: t('alertRecord.status.firing'), value: 'firing' },
      { label: t('alertRecord.status.resolved'), value: 'resolved' },
    ],
    [t],
  )

  const fetchData = useCallback(
    async (
      page?: number,
      pageSize?: number,
      override?: Partial<ListAlertRecordsParams>,
    ) => {
      setLoading(true)
      try {
        const currentPagination = paginationRef.current
        const currentPage = page ?? currentPagination.current
        const currentPageSize = pageSize ?? currentPagination.pageSize
        const effective = override
          ? { ...searchParams, ...override }
          : searchParams
        const response = await getAlertRecordList({
          page: currentPage,
          pageSize: currentPageSize,
          keyword: effective.keyword || undefined,
          fingerprint: effective.fingerprint || undefined,
          status: effective.status || undefined,
        })
        setDataSource(response.items ?? [])
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(String(response.total ?? 0), 10),
        }))
      } catch (error) {
        console.error('获取告警归档列表失败:', error)
        setDataSource([])
      } finally {
        setLoading(false)
      }
    },
    [searchParams],
  )

  useEffect(() => {
    void fetchData(1, pagination.pageSize)
  }, [fetchData, pagination.pageSize])

  const handleSearch = (override?: Partial<ListAlertRecordsParams>) => {
    if (override) {
      setSearchParams((prev) => ({ ...prev, ...override }))
    }
    void fetchData(1, pagination.pageSize, override)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    void fetchData(1, pagination.pageSize, defaultSearchParams)
  }

  const openDetailModal = async (record: AlertRecordItem) => {
    if (!record.uid) return
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailData(null)
    try {
      const detail = await getAlertRecordDetail(record.uid)
      setDetailData(detail)
    } catch (error) {
      console.error('获取告警归档详情失败:', error)
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const columns: ColumnsType<AlertRecordItem> = [
    {
      title: t('alertRecord.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (value?: string) => (
        <Tag color={ALERT_STATUS_COLORS[value ?? ''] ?? 'default'}>
          {t(`alertRecord.status.${value || 'unknown'}`)}
        </Tag>
      ),
    },
    {
      title: t('alertRecord.table.alertname'),
      key: 'alertname',
      minWidth: 180,
      render: (_, record) => emptyPlaceholder(record.labels?.alertname),
    },
    {
      title: t('alertRecord.table.summary'),
      key: 'summary',
      minWidth: 220,
      render: (_, record) =>
        emptyPlaceholder(
          record.annotations?.summary ||
            record.annotations?.description ||
            record.fingerprint,
        ),
    },
    {
      title: t('alertRecord.table.source'),
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: emptyPlaceholder,
    },
    {
      title: t('alertRecord.table.receiver'),
      dataIndex: 'receiver',
      key: 'receiver',
      width: 120,
      render: emptyPlaceholder,
    },
    {
      title: t('alertRecord.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      render: emptyPlaceholder,
    },
    {
      title: t('alertRecord.table.fingerprint'),
      dataIndex: 'fingerprint',
      key: 'fingerprint',
      minWidth: 220,
      render: emptyPlaceholder,
    },
    {
      title: t('alertRecord.table.groupKey'),
      dataIndex: 'groupKey',
      key: 'groupKey',
      minWidth: 220,
      render: emptyPlaceholder,
    },
    {
      title: t('alertRecord.table.startsAt'),
      dataIndex: 'startsAt',
      key: 'startsAt',
      width: 180,
      render: (value?: string) =>
        value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: t('alertRecord.table.endsAt'),
      dataIndex: 'endsAt',
      key: 'endsAt',
      width: 180,
      render: (value?: string) =>
        value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: t('alertRecord.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value?: string) =>
        value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button type='link' onClick={() => void openDetailModal(record)}>
          {t('common.detail')}
        </Button>
      ),
    },
  ]

  return (
    <App className='h-full'>
      <PageContent>
        <div className='flex flex-col gap-4 h-full'>
          <div className='flex items-center justify-between gap-3 flex-wrap'>
            <Space wrap>
              <Search
                value={searchParams.keyword}
                placeholder={t('alertRecord.search.keyword')}
                allowClear
                style={{ width: 240 }}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    keyword: e.target.value,
                  }))
                }
                onSearch={(value) => handleSearch({ keyword: value })}
              />
              <Input
                value={searchParams.fingerprint}
                placeholder={t('alertRecord.search.fingerprint')}
                allowClear
                style={{ width: 260 }}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    fingerprint: e.target.value,
                  }))
                }
                onPressEnter={() =>
                  handleSearch({ fingerprint: searchParams.fingerprint })
                }
              />
              <Select
                value={searchParams.status ?? ''}
                options={statusOptions}
                style={{ width: 180 }}
                onChange={(value) =>
                  handleSearch({ status: value || undefined })
                }
              />
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
          </div>

          <Table<AlertRecordItem>
            rowKey='uid'
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 1400 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={(page) =>
              void fetchData(page.current, page.pageSize, searchParams)
            }
          />
        </div>

        <Modal
          title={t('alertRecord.modal.detail.title')}
          open={detailOpen}
          onCancel={() => {
            setDetailOpen(false)
            setDetailData(null)
          }}
          footer={
            <Button onClick={() => setDetailOpen(false)}>
              {t('common.close')}
            </Button>
          }
          width={960}
          destroyOnHidden
        >
          {detailLoading ? null : detailData ? (
            <Descriptions
              column={1}
              bordered
              size='small'
              styles={{ label: { width: 180, minWidth: 180 } }}
            >
              <Descriptions.Item label={t('alertRecord.detail.uid')}>
                <Space>
                  <span>{emptyPlaceholder(detailData.uid)}</span>
                  <CopyButton copyValue={detailData.uid} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.status')}>
                <Tag
                  color={
                    ALERT_STATUS_COLORS[detailData.status ?? ''] ?? 'default'
                  }
                >
                  {t(`alertRecord.status.${detailData.status || 'unknown'}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.source')}>
                {emptyPlaceholder(detailData.source)}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.receiver')}>
                {emptyPlaceholder(detailData.receiver)}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.alertname')}>
                {emptyPlaceholder(detailData.labels?.alertname)}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.summary')}>
                {emptyPlaceholder(detailData.annotations?.summary)}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.description')}>
                {emptyPlaceholder(detailData.annotations?.description)}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.fingerprint')}>
                <Space>
                  <span>{emptyPlaceholder(detailData.fingerprint)}</span>
                  <CopyButton copyValue={detailData.fingerprint} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.groupKey')}>
                <Space>
                  <span>{emptyPlaceholder(detailData.groupKey)}</span>
                  <CopyButton copyValue={detailData.groupKey} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.generatorURL')}>
                <Space>
                  <span className='break-all'>
                    {emptyPlaceholder(detailData.generatorURL)}
                  </span>
                  <CopyButton copyValue={detailData.generatorURL} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.startsAt')}>
                {detailData.startsAt
                  ? dayjs(detailData.startsAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.endsAt')}>
                {detailData.endsAt
                  ? dayjs(detailData.endsAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.labels')}>
                {detailData.labels &&
                Object.keys(detailData.labels).length > 0 ? (
                  <div className='flex flex-col gap-2'>
                    <Space wrap size={[4, 4]}>
                      {Object.entries(detailData.labels).map(([key, value]) => (
                        <Tag key={key}>{`${key}=${value}`}</Tag>
                      ))}
                    </Space>
                    <CopyButton
                      copyValue={formatRecordJson(detailData.labels)}
                      className='self-start'
                    />
                  </div>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.annotations')}>
                {detailData.annotations &&
                Object.keys(detailData.annotations).length > 0 ? (
                  <div className='flex flex-col gap-2'>
                    <Space wrap size={[4, 4]}>
                      {Object.entries(detailData.annotations).map(
                        ([key, value]) => (
                          <Tag key={key} color='cyan'>{`${key}=${value}`}</Tag>
                        ),
                      )}
                    </Space>
                    <CopyButton
                      copyValue={formatRecordJson(detailData.annotations)}
                      className='self-start'
                    />
                  </div>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.raw')}>
                <div className='flex flex-col gap-2'>
                  <CopyButton
                    copyValue={detailData.raw}
                    className='self-start'
                  />
                  <pre className='m-0 whitespace-pre-wrap break-all max-h-72 overflow-auto'>
                    {detailData.raw || '-'}
                  </pre>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.createdAt')}>
                {detailData.createdAt
                  ? dayjs(detailData.createdAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('alertRecord.detail.updatedAt')}>
                {detailData.updatedAt
                  ? dayjs(detailData.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text>{t('common.noData')}</Text>
          )}
        </Modal>
      </PageContent>
    </App>
  )
}
