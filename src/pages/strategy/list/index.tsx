import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { StrategyGroupItem } from '@/api/model-types'
import {
  ListStrategyGroupRequest,
  deleteStrategyGroup,
  listStrategyGroup,
  updateStrategyGroupStatus,
  type ListStrategyRequest
} from '@/api/strategy'
import { ExclamationCircleFilled, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Badge, Button, Dropdown, Input, MenuProps, Modal, Spin, message, theme } from 'antd'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { GroupEditModal } from '../group/group-edit-modal'
import StrategyList from './strategy-list'

const { confirm } = Modal

const defaultSearchParams: ListStrategyRequest = {
  keyword: '',
  pagination: {
    pageNum: 1,
    pageSize: 20
  }
}

const StrategyMetric: React.FC = () => {
  const [strategyGroups, setStrategyGroups] = useState<StrategyGroupItem[]>([])
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]) // 存储选中的策略组
  const { token } = theme.useToken() // 获取主题变量
  const [searchParams, setSearchParams] = useState<ListStrategyGroupRequest>(defaultSearchParams)
  const [total, setTotal] = useState(0)
  const listRef = useRef<HTMLDivElement>(null) // 列表容器的引用
  const [openGroupEditModal, setOpenGroupEditModal] = useState(false) // 编辑策略组模态框的显示状态
  const [editGroupId, setEditGroupId] = useState<number>() // 模态框策略组Id
  const [disabledEditGroupModal, setDisabledEditGroupModal] = useState(false) // 编辑模态框是否禁用

  // 处理策略组点击事件
  const handleGroupClick = (item: StrategyGroupItem) => {
    if (selectedGroups.includes(item.id)) {
      // 如果已选中，则取消选中
      setSelectedGroups(selectedGroups.filter((group) => group !== item.id))
    } else {
      // 如果未选中，则添加到选中列表
      setSelectedGroups([...selectedGroups, item.id])
    }
  }

  const { run: fetchData, loading: loading } = useRequest(listStrategyGroup, {
    manual: true,
    onSuccess: (res) => {
      // 保留之前选中的策略组
      const newStrategyGroups = res.list || []
      setStrategyGroups(newStrategyGroups)

      // 过滤掉已经不存在的策略组
      const updatedSelectedGroups = selectedGroups.filter((groupId) =>
        newStrategyGroups.some((group) => group.id === groupId)
      )
      setSelectedGroups(updatedSelectedGroups)

      setTotal(res.pagination?.total || 0)
    }
  })
  // 处理搜索事件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPressEnter = (e: any) => {
    setSearchParams({
      ...searchParams,
      keyword: e.target.value
    })
  }
  //关闭编辑页面
  const handleCloseGroupEditModal = () => {
    setOpenGroupEditModal(false)
    setEditGroupId(0)
    setDisabledEditGroupModal(false)
  }

  // 编辑策略组
  const handleEditModal = (editId?: number) => {
    setEditGroupId(editId)
    setOpenGroupEditModal(true)
  }

  // 打开详情页面
  const handleOpenDetailModal = (groupId: number) => {
    setEditGroupId(groupId)
    setOpenGroupEditModal(true)
    setDisabledEditGroupModal(true)
  }

  // 确定后关闭编辑页面
  const handleOnOKGroupEditModal = () => {
    handleCloseGroupEditModal()
    onRefresh()
  }
  // 刷新列表
  const onRefresh = () => {
    fetchData(searchParams)
    console.log(selectedGroups, 'sel刷新列表ectedGroups')
  }

  // 策略组操作菜单点击事件
  const onHandleMenuOnClick = (item: StrategyGroupItem, key: ActionKey) => {
    console.log(item, key)
    switch (key) {
      case ActionKey.ENABLE:
        updateStrategyGroupStatus({
          ids: [item.id],
          status: Status.StatusEnable
        }).then(() => {
          message.success('更改状态成功')
          console.log('状态更新成功，重新获取数据')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        updateStrategyGroupStatus({
          ids: [item.id],
          status: Status.StatusDisable
        }).then(() => {
          message.success('更改状态成功')
          console.log('状态更新成功，重新获取数据')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetailModal(item.id)
        break
      case ActionKey.EDIT:
        handleEditModal(item.id)
        break
      case ActionKey.DELETE:
        confirm({
          title: '请确认是否删除该策略组?',
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            deleteStrategyGroup({ id: item.id }).then(() => {
              message.success('删除成功')
              onRefresh()
            })
          },
          onCancel() {
            message.info('取消操作')
          }
        })
        break
    }
  } // 策略组操作菜单

  const tableOperationItems = (record: StrategyGroupItem): MenuProps['items'] => [
    record.status === Status.StatusDisable
      ? {
          key: ActionKey.ENABLE,
          label: (
            <Button type='link' size='small'>
              启用
            </Button>
          )
        }
      : {
          key: ActionKey.DISABLE,
          label: (
            <Button type='link' size='small' danger>
              禁用
            </Button>
          )
        },
    {
      key: ActionKey.DETAIL,
      label: (
        <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
          详情
        </Button>
      )
    },

    {
      key: ActionKey.EDIT,
      label: (
        <Button size='small' type='link'>
          编辑
        </Button>
      )
    },
    {
      key: ActionKey.DELETE,
      label: (
        <Button type='link' size='small' danger>
          删除
        </Button>
      )
    }
  ]

  // 监听滚动事件
  useEffect(() => {
    const listElement = listRef.current
    const handleScroll = () => {
      if (listElement && !loading) {
        const { scrollTop, scrollHeight, clientHeight } = listElement // 判断是否滚动到底部
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          // 加载下一页
          setSearchParams({
            ...searchParams,
            pagination: { pageNum: searchParams.pagination.pageNum + 1, pageSize: searchParams.pagination.pageSize }
          })
        }
      }
    }

    if (listElement) {
      listElement.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [loading]) // 初始化加载数据

  useEffect(() => {
    fetchData(searchParams)
    console.log(searchParams, 'searchParams')
  }, [searchParams, fetchData])

  return (
    <div className='flex gap-3 p-3 w-full h-full '>
      <GroupEditModal
        title={editGroupId ? (disabledEditGroupModal ? '分组详情' : '编辑分组') : '新建分组'}
        width='40%'
        style={{ minWidth: 504 }}
        open={openGroupEditModal}
        onCancel={handleCloseGroupEditModal}
        onOk={handleOnOKGroupEditModal}
        groupId={editGroupId}
        disabled={disabledEditGroupModal}
      />
      <div
        className='w-[19%] p-3'
        style={{ backgroundColor: token.colorBgContainer, borderRadius: token.borderRadius, minWidth: '240px' }}
      >
        <div className='flex gap-2 mb-2'>
          <Input placeholder='搜索策略组' className='flex-1' onPressEnter={onPressEnter} />
          <Button type='primary' onClick={() => handleEditModal()} icon={<PlusOutlined />}></Button>
        </div>
        <div className='flex justify-between items-center mb-2 h-8'>
          <div className='text-sm text-gray-500'>
            共<span style={{ color: token.colorPrimary }}>{total}</span>个策略组 已选中
            <span style={{ color: token.colorPrimary }}>{selectedGroups.length}</span>
          </div>
          {selectedGroups.length > 0 && (
            <Button type='link' onClick={() => setSelectedGroups([])}>
              清空
            </Button>
          )}
        </div>
        <div className=' space-y-1 h-[90%] overflow-y-auto ' ref={listRef}>
          {strategyGroups.map((item: StrategyGroupItem) => (
            <div
              key={item.id}
              className='flex gap-1 text-left p-2 rounded cursor-pointer text-sm items-center '
              style={{
                backgroundColor: selectedGroups.includes(item.id)
                  ? token.colorPrimaryBg
                  : token.colorBgContainerDisabled,
                color: selectedGroups.includes(item.id) ? token.colorPrimary : token.colorText
              }}
            >
              <div className='flex gap-2 flex-1' onClick={() => handleGroupClick(item)}>
                <Badge status={item.status === Status.StatusEnable ? 'success' : 'error'} />
                <div>
                  [<span className='text-green-500'>{item.enableStrategyCount}</span>/
                  <span className='text-red-500'>{item.strategyCount}</span>]
                </div>
                <div className='w-[60%] overflow-hidden whitespace-nowrap overflow-ellipsis'>{item.name}</div>
              </div>
              <Dropdown
                menu={{
                  items: tableOperationItems(item),
                  onClick: ({ key }) => {
                    onHandleMenuOnClick(item, key as ActionKey)
                  }
                }}
                trigger={['click']}
              >
                <div
                  className='ml-auto text-lg '
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: token.colorPrimary }}
                >
                  <MoreOutlined />
                </div>
              </Dropdown>
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Spin />
            </div>
          )}
        </div>
      </div>
      <div className='w-[80%] ' style={{ backgroundColor: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <StrategyList selectedGroups={selectedGroups} />
      </div>
    </div>
  )
}

export default StrategyMetric
