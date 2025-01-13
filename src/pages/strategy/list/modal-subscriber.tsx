import { NotifyType } from '@/api/enum'
import { StrategySubscriberItem, UserItem } from '@/api/model-types'
import { getStrategySubscriber, StrategySubscriberRequest } from '@/api/subscriber'
import AutoTable from '@/components/table'
import { useRequest } from 'ahooks'
import { Avatar, Checkbox, Modal, ModalProps, theme } from 'antd'
import { useEffect, useState } from 'react'

export interface ModalSubscriberProps extends ModalProps {
  strategyId?: number
  onClose: () => void
}

const { useToken } = theme

export default function ModalSubscriber({ open, strategyId = 0, onClose, ...reset }: ModalSubscriberProps) {
  const { token } = useToken()
  const [datasource, setDatasource] = useState<StrategySubscriberItem[]>([])
  const [total, setTotal] = useState(0)
  const { run: initStrategySubscriber, loading } = useRequest(getStrategySubscriber, {
    manual: true,
    onSuccess: (res) => {
      setDatasource(res.subscribers)
      setTotal(res.pagination.total)
    }
  })
  const [searchParams, setSearchParams] = useState<StrategySubscriberRequest>({
    strategyId: strategyId,
    pagination: { pageNum: 1, pageSize: 100 }
  })

  useEffect(() => {
    if (strategyId && open) {
      initStrategySubscriber({ ...searchParams, strategyId })
    }
  }, [strategyId, open, initStrategySubscriber, searchParams])

  const columns = [
    {
      title: '用户名',
      dataIndex: 'user',
      key: 'user',
      render: (user: UserItem) => {
        return (
          <div>
            <Avatar src={user.avatar} size={24} className='mr-2'>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <span className='ml-2'>{`${user.name} (${user.nickname})`}</span>
          </div>
        )
      }
    },
    {
      title: '通知类型',
      dataIndex: 'notifyType',
      key: 'notifyType',
      render: (notifyType: NotifyType) => {
        const checkedList: NotifyType[] = []
        if (notifyType & NotifyType.NOTIFY_PHONE) {
          checkedList.push(NotifyType.NOTIFY_PHONE)
        }
        if (notifyType & NotifyType.NOTIFY_EMAIL) {
          checkedList.push(NotifyType.NOTIFY_EMAIL)
        }
        if (notifyType & NotifyType.NOTIFY_SMS) {
          checkedList.push(NotifyType.NOTIFY_SMS)
        }
        return (
          <Checkbox.Group
            value={checkedList}
            options={[
              { label: '手机', value: NotifyType.NOTIFY_PHONE },
              { label: '邮件', value: NotifyType.NOTIFY_EMAIL },
              { label: '短信', value: NotifyType.NOTIFY_SMS }
            ]}
          />
        )
      }
    }
  ]

  // 切换分页
  const handleTurnPage = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pagination: {
        pageNum: page,
        pageSize: pageSize
      }
    })
  }

  return (
    <Modal title='订阅者' open={open} onClose={onClose} onCancel={onClose} footer={null} loading={loading} {...reset}>
      <AutoTable
        rowKey={(record) => record.id}
        dataSource={datasource}
        total={total}
        loading={loading}
        columns={columns}
        handleTurnPage={handleTurnPage}
        pageSize={searchParams.pagination.pageSize}
        pageNum={searchParams.pagination.pageNum}
        showSizeChanger={true}
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
        scroll={{
          y: 500,
          x: 1000
        }}
        size='middle'
      />
    </Modal>
  )
}
