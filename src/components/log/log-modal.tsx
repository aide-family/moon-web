import { LogActionTypeData } from '@/api/global'
import { LogItem } from '@/api/log'
import { ListResourceRequest } from '@/api/resource'
import { Button, Modal, Timeline } from 'antd'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import LogDetailModal from './log-detail-modal'

interface LogModalProps {
  open: boolean
  onCancel: () => void
}
const defaultSearchParams: ListResourceRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  }
}

const LogModal: React.FC<LogModalProps> = ({ open, onCancel }) => {
  const [logData, setLogData] = useState<LogItem[]>([])
  const [searchParams, setSearchParams] = useState<ListResourceRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<LogItem | null>(null)
  const handleShowLogDetail = (record: LogItem) => {
    setSelectedRecord(record)
    setIsModalVisible(true)
  }
  const handleHideModal = () => {
    setIsModalVisible(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await axios.post('/api/logs', searchParams)
        console.log(res.data, 'res.data')
        if (searchParams.pagination.pageNum === 1) {
          setLogData(res.data.list)
        } else {
          setLogData((prevData) => [...prevData, ...res.data.list])
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
          setSearchParams((prevParams) => ({
            ...prevParams,
            pagination: {
              ...prevParams.pagination,
              pageNum: prevParams.pagination.pageNum + 1
            }
          }))
        }
      }
    }

    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [loading])

  return (
    <Modal title='日志变更记录' open={open} onCancel={onCancel} footer={null} width={'80%'}>
      <div className='h-[70vh] overflow-auto p-3 pl-8' ref={containerRef}>
        <Timeline>
          {logData.map((item, index) => (
            <Timeline.Item key={index}>
              <div className='flex items-center gap-3'>
                <span className='text-base font-bold '>{LogActionTypeData[item.action]}</span>
                <span>{item.operateTime} </span>
                <Button variant='filled' color='primary' size='small'>
                  {item.operator.name}
                </Button>
              </div>
              {item.remark}{' '}
              <Button variant='link' color='primary' size='small' onClick={() => handleShowLogDetail(item)}>
                查看明细
              </Button>
            </Timeline.Item>
          ))}
          {loading && <Timeline.Item>Loading...</Timeline.Item>}
        </Timeline>
      </div>
      <LogDetailModal open={isModalVisible} onCancel={handleHideModal} record={selectedRecord} />
    </Modal>
  )
}

export default LogModal
