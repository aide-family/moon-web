import React, { useEffect, useState } from 'react'

import { useForm } from 'antd/es/form/Form'
import { StatusBadge, UserAvatar, Username } from './option'
import {
  SearchUsersParams,
  UserItem,
  searchUsers,
} from '@/api/authorization/user'
import {
  Gender,
  GenderData,
  PaginationReply,
  Status,
  StatusData,
  SystemRole,
  SystemRoleData,
} from '@/api/global'
import { AutoTable, AutoTableColumnType } from '@/components/table'
import { Button, Form, Input, Radio, Select, Space, theme } from 'antd'

import './index.scss'

export interface UsersProps {}

const { useToken } = theme

const defaultSearchParams: SearchUsersParams = {
  pagination: {
    pageNum: 1,
    pageSize: 10,
  },
  keyword: '',
  status: Status.ENABLE,
  gender: Gender.ALL,
  role: SystemRole.ROLE_ALL,
}

let searchTimeout: NodeJS.Timeout | null = null
const Users: React.FC<UsersProps> = () => {
  const { token } = useToken()
  const [searchForm] = useForm<SearchUsersParams>()
  const [users, setUsers] = useState<UserItem[]>([])
  const [page, setPage] = useState<PaginationReply>(
    defaultSearchParams.pagination
  )
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] =
    useState<SearchUsersParams>(defaultSearchParams)

  const usersColumns: AutoTableColumnType<UserItem>[] = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      align: 'center',
      width: 100,
      render: (_: string, item: UserItem) => {
        return <UserAvatar {...item} />
      },
    },
    {
      title: '姓名',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (_: string, record: UserItem) => {
        return <Username {...record} />
      },
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 200,
      ellipsis: true,
      render: (text: string) => {
        return <>{text || '-'}</>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (_: string, record: UserItem) => {
        return <StatusBadge {...record} />
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 200,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 300,
    },
    {
      title: '个人说明',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (_: string, record: UserItem) => {
        return (
          <Space size={8}>
            <Button
              size='small'
              type='link'
              onClick={() => showUserDetail(record)}
            >
              详情
            </Button>
            <Button size='small' type='link' onClick={openEditModal}>
              编辑
            </Button>
          </Space>
        )
      },
    },
  ]

  function showUserDetail(record: UserItem) {
    console.log(record)
  }

  function openEditModal() {
    console.log('openEditModal')
  }

  function getUsers() {
    setLoading(true)
    searchUsers(searchParams)
      .then((res) => {
        setUsers(res.list || [])
        setPage(res.pagination)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function handleSearch() {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      getUsers()
    }, 500)
  }

  useEffect(() => {
    handleSearch()
  }, [searchParams])

  return (
    <div className='userBox' style={{ height: '100%' }}>
      <div style={{ background: token.colorBgContainer }} className='padding'>
        <Form
          form={searchForm}
          layout='inline'
          initialValues={searchParams}
          onValuesChange={() =>
            setSearchParams({
              ...searchParams,
              ...searchForm.getFieldsValue(),
            })
          }
        >
          <Form.Item name='keyword' label='模糊查询'>
            <Input allowClear placeholder='模糊查询' style={{ width: 400 }} />
          </Form.Item>
          <Form.Item name='status' label='状态'>
            <Radio.Group
              optionType='button'
              options={Object.entries(StatusData).map(([key, value]) => {
                return {
                  label: value.text,
                  value: Number(key),
                }
              })}
            />
          </Form.Item>
          <Form.Item name='gender' label='性别'>
            <Radio.Group
              optionType='button'
              options={Object.entries(GenderData).map(([key, value]) => {
                return {
                  label: value,
                  value: Number(key),
                }
              })}
            />
          </Form.Item>
          <Form.Item name='role' label='角色'>
            <Select
              // mode='tags'
              style={{ width: 150 }}
              options={Object.entries(SystemRoleData).map(([key, value]) => {
                return {
                  label: value,
                  value: Number(key),
                }
              })}
            />
          </Form.Item>
        </Form>
      </div>

      <div style={{ background: token.colorBgContainer }}>
        <AutoTable
          size='middle'
          loading={loading}
          dataSource={users}
          columns={usersColumns}
          rowKey={(record) => record.id}
          scroll={{ y: 'calc(100vh - 200px)', x: true }}
          pagination={{
            total: page?.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, size) => {
              setSearchParams({
                ...searchParams,
                pagination: {
                  pageNum: p,
                  pageSize: size,
                },
              })
            },
          }}
        />
      </div>
    </div>
  )
}

export default Users
