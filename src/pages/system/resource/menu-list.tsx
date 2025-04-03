import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { MenuItem } from '@/api/model-types'
import { type ListResourceRequest, batchUpdateResourceStatus } from '@/api/resource'
import AuthButton from '@/components/authButton'
import SearchBox from '@/components/data/search-box'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { getTreeMenu } from '@/mocks'
import { GlobalContext } from '@/utils/context'
import { SwapOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Space, Table, message, theme } from 'antd'
import type React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import MenuEditModal from './menu-edit-modal'
import { formList, getMenuColumnList } from './options'
import { permission } from './permission'

const { useToken } = theme

const defaultSearchParams: ListResourceRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  status: Status.StatusAll
}
export interface MenuListProps {
  switchMenuList: () => void
}

const MenuList: React.FC<MenuListProps> = ({ switchMenuList }) => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<MenuItem[]>([])
  const [searchParams, setSearchParams] = useState<ListResourceRequest>(defaultSearchParams)
  const [openMenuEditModal, setOpenMenuEditModal] = useState(false)
  const [editMenuId, setEditMenuId] = useState<number>()
  const [disabledEditMenuModal, setDisabledEditMenuModal] = useState(false)
  const [menuAction, setMenuAction] = useState<ActionKey>(ActionKey.ADD)
  const [menuTitle, setMenuTitle] = useState('新增菜单')

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const { run: initResourceDetail, loading: initResourceDetailLoading } = useRequest(getTreeMenu, {
    manual: true,
    onSuccess: (data) => {
      setDatasource(data.menuTree || [])
      console.log(data, 'data')
      // setTotal(data.pagination?.total || 0)
    }
  })

  const handleCloseMenuEditModal = () => {
    setOpenMenuEditModal(false)
    setEditMenuId(0)
    setDisabledEditMenuModal(false)
    console.log('handleCloseMenuEditModal')
  }

  const handleOpenDetailModal = (menuId: number) => {
    setEditMenuId(menuId)
    setOpenMenuEditModal(true)
    setDisabledEditMenuModal(true)
  }

  const onRefresh = () => {
    initResourceDetail(searchParams)
  }

  useEffect(() => {
    initResourceDetail(searchParams)
  }, [searchParams])

  const onSearch = (formData: ListResourceRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams.pagination.pageSize
      }
    })
  }

  // 重置
  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  const onHandleMenuOnClick = (item: MenuItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ADD:
        setOpenMenuEditModal(true)
        setEditMenuId(item.id)
        setMenuAction(key)
        setDisabledEditMenuModal(false)
        setMenuTitle('新增菜单')
        break
      case ActionKey.EDIT:
        setOpenMenuEditModal(true)
        handleOpenDetailModal(item.id)
        setMenuAction(key)
        setDisabledEditMenuModal(false)
        setMenuTitle('编辑菜单')
        break
      case ActionKey.ENABLE:
        batchUpdateResourceStatus({ ids: [item.id], status: Status.StatusEnable }, true).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        batchUpdateResourceStatus({ ids: [item.id], status: Status.StatusDisable }, true).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetailModal(item.id)
        setMenuTitle('菜单详情')
        break
    }
  }

  const columns = getMenuColumnList({
    onHandleMenuOnClick
  })

  const handleOKMenuEditModal = () => {
    setOpenMenuEditModal(false)
    onRefresh()
  }

  return (
    <div className='p-3 gap-3 flex flex-col'>
      <MenuEditModal
        key={editMenuId}
        title={menuTitle}
        open={openMenuEditModal}
        onCancel={handleCloseMenuEditModal}
        onOk={handleOKMenuEditModal}
        menuId={editMenuId}
        disabled={disabledEditMenuModal}
        action={menuAction}
        width={'60%'}
      />

      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
      </div>
      <div
        className='p-3'
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <div className='flex justify-between'>
          <div className='flex items-center gap-2'>
            <div className='text-lg font-bold flex items-center gap-2'>菜单管理</div>
            <Button type='link' onClick={switchMenuList}>
              <SwapOutlined />
            </Button>
            <div
              className='text-lg font-bold text-slate-400 cursor-pointer hover:text-purple-500'
              onClick={switchMenuList}
            >
              API管理
            </div>
          </div>
          <Space size={8}>
            <AuthButton requiredPermissions={permission.menu.add}>
              <Button color='primary' variant='filled' onClick={() => setOpenMenuEditModal(true)}>
                新增
              </Button>
            </AuthButton>
            <AuthButton requiredPermissions={permission.menu.query}>
              <Button color='default' variant='filled' onClick={onRefresh}>
                刷新
              </Button>
            </AuthButton>
          </Space>
        </div>
        <div className='mt-4' ref={ADivRef}>
          <Table
            rowKey={(record) => record.id}
            dataSource={datasource}
            loading={initResourceDetailLoading}
            columns={columns}
            pagination={false}
            style={{
              background: token.colorBgContainer,
              borderRadius: token.borderRadius
            }}
            scroll={{
              y: `calc(100vh - 174px - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          />
        </div>
      </div>
    </div>
  )
}

export default MenuList
